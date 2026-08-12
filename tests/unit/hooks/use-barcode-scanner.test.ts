import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockMediaDevices(streamTracks: Partial<MediaStreamTrack>[] = []) {
  const stop = vi.fn();
  const track = { stop, ...streamTracks[0] } as MediaStreamTrack;
  const stream = { getTracks: vi.fn(() => [track]) } as unknown as MediaStream;

  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(stream),
    },
    writable: true,
    configurable: true,
  });

  return { stream, stop };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useBarcodeScanner', () => {
  beforeEach(() => {
    // Reset BarcodeDetector existence
    // @ts-expect-error — dynamic assignment for test
    delete window.BarcodeDetector;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── isSupported ─────────────────────────────────────────────────────────────

  it('reports isSupported false when BarcodeDetector is absent', () => {
    const { result } = renderHook(() => useBarcodeScanner());
    expect(result.current.isSupported).toBe(false);
  });

  it('reports isSupported true when BarcodeDetector exists', () => {
    // @ts-expect-error — mock
    window.BarcodeDetector = class { detect = vi.fn().mockResolvedValue([]); };
    const { result } = renderHook(() => useBarcodeScanner());
    expect(result.current.isSupported).toBe(true);
  });

  // ── initial state ───────────────────────────────────────────────────────────

  it('starts with idle state', () => {
    const { result } = renderHook(() => useBarcodeScanner());
    expect(result.current.isScanning).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // ── startScan when unsupported ───────────────────────────────────────────────

  it('sets error when startScan called on unsupported browser', async () => {
    const { result } = renderHook(() => useBarcodeScanner());
    await act(async () => { await result.current.startScan(); });
    expect(result.current.error).toBeTruthy();
    expect(result.current.result).toBeNull();
  });

  // ── successful scan ──────────────────────────────────────────────────────────

  it('returns scanned barcode on successful detection', async () => {
    const detected = [{ rawValue: '1234567890123', format: 'ean_13' }];
    // @ts-expect-error — mock
    window.BarcodeDetector = class {
      detect = vi.fn().mockResolvedValue(detected);
    };
    mockMediaDevices();

    // Mock HTMLVideoElement.play
    Object.defineProperty(HTMLVideoElement.prototype, 'play', {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useBarcodeScanner());
    let scanResult: Awaited<ReturnType<typeof result.current.startScan>> = null;

    await act(async () => {
      scanResult = await result.current.startScan();
    });

    expect(scanResult).not.toBeNull();
    expect(scanResult?.rawValue).toBe('1234567890123');
    expect(scanResult?.format).toBe('ean_13');
    expect(result.current.result?.rawValue).toBe('1234567890123');
    expect(result.current.isScanning).toBe(false);
  });

  // ── no barcode found ─────────────────────────────────────────────────────────

  it('sets error when no barcode detected after polling', async () => {
    // @ts-expect-error — mock
    window.BarcodeDetector = class {
      detect = vi.fn().mockResolvedValue([]); // always empty
    };
    mockMediaDevices();

    Object.defineProperty(HTMLVideoElement.prototype, 'play', {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });

    // Speed up: replace setTimeout to resolve instantly
    vi.useFakeTimers();

    try {
      const { result } = renderHook(() => useBarcodeScanner());
      let scanPromise: ReturnType<typeof result.current.startScan>;

      act(() => {
        scanPromise = result.current.startScan();
      });

      // The hook's polling loop alternates `await detector.detect(video)`
      // (a resolved-promise microtask) with `await new Promise(res =>
      // setTimeout(res, 150))` (a macrotask) on every one of its 20
      // iterations. The synchronous vi.advanceTimersByTime only fast-
      // forwards the fake clock — it does not drain the microtask queue
      // in between each tick, so a chain that keeps handing control back
      // and forth between promises and timers stalls partway through and
      // the awaited scanPromise below never settles, which is what was
      // timing out this test (and, by leaving fake timers active past
      // the test's lifetime, corrupting the two tests that ran after it).
      // advanceTimersByTimeAsync flushes microtasks between each timer
      // tick, which is what this loop shape needs. Confirmed directly in
      // Vitest's own docs, which use this same
      // setInterval+Promise.resolve().then() shape as the canonical
      // example for why the Async variant exists.
      //
      // Wrapped in act(): the hook's setError()/setResult() calls that
      // happen as the loop finishes need to be flushed into a React
      // render before we read result.current below — advanceTimersByTimeAsync
      // resolves the timers/promises themselves, but act() is what tells
      // React it's safe to commit the state updates that followed.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(20 * 150 + 100);
        await scanPromise;
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.result).toBeNull();
    } finally {
      // try/finally (rather than a bare trailing call) so that if this
      // test's assertions ever fail again in the future, useRealTimers()
      // still runs — a failure here won't leave fake timers active and
      // corrupt the tests that run after it, the way the un-guarded
      // version did.
      vi.useRealTimers();
    }
  });

  // ── reset ────────────────────────────────────────────────────────────────────

  it('reset clears result and error', async () => {
    const { result } = renderHook(() => useBarcodeScanner());
    // Force an error state first
    await act(async () => { await result.current.startScan(); });
    expect(result.current.error).toBeTruthy();

    act(() => result.current.reset());
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // ── stopScan ────────────────────────────────────────────────────────────────

  it('stopScan sets isScanning to false', () => {
    const { result } = renderHook(() => useBarcodeScanner());
    act(() => result.current.stopScan());
    expect(result.current.isScanning).toBe(false);
  });
});
