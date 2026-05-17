'use client';

import {
  Pin,
  Sun,
  CalendarDays,
  CheckSquare,
  Link2,
  FileText,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SmartFolder, SmartFolderKey } from '@/hooks/use-smart-folder';

const FOLDER_ICONS: Record<SmartFolderKey, React.ElementType> = {
  pinned: Pin,
  today: Sun,
  'this-week': CalendarDays,
  'with-checklist': CheckSquare,
  'with-links': Link2,
  'long-notes': FileText,
  untagged: Tag,
};

interface SmartFolderPanelProps {
  folders: SmartFolder[];
  activeKey: SmartFolderKey | null;
  onSelect: (key: SmartFolderKey | null) => void;
  className?: string;
}

export function SmartFolderPanel({
  folders,
  activeKey,
  onSelect,
  className,
}: SmartFolderPanelProps) {
  if (folders.length === 0) return null;

  return (
    <div className={cn('space-y-0.5', className)}>
      <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
        Smart Folder
      </p>

      {activeKey && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--text-tertiary)] hover:bg-[var(--surface-subtle)] transition-colors duration-[var(--duration-fast)]"
        >
          Semua catatan
        </button>
      )}

      {folders.map((folder) => {
        const Icon = FOLDER_ICONS[folder.key];
        const isActive = activeKey === folder.key;
        return (
          <button
            key={folder.key}
            type="button"
            onClick={() => onSelect(isActive ? null : folder.key)}
            className={cn(
              'group w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-[var(--duration-fast)]',
              isActive
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]'
            )}
            aria-pressed={isActive}
            title={folder.description}
          >
            <Icon
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
              )}
              aria-hidden
            />
            <span className="flex-1 truncate text-left text-xs">{folder.label}</span>
            <span
              className={cn(
                'ml-auto text-[10px] tabular-nums rounded-full px-1.5 py-0 min-w-[18px] text-center',
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-subtle)] text-[var(--text-tertiary)] group-hover:bg-[var(--border)]'
              )}
            >
              {folder.count}
            </span>
            <ChevronRight
              className={cn(
                'h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                isActive && 'opacity-100'
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
