// app/error.tsx — Error boundary untuk route segments
'use client';
import { useEffect }      from 'react';
import { AlertTriangle }  from 'lucide-react';
import { logger }         from '@/lib/logger';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ke console + Firestore error_logs
    logger.error('app/error', error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error-subtle)]">
        <AlertTriangle className="h-6 w-6 text-[var(--error)]" aria-hidden />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Terjadi Kesalahan
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Maaf, ada masalah yang tidak terduga. Tim kami sudah diberitahu.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-[var(--text-tertiary)]">
            ID: {error.digest}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={reset}
        className={[
          'rounded-lg px-5 py-2.5 text-sm font-medium text-white',
          'bg-[var(--accent)] transition-opacity hover:opacity-90',
        ].join(' ')}
      >
        Coba Lagi
      </button>
    </div>
  );
}
