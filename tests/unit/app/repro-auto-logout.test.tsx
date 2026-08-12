import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useAuthStore } from '@/stores/auth.store';

type MockUser = { uid: string } | null;
type AuthCallback = (user: MockUser) => void;

// vi.mock() factories are hoisted above all other code in this file, so
// anything they reference must itself be created via vi.hoisted() to avoid
// "Cannot access before initialization".
const { mockPush, mockReplace, mockOnAuthStateChanged, mockAuthObject, capturedCallbackRef } = vi.hoisted(() => {
  return {
    mockPush: vi.fn(),
    mockReplace: vi.fn(),
    capturedCallbackRef: { current: null as AuthCallback | null },
    mockOnAuthStateChanged: vi.fn(),
    mockAuthObject: {
      currentUser: null as MockUser,
      authStateReady: vi.fn(() => Promise.resolve()),
    },
  };
});

mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: AuthCallback) => {
  capturedCallbackRef.current = cb;
  return () => {
    capturedCallbackRef.current = null;
  };
});

// Avoids `capturedCallbackRef.current!(...)` (forbidden non-null-assertion
// in this codebase's lint rules) at every call site — throws a clear
// message if the test forgot to wait for the callback to be captured
// first, instead of a silent `!` that would just be a TypeError with no
// context.
function fireAuthCallback(user: MockUser): void {
  if (!capturedCallbackRef.current) {
    throw new Error('fireAuthCallback() called before onAuthStateChanged callback was captured — await waitFor(...) first');
  }
  capturedCallbackRef.current(user);
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/dashboard',
}));

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    onAuthStateChanged: (auth: unknown, cb: AuthCallback) => mockOnAuthStateChanged(auth, cb),
  };
});

vi.mock('@/lib/firebase', () => ({ auth: mockAuthObject }));
global.fetch = vi.fn().mockResolvedValue({ ok: true });

import ProtectedLayout from '@/app/(protected)/layout';

describe('ProtectedLayout — reproduksi & fix: auto-logout tak menentu saat Firebase masih memuat sesi tersimpan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: AuthCallback) => {
      capturedCallbackRef.current = cb;
      return () => {
        capturedCallbackRef.current = null;
      };
    });
    mockAuthObject.authStateReady.mockImplementation(() => Promise.resolve());
    mockAuthObject.currentUser = null;
    useAuthStore.setState({ user: null, isLoading: true, isAuthenticated: false });
  });

  it('FIX VERIFIED: onAuthStateChanged null (initial, SDK masih checking) LALU user valid — TIDAK boleh redirect ke login', async () => {
    render(<ProtectedLayout>{<div>Protected content</div>}</ProtectedLayout>);

    await waitFor(() => expect(capturedCallbackRef.current).not.toBeNull());

    // Firebase's documented startup behavior: the callback can fire once
    // immediately with null (before IndexedDB has finished being read),
    // then fire again with the real persisted user once that read
    // completes. Real-world reports (cited in README.md) show this second
    // callback arriving anywhere from milliseconds to 20-30+ seconds later
    // depending on device/network conditions.
    mockAuthObject.currentUser = null;
    fireAuthCallback(null);

    // authStateReady() resolving is what the fix waits on before trusting
    // that first null — simulate it resolving AFTER the real user has
    // actually been confirmed (mockAuthObject.currentUser updated first).
    mockAuthObject.currentUser = { uid: 'user-1' };
    fireAuthCallback({ uid: 'user-1' });

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('FIX VERIFIED: onAuthStateChanged null dan TETAP null setelah authStateReady() — user benar-benar tidak login, HARUS redirect', async () => {
    render(<ProtectedLayout>{<div>Protected content</div>}</ProtectedLayout>);
    await waitFor(() => expect(capturedCallbackRef.current).not.toBeNull());

    // Genuinely logged-out visitor: currentUser stays null even after
    // authStateReady() resolves.
    mockAuthObject.currentUser = null;
    fireAuthCallback(null);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('REGRESSION GUARD: user valid dulu, LALU null setelahnya (genuine sign-out) — HARUS tetap redirect segera, tanpa menunggu authStateReady() lagi', async () => {
    render(<ProtectedLayout>{<div>Protected content</div>}</ProtectedLayout>);
    await waitFor(() => expect(capturedCallbackRef.current).not.toBeNull());

    // First: a confirmed, genuine sign-in.
    mockAuthObject.currentUser = { uid: 'user-1' };
    fireAuthCallback({ uid: 'user-1' });
    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));

    expect(mockReplace).not.toHaveBeenCalled();

    // Then: a genuine sign-out (token revoked, signed out elsewhere, etc.)
    // — this null is AFTER a real session was already confirmed, so it
    // must redirect immediately, same as the original (pre-fix) behavior.
    mockAuthObject.currentUser = null;
    fireAuthCallback(null);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });
});
