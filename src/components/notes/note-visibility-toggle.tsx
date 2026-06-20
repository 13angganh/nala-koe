'use client';

import { Eye, EyeOff, Trash2 } from 'lucide-react';
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

interface NoteBlockHeaderProps {
  /** Block type label shown on the left, e.g. "Checklist", "Tabel". */
  label: string;
  isHidden: boolean;
  onToggleVisibility: () => void;
  onDelete: () => void;
  /** aria-label suffix for the delete button, e.g. "Hapus tabel". Defaults to "Hapus {label}". */
  deleteLabel?: string;
}

/**
 * Standardized header row for every content block (checklist, table, math,
 * url-preview) — label on the left, eye toggle + trash on the right, always
 * visible (never hover-only), always in the same order, same icon set, same
 * size. Every block type renders exactly this header, so hide/unhide and
 * delete are never in a different place, a different icon, or missing
 * entirely depending on which block you're looking at.
 */
export function NoteBlockHeader({ label, isHidden, onToggleVisibility, onDelete, deleteLabel }: NoteBlockHeaderProps) {
  return (
    <div className="flex items-center justify-between px-0.5">
      <span className="text-xs font-medium text-[var(--text-tertiary)]">{label}</span>
      <div className="flex items-center gap-0.5">
        <NoteVisibilityToggle isHidden={isHidden} onToggle={onToggleVisibility} label={label} />
        <button
          type="button"
          onClick={onDelete}
          aria-label={deleteLabel ?? `Hapus ${label.toLowerCase()}`}
          title={deleteLabel ?? `Hapus ${label.toLowerCase()}`}
          className={cn(
            'inline-flex items-center justify-center rounded-md outline-none transition-colors h-6 w-6',
            'text-[var(--text-tertiary)] hover:bg-[var(--error-subtle)] hover:text-[var(--error)]',
            'focus-visible:ring-1 focus-visible:ring-[var(--error)]'
          )}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

interface NoteSectionHeaderProps {
  label: string;
  isHidden: boolean;
  onToggleVisibility: () => void;
}

/**
 * Header for meta sections (Mood, Tag, Cuaca & Lokasi) — visually identical
 * to NoteBlockHeader's left label + right-aligned eye toggle, minus the
 * trash icon (sections aren't deletable the way a table/checklist block
 * is — clearing a mood or removing all tags is done through the section's
 * own controls, not a block-level delete). Keeping label position, toggle
 * position, icon, and size identical to NoteBlockHeader is what makes
 * hide/unhide read as ONE consistent feature across the whole editor
 * instead of a different pattern per area.
 */
export function NoteSectionHeader({ label, isHidden, onToggleVisibility }: NoteSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-0.5">
      <span className="text-xs font-medium text-[var(--text-tertiary)]">{label}</span>
      <NoteVisibilityToggle isHidden={isHidden} onToggle={onToggleVisibility} label={label} />
    </div>
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
