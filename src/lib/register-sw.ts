import { logger } from './logger';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        logger.info('SW registered', { scope: registration.scope });

        // Check for updates every 60 minutes
        setInterval(
          () => {
            void registration.update();
          },
          60 * 60 * 1000
        );
      })
      .catch((err) => {
        logger.error('SW registration failed', err);
      });
  });
}
