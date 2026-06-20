'use client';

import { useCallback } from 'react';
import { ScanBarcode, Loader2, AlertCircle, CheckCircle2, X, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteBarcodeScannerProps {
  /** Called when a barcode is successfully scanned; passes the raw value */
  onScanned: (value: string, format: string) => void;
  /** Show as inline panel vs floating trigger */
  variant?: 'inline' | 'trigger';
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteBarcodeScanner({
  onScanned,
  variant = 'trigger',
  className,
}: NoteBarcodeScannerProps) {
  const { isSupported, isScanning, result, error, startScan, stopScan, reset } =
    useBarcodeScanner();

  const handleScan = useCallback(async () => {
    const scanned = await startScan();
    if (scanned) {
      onScanned(scanned.rawValue, scanned.format);
    }
  }, [startScan, onScanned]);

  const handleCopy = useCallback(() => {
    if (!result?.rawValue) return;
    void navigator.clipboard.writeText(result.rawValue).then(() => {
      toast.success('Disalin ke clipboard');
    });
  }, [result]);

  if (!isSupported) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border border-[var(--border)]',
          'bg-[var(--surface-subtle)] px-3 py-2 text-xs text-[var(--text-tertiary)]',
          className
        )}
        role="note"
        aria-label="Scanner tidak didukung"
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Pemindai barcode tidak didukung di browser ini.
      </div>
    );
  }

  // ── Trigger variant ────────────────────────────────────────────────────────
  if (variant === 'trigger') {
    return (
      <div className={cn('space-y-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleScan()}
          disabled={isScanning}
          className="h-8 gap-2 text-xs"
          aria-label={isScanning ? 'Sedang memindai barcode…' : 'Pindai barcode'}
        >
          {isScanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <ScanBarcode className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isScanning ? 'Memindai…' : 'Pindai Barcode'}
          {isScanning && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); stopScan(); }}
              aria-label="Hentikan pemindaian"
              className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none rounded"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Button>

        {/* Scan result */}
        {result && (
          <div
            className={cn(
              'flex items-start gap-2 rounded-lg border border-[var(--success)]/40',
              'bg-[var(--success-subtle,_hsl(142_76%_95%))] px-3 py-2.5'
            )}
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 className="h-4 w-4 text-[var(--success,_hsl(142_76%_36%))] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide">
                {result.format.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-mono text-[var(--text-primary)] break-all mt-0.5">
                {result.rawValue}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Salin nilai barcode"
                className={cn(
                  'p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
                  'outline-none focus-visible:ring-1 rounded'
                )}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Hapus hasil scan"
                className={cn(
                  'p-1 text-[var(--text-tertiary)] hover:text-[var(--error)]',
                  'outline-none focus-visible:ring-1 rounded'
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-1.5 text-xs text-[var(--error)]"
            role="alert"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
      </div>
    );
  }

  // ── Inline variant ─────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] overflow-hidden',
        className
      )}
      role="region"
      aria-label="Panel pemindai barcode"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[var(--border)] bg-[var(--surface-base)]">
        <ScanBarcode className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
        <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
          Pemindai Barcode
        </span>
      </div>

      <div className="p-3 space-y-3">
        {isScanning ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" aria-hidden="true" />
            <span>Memindai barcode via kamera…</span>
            <Button variant="ghost" size="sm" onClick={stopScan} className="ml-auto h-7 text-xs">
              Batal
            </Button>
          </div>
        ) : result ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success,_hsl(142_76%_36%))]" aria-hidden="true" />
              Berhasil dipindai · {result.format.replace(/_/g, ' ')}
            </div>
            <p className="font-mono text-sm text-[var(--text-primary)] break-all">{result.rawValue}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-xs gap-1.5">
                <Copy className="h-3 w-3" /> Salin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { onScanned(result.rawValue, result.format); reset(); }}
                className="h-7 text-xs text-[var(--accent)]"
              >
                Masukkan ke catatan
              </Button>
              <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs ml-auto">
                Pindai lagi
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleScan()}
            className="w-full h-9 gap-2 text-xs"
          >
            <ScanBarcode className="h-4 w-4" aria-hidden="true" />
            Mulai memindai
          </Button>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--error)]" role="alert">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
