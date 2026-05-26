'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Layout,
  Clock,
  BarChart2,
  Highlighter,
  Archive,
  Trash2,
  Network,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_MAIN: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: 'Catatan', href: ROUTES.NOTES, icon: FileText },
  { label: 'Canvas', href: ROUTES.CANVAS, icon: Layout },
  { label: 'Timeline', href: ROUTES.TIMELINE, icon: Clock },
];

const NAV_INSIGHTS: NavItem[] = [
  { label: 'Statistik', href: ROUTES.STATS, icon: BarChart2 },
  { label: 'Highlights', href: ROUTES.HIGHLIGHTS, icon: Highlighter },
  { label: 'Graph', href: ROUTES.GRAPH, icon: Network },
];

const NAV_MANAGE: NavItem[] = [
  { label: 'Arsip', href: ROUTES.ARCHIVE, icon: Archive },
  { label: 'Sampah', href: ROUTES.TRASH, icon: Trash2 },
  { label: 'Pengaturan', href: ROUTES.SETTINGS, icon: Settings },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div>
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
        {label}
      </p>
      <ul role="list" className="space-y-0.5">
        {items.map(({ label: itemLabel, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                {...(onNavigate ? { onClick: onNavigate } : {})}
                className={cn(
                  'flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-100',
                  isActive
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                )}
                {...(isActive ? { 'aria-current': 'page' as const } : {})}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {itemLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5 px-3 py-4" aria-label="Navigasi utama">
      <NavGroup label="Utama" items={NAV_MAIN} pathname={pathname} {...(onNavigate ? { onNavigate } : {})} />
      <NavGroup label="Insight" items={NAV_INSIGHTS} pathname={pathname} {...(onNavigate ? { onNavigate } : {})} />
      <NavGroup label="Kelola" items={NAV_MANAGE} pathname={pathname} {...(onNavigate ? { onNavigate } : {})} />
    </nav>
  );
}
