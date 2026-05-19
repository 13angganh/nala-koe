'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { useUiStore } from '@/stores/ui.store';
import { SidebarNav } from './sidebar-nav';

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
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
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
