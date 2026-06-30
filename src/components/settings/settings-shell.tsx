'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { Palette, Shield, Database, Settings } from 'lucide-react';

const SETTINGS_NAV = [
  { href: ROUTES.SETTINGS, label: 'Umum', icon: Settings, exact: true },
  { href: ROUTES.SETTINGS_APPEARANCE, label: 'Tampilan', icon: Palette, exact: false },
  { href: ROUTES.SETTINGS_SECURITY, label: 'Keamanan', icon: Shield, exact: false },
  { href: ROUTES.SETTINGS_DATA, label: 'Data', icon: Database, exact: false },
] as const;

interface SettingsShellProps {
  children: React.ReactNode;
}

export function SettingsShell({ children }: SettingsShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[var(--border)] sm:px-8 sm:pt-8 sm:pb-0 sm:border-b-0">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-3 sm:mb-6">Pengaturan</h1>

        {/* Mobile tab nav */}
        <nav className="flex sm:hidden gap-2 overflow-x-auto pb-3" aria-label="Menu pengaturan">
          {SETTINGS_NAV.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium border transition-colors',
                  active
                    ? 'bg-[var(--accent)] text-white border-transparent'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden sm:px-8 sm:py-6 sm:gap-8 max-w-5xl mx-auto w-full">
        {/* Desktop side nav */}
        <nav className="hidden sm:flex flex-col gap-1 w-44 shrink-0 pt-1" aria-label="Menu pengaturan">
          {SETTINGS_NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-[var(--accent)] text-white font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Content — scrollable on mobile */}
        <div className="flex-1 min-w-0 overflow-y-auto px-4 py-4 sm:px-0 sm:py-0">
          {children}
        </div>
      </div>
    </div>
  );
}
