// components/shared/pwa-install-banner.tsx
// Banner install PWA — muncul 30 detik setelah halaman terbuka, bukan langsung.
// Hanya muncul di browser yang mendukung beforeinstallprompt (Chrome Android/Desktop).
'use client';
import { useState, useEffect } from 'react';
import { Download, X }         from 'lucide-react';
import { usePwaInstall }       from '@/hooks/use-pwa-install';

export function PwaInstallBanner() {
  const { canInstall, isInstalling, install } = usePwaInstall();
  const [isDismissed, setIsDismissed]         = useState(false);
  const [isVisible,   setIsVisible]           = useState(false);

  useEffect(() => {
    // Delay 30 detik — tidak muncul langsung agar tidak mengganggu first load
    const timer = setTimeout(() => {
      if (canInstall && !isDismissed) setIsVisible(true);
    }, 30_000);
    return () => clearTimeout(timer);
  }, [canInstall, isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div
      role="banner"
      className={[
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80',
        'flex items-center gap-3 rounded-xl p-4',
        'bg-[var(--surface-base)] border border-[var(--border-default)]',
        'shadow-lg z-toast',
        'animate-in slide-in-from-bottom-2 duration-300',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Pasang NalaKoe
        </p>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Akses lebih cepat langsung dari layar utama.
        </p>
      </div>
      <button
        type="button"
        onClick={() => void install()}
        disabled={isInstalling}
        aria-label="Pasang aplikasi NalaKoe"
        className={[
          'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5',
          'bg-[var(--accent)] text-white text-sm font-medium',
          'transition-opacity hover:opacity-90 disabled:opacity-50',
        ].join(' ')}
      >
        <Download size={13} aria-hidden />
        {isInstalling ? 'Memasang...' : 'Pasang'}
      </button>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        aria-label="Tutup banner instalasi"
        className="shrink-0 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}
