'use client';

import { cn } from '@/lib/utils';
import type { NoteFontWeight } from '@/types/settings.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteFontPickerProps {
  value: NoteFontWeight;
  onChange: (font: NoteFontWeight) => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_OPTIONS: {
  value: NoteFontWeight;
  label: string;
  preview: string;
  className: string;
}[] = [
  {
    value: 'regular',
    label: 'Reguler',
    preview: 'Aa',
    className: 'font-normal',
  },
  {
    value: 'medium',
    label: 'Medium',
    preview: 'Aa',
    className: 'font-medium',
  },
  {
    value: 'semibold',
    label: 'Tebal',
    preview: 'Aa',
    className: 'font-semibold',
  },
  {
    value: 'italic',
    label: 'Miring',
    preview: 'Aa',
    className: 'italic',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteFontPicker({ value, onChange, className }: NoteFontPickerProps) {
  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="radiogroup"
      aria-label="Pilih gaya font catatan"
    >
      {FONT_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            aria-label={opt.label}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1',
              'w-14 h-12 rounded-lg border transition-all',
              'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              isSelected
                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--surface-base)] text-[var(--text-secondary)]',
              'hover:border-[var(--accent)]/60'
            )}
          >
            <span className={cn('text-base leading-none', opt.className)} aria-hidden="true">
              {opt.preview}
            </span>
            <span className="text-[9px] font-medium leading-none truncate max-w-full px-1">
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Font class helper ────────────────────────────────────────────────────────

export function fontWeightClass(fontWeight: NoteFontWeight): string {
  switch (fontWeight) {
    case 'medium':
      return 'font-medium';
    case 'semibold':
      return 'font-semibold';
    case 'italic':
      return 'italic';
    case 'regular':
    default:
      return 'font-normal';
  }
}
