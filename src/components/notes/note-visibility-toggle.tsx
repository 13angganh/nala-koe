'use client';

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteVisibilityToggleProps {
  /** True when the section/block is currently HIDDEN from the note view. */
  isHidden: boolean;
  onToggle: () => void;
  /** Label of the thing being shown/hidden, used to build the aria-label (e.g. "Mood", "Tabel"). */
  label: string;
  size?: 'xs' | 'sm';
  className?: string;
}

/**
 * Small eye/eye-off icon button used throughout the note editor to let the
 * user collapse a section or block out of the note's visible layout without
 * deleting its underlying data. Used by section headers (mood, tags,
 * weather/location, linked notes, reaction, highlights) and by individual
 * content blocks (table, math, url-preview, checklist).
 */
export function NoteVisibilityToggle({ isHidden, onToggle, label, size = 'xs', className }: NoteVisibilityToggleProps) {
  const Icon = isHidden ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isHidden ? `Tampilkan ${label}` : `Sembunyikan ${label}`}
      aria-pressed={isHidden}
      title={isHidden ? `Tampilkan ${label}` : `Sembunyikan ${label}`}
      className={cn(
        'inline-flex items-center justify-center rounded-md outline-none transition-colors',
        'text-[var(--text-tertiary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-secondary)]',
        'focus-visible:ring-1 focus-visible:ring-[var(--accent)]',
        size === 'xs' ? 'h-6 w-6' : 'h-7 w-7',
        className
      )}
    >
      <Icon className={size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
    </button>
  );
}

interface NoteHiddenCollapsedRowProps {
  label: string;
  onToggle: () => void;
}

/**
 * Compact one-line placeholder shown in place of a section/block when it's
 * hidden — keeps a lightweight trace in the note layout so the user can
 * remember the feature is there and quickly bring it back, instead of it
 * disappearing without a trace (which would be indistinguishable from never
 * having been added at all).
 */
export function NoteHiddenCollapsedRow({ label, onToggle }: NoteHiddenCollapsedRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-left',
        'text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover,var(--border))]',
        'outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] transition-colors'
      )}
    >
      <EyeOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label} disembunyikan — klik untuk tampilkan</span>
    </button>
  );
}
