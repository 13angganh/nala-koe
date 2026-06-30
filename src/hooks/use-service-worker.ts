// hooks/use-service-worker.ts
// Register service worker saat app mount, dan beri tahu user secara aktif
// ketika ada versi baru yang siap dipakai — sebelumnya event ini hanya
// di-console.warn() dan tidak pernah benar-benar diberitahukan ke user,
// sehingga PWA yang sudah ter-install bisa terus menjalankan kode lama
// tanpa indikasi apa pun bahwa versi baru sudah tersedia.
// Dipanggil via ServiceWorkerInit di components/shared/providers.tsx.
'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export function useServiceWorker(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;
    // Reload exactly once when the new service worker takes control —
    // controllerchange fires after skipWaiting() activates the new SW.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // A waiting worker already present on first load (e.g. user opened
        // a tab that was backgrounded through a previous update cycle).
        if (registration.waiting) {
          notifyUpdateAvailable(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdateAvailable(newWorker);
            }
          });
        });

        // Proactively check for an update whenever the tab regains focus —
        // catches the case where the app was left open in the background
        // through a deploy.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            void registration.update();
          }
        });
      })
      .catch((error: unknown) => {
        logger.error('use-service-worker/register', error);
      });
  }, []);
}

function notifyUpdateAvailable(worker: ServiceWorker): void {
  toast.info('Versi baru NalaKoe tersedia', {
    description: 'Muat ulang untuk mendapatkan pembaruan terbaru.',
    duration: Infinity,
    action: {
      label: 'Muat ulang',
      onClick: () => worker.postMessage({ type: 'SKIP_WAITING' }),
    },
  });
}
