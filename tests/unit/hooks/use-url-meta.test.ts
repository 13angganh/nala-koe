import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUrlMeta } from '@/hooks/use-url-meta';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_META = {
  url: 'https://example.com/article',
  title: 'Judul Artikel',
  description: 'Deskripsi singkat dari artikel ini.',
  image: 'https://example.com/og.jpg',
  siteName: 'Contoh',
  favicon: 'https://example.com/favicon.ico',
};

function mockFetchSuccess() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(MOCK_META),
  } as unknown as Response);
}

function mockFetchError(status = 500) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
  } as unknown as Response);
}

function mockFetchThrow() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useUrlMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── initial state ────────────────────────────────────────────────────────────

  it('starts with null meta, not fetching, no error', () => {
    const { result } = renderHook(() => useUrlMeta());
    expect(result.current.meta).toBeNull();
    expect(result.current.isFetching).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // ── fetchMeta — invalid URL ──────────────────────────────────────────────────

  it('returns null and sets error for invalid URL', async () => {
    const { result } = renderHook(() => useUrlMeta());
    let returned: Awaited<ReturnType<typeof result.current.fetchMeta>>;

    await act(async () => {
      returned = await result.current.fetchMeta('not-a-url');
    });

    expect(returned!).toBeNull();
    expect(result.current.error).toBeTruthy();
    expect(result.current.meta).toBeNull();
  });

  it('rejects non-http protocols', async () => {
    const { result } = renderHook(() => useUrlMeta());
    let returned: Awaited<ReturnType<typeof result.current.fetchMeta>>;

    await act(async () => {
      returned = await result.current.fetchMeta('ftp://example.com');
    });

    expect(returned!).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  // ── fetchMeta — success ──────────────────────────────────────────────────────

  it('returns meta and sets state on success', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() => useUrlMeta());
    let returned: Awaited<ReturnType<typeof result.current.fetchMeta>>;

    await act(async () => {
      returned = await result.current.fetchMeta('https://example.com/article');
    });

    expect(returned).toEqual(MOCK_META);
    expect(result.current.meta).toEqual(MOCK_META);
    expect(result.current.error).toBeNull();
    expect(result.current.isFetching).toBe(false);
  });

  it('calls fetch with encoded URL', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() => useUrlMeta());

    await act(async () => {
      await result.current.fetchMeta('https://example.com/path?q=hello world');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('https://example.com/path?q=hello world')),
      expect.any(Object)
    );
  });

  // ── fetchMeta — HTTP error ───────────────────────────────────────────────────

  it('sets error on non-ok HTTP response', async () => {
    mockFetchError(502);
    const { result } = renderHook(() => useUrlMeta());

    await act(async () => {
      await result.current.fetchMeta('https://example.com');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.meta).toBeNull();
  });

  // ── fetchMeta — network error ────────────────────────────────────────────────

  it('sets error on network failure', async () => {
    mockFetchThrow();
    const { result } = renderHook(() => useUrlMeta());

    await act(async () => {
      await result.current.fetchMeta('https://example.com');
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.meta).toBeNull();
  });

  // ── isFetching ───────────────────────────────────────────────────────────────

  it('sets isFetching to true while in-flight', async () => {
    let resolveFetch!: (value: unknown) => void;
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => { resolveFetch = resolve; })
    );

    const { result } = renderHook(() => useUrlMeta());
    let fetchPromise: Promise<unknown>;

    act(() => {
      fetchPromise = result.current.fetchMeta('https://example.com');
    });

    expect(result.current.isFetching).toBe(true);

    await act(async () => {
      resolveFetch({ ok: false, status: 500 });
      await fetchPromise;
    });

    expect(result.current.isFetching).toBe(false);
  });

  // ── reset ────────────────────────────────────────────────────────────────────

  it('reset clears meta and error', async () => {
    mockFetchSuccess();
    const { result } = renderHook(() => useUrlMeta());

    await act(async () => {
      await result.current.fetchMeta('https://example.com');
    });
    expect(result.current.meta).not.toBeNull();

    act(() => result.current.reset());
    expect(result.current.meta).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
