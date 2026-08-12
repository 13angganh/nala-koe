import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockSearchParamsGet = vi.fn(() => null);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: mockRefresh }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

const { mockLoginWithEmail, mockLoginWithGoogle } = vi.hoisted(() => ({
  mockLoginWithEmail: vi.fn(),
  mockLoginWithGoogle: vi.fn(),
}));
vi.mock('@/services/auth.service', () => ({
  loginWithEmail: mockLoginWithEmail,
  loginWithGoogle: mockLoginWithGoogle,
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    getIdToken: vi.fn().mockResolvedValue('fake-id-token'),
  };
});
vi.mock('@/lib/firebase', () => ({ auth: { currentUser: { uid: 'user-1' } } }));

global.fetch = vi.fn();

import LoginPage from '@/app/(auth)/login/page';

describe('LoginPage — fix: cookie race condition ("login macet, hanya muter")', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginWithEmail.mockResolvedValue({ data: { uid: 'user-1' }, error: null });
    vi.mocked(global.fetch).mockResolvedValue({ ok: true } as Response);
  });

  it('FIX: session cookie POST GAGAL (response.ok === false) — TIDAK boleh navigasi diam-diam, harus tampilkan error', async () => {
    vi.mocked(global.fetch).mockResolvedValue({ ok: false, status: 500 } as Response);
    const user = userEvent.setup();

    render(<LoginPage />);
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/session',
        expect.objectContaining({ method: 'POST' })
      );
    });

    // Previously: router.replace(from) fired regardless of whether the
    // session cookie was actually set, which is the root cause of "login
    // macet" — middleware sees no valid cookie on the next request and
    // bounces back to /login, reading as a silent, unexplained failure.
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('FIX: session cookie POST SUKSES — router.refresh() dipanggil SEBELUM router.replace() (mitigasi cookie race)', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });

    expect(mockRefresh).toHaveBeenCalled();
    // The whole point of the fix: refresh() must happen before replace(),
    // giving the App Router a chance to re-evaluate middleware against the
    // now-committed cookie before navigating away.
    const refreshOrder = mockRefresh.mock.invocationCallOrder[0];
    const replaceOrder = mockReplace.mock.invocationCallOrder[0];
    expect(refreshOrder).toBeLessThan(replaceOrder);
  });
});
