// hooks/use-service-worker.ts
// Register service worker saat app mount.
// Dipanggil via ServiceWorkerInit di components/shared/providers.tsx.
'use client';
import { useEffect } from 'react';
import { logger }    from '@/lib/logger';

export function useServiceWorker(): void {
  useEffect(() => {
    if (typeof window === 'undefined')              return;
    if (!('serviceWorker' in navigator))            return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Cek update setiap kali tab di-focus
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // SW baru tersedia — informasi tersedia di console dev
              console.warn('[SW] Update tersedia. Muat ulang untuk mendapatkan versi terbaru.');
            }
          });
        });
      })
      .catch((error: unknown) => {
        logger.error('use-service-worker/register', error);
      });
  }, []);
}
