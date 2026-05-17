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

    const { result } = renderHook(() => useBarcodeScanner());
    let scanPromise: ReturnType<typeof result.current.startScan>;

    act(() => {
      scanPromise = result.current.startScan();
    });

    // Advance through all 20 polling intervals (150ms each)
    await act(async () => {
      vi.advanceTimersByTime(20 * 150 + 100);
      await scanPromise;
    });

    vi.useRealTimers();

    expect(result.current.error).toBeTruthy();
    expect(result.current.result).toBeNull();
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
