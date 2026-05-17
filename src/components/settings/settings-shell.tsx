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
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="mb-6 text-xl font-semibold text-[var(--text-primary)]">Pengaturan</h1>
      <div className="flex gap-6 items-start">
        {/* Side nav */}
        <nav
          className="hidden sm:flex flex-col gap-1 w-44 shrink-0"
          aria-label="Menu pengaturan"
        >
          {SETTINGS_NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[var(--accent)] text-white font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile nav */}
        <div className="flex sm:hidden gap-2 mb-4 flex-wrap w-full">
          {SETTINGS_NAV.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
                  active
                    ? 'bg-[var(--accent)] text-white border-transparent'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
