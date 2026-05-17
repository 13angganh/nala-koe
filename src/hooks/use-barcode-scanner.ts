'use client';

import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarcodeResult {
  rawValue: string;
  format: string;
  /** If a product lookup was performed, the resolved name */
  productName: string | null;
}

interface UseBarcodeScannerReturn {
  isSupported: boolean;
  isScanning: boolean;
  result: BarcodeResult | null;
  error: string | null;
  startScan: () => Promise<BarcodeResult | null>;
  stopScan: () => void;
  reset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBarcodeScanner(): UseBarcodeScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /**
   * BarcodeDetector is not available in all browsers.
   * We check at runtime to avoid SSR issues.
   */
  const isSupported =
    typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const stopScan = useCallback(() => {
    abortRef.current?.abort();
    setIsScanning(false);
  }, []);

  const startScan = useCallback(async (): Promise<BarcodeResult | null> => {
    if (!isSupported) {
      setError('Perangkat tidak mendukung pemindai barcode');
      return null;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);

    const abort = new AbortController();
    abortRef.current = abort;

    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (abort.signal.aborted) return null;

      // Dynamic import to avoid SSR + tree-shake if unsupported
      // @ts-expect-error — BarcodeDetector is not in TS DOM lib yet
      const detector = new window.BarcodeDetector({
        formats: [
          'ean_13', 'ean_8', 'code_39', 'code_128',
          'qr_code', 'data_matrix', 'upc_a', 'upc_e',
        ],
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      if (abort.signal.aborted) {
        video.srcObject = null;
        return null;
      }

      // Poll for barcode detection (max 20 frames)
      let detected: BarcodeResult | null = null;
      for (let i = 0; i < 20 && !abort.signal.aborted; i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const barcodes = await (detector as any).detect(video) as Array<{
          rawValue: string;
          format: string;
        }>;

        if (barcodes.length > 0 && barcodes[0]) {
          const first = barcodes[0];
          detected = {
            rawValue: first.rawValue,
            format: first.format,
            productName: null,
          };
          break;
        }

        // Wait ~150ms between frames
        await new Promise<void>((res) => setTimeout(res, 150));
      }

      video.srcObject = null;

      if (detected) {
        setResult(detected);
        return detected;
      }

      setError('Tidak ada barcode terdeteksi. Coba lagi.');
      return null;
    } catch (err) {
      if (abort.signal.aborted) return null;
      const msg = err instanceof Error ? err.message : 'Gagal memindai';
      logger.warn('useBarcodeScanner: scan failed', { error: msg });

      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setError('Izin kamera ditolak. Aktifkan kamera di pengaturan browser.');
      } else {
        setError('Gagal memindai barcode. Coba arahkan kamera ke barcode.');
      }
      return null;
    } finally {
      stream?.getTracks().forEach((t) => t.stop());
      setIsScanning(false);
    }
  }, [isSupported]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { isSupported, isScanning, result, error, startScan, stopScan, reset };
}
