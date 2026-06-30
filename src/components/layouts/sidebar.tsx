'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useUiStore } from '@/stores/ui.store';
import { SidebarNav } from './sidebar-nav';
import { NalaKoeLogo } from '@/components/shared/nalakoe-logo';

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-[var(--z-sidebar)] flex flex-col border-r border-[var(--border)] bg-[var(--surface-subtle)]',
        'transition-[width] duration-300 ease-out',
        'hidden lg:flex',
        sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
      )}
      aria-label="Sidebar navigasi"
    >
      {/* Logo */}
      <Link
        href={ROUTES.DASHBOARD}
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[var(--border)] px-4"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f172a] text-white shrink-0">
          <NalaKoeLogo size={16} />
        </div>
        <span className="font-semibold text-[var(--text-primary)] truncate">NalaKoe</span>
      </Link>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  );
}
