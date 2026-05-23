// components/shared/providers.tsx
// SEMUA global provider dipasang di sini — tidak ada provider di tempat lain.
// Urutan pemasangan penting:
//   1. QueryClientProvider  — state server/cache (paling luar)
//   2. ThemeProvider        — tema & accent color
//   3. ServiceWorkerInit    — register SW saat mount
//   4. NetworkStatus        — banner online/offline
//   5. PwaInstallBanner     — banner install PWA
//   6. Toaster (Sonner)     — notifikasi toast global
//   7. ReactQueryDevtools   — hanya di development
'use client';
import { QueryClientProvider }   from '@tanstack/react-query';
import { ReactQueryDevtools }    from '@tanstack/react-query-devtools';
import { Toaster }               from 'sonner';
import { TooltipProvider }       from '@/components/ui/tooltip';
import { queryClient }           from '@/lib/query-client';
import { ThemeProvider }         from '@/components/shared/theme-provider';
import { NetworkStatus }         from '@/components/shared/network-status';
import { PwaInstallBanner }      from '@/components/shared/pwa-install-banner';
import { useServiceWorker }      from '@/hooks/use-service-worker';

function ServiceWorkerInit() {
  useServiceWorker();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ThemeProvider>
          <ServiceWorkerInit />
          <NetworkStatus />
          <PwaInstallBanner />
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              style: { fontFamily: 'var(--font-sans)' },
            }}
          />
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
