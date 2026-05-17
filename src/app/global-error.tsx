'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke console — Sentry tidak digunakan di project ini
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            gap: '16px',
            fontFamily: 'system-ui, sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            Ada yang tidak beres
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '360px' }}>
            Terjadi kesalahan yang tidak terduga. Coba muat ulang halaman.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#0ea5e9',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
