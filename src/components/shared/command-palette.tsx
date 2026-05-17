'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, LayoutDashboard, BarChart2, Settings, Clock, Layout, Archive } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui.store';
import { ROUTES } from '@/constants/routes';

interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: React.ElementType;
  href: string;
  keywords?: string;
}

const COMMANDS: CommandItem[] = [
  { id: 'dashboard', label: 'Dashboard', group: 'Navigasi', icon: LayoutDashboard, href: ROUTES.DASHBOARD },
  { id: 'notes', label: 'Catatan', group: 'Navigasi', icon: FileText, href: ROUTES.NOTES },
  { id: 'canvas', label: 'Canvas', group: 'Navigasi', icon: Layout, href: ROUTES.CANVAS },
  { id: 'timeline', label: 'Timeline', group: 'Navigasi', icon: Clock, href: ROUTES.TIMELINE },
  { id: 'stats', label: 'Statistik', group: 'Navigasi', icon: BarChart2, href: ROUTES.STATS },
  { id: 'archive', label: 'Arsip', group: 'Navigasi', icon: Archive, href: ROUTES.ARCHIVE },
  { id: 'settings', label: 'Pengaturan', group: 'Pengaturan', icon: Settings, href: ROUTES.SETTINGS },
  { id: 'settings-appearance', label: 'Tampilan', group: 'Pengaturan', icon: Settings, href: ROUTES.SETTINGS_APPEARANCE, keywords: 'tema warna gelap terang' },
  { id: 'settings-security', label: 'Keamanan & Privasi', group: 'Pengaturan', icon: Settings, href: ROUTES.SETTINGS_SECURITY },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const filtered = query.trim()
    ? COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        (c.keywords ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery('');
    setSelected(0);
  }, [setCommandPaletteOpen]);

  const execute = useCallback(
    (item: CommandItem) => {
      router.push(item.href);
      close();
    },
    [router, close]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[selected];
        if (item) execute(item);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, filtered, selected, execute]);

  // Reset selection on query change
  useEffect(() => { setSelected(0); }, [query]);

  // Group filtered results
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group]!.push(item);
    return acc;
  }, {});

  return (
    <DialogPrimitive.Root open={commandPaletteOpen} onOpenChange={(v) => !v && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[var(--z-modal-backdrop)] bg-black/50 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-[20%] z-[var(--z-modal)] w-full max-w-lg -translate-x-1/2',
            'rounded-xl border border-[var(--border)] bg-[var(--surface-base)] shadow-[var(--shadow-lg)]',
            'overflow-hidden outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          aria-label="Command palette"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden="true" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari halaman atau perintah…"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
              aria-label="Cari perintah"
            />
            <kbd className="text-xs text-[var(--text-tertiary)] font-mono">Esc</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2" role="listbox">
            {Object.keys(groups).length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--text-tertiary)]">
                Tidak ada hasil untuk &ldquo;{query}&rdquo;
              </p>
            )}
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
                  {group}
                </p>
                {items.map((item) => {
                  const globalIndex = filtered.indexOf(item);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      role="option"
                      aria-selected={globalIndex === selected}
                      onClick={() => execute(item)}
                      onMouseEnter={() => setSelected(globalIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors duration-[var(--duration-fast)]',
                        globalIndex === selected
                          ? 'bg-[var(--surface-muted)] text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 border-t border-[var(--border)] px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <kbd className="font-mono">↑↓</kbd> navigasi
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <kbd className="font-mono">↵</kbd> pilih
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              <kbd className="font-mono">Esc</kbd> tutup
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
