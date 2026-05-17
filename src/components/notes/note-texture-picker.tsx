'use client';

import { cn } from '@/lib/utils';
import type { NoteTexture } from '@/types/settings.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteTexturePickerProps {
  value: NoteTexture;
  onChange: (texture: NoteTexture) => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEXTURES: {
  value: NoteTexture;
  label: string;
  /** SVG pattern rendered inside the swatch */
  svgContent: string;
}[] = [
  {
    value: 'plain',
    label: 'Polos',
    svgContent: '',
  },
  {
    value: 'lined',
    label: 'Bergaris',
    svgContent: `
      <line x1="0" y1="8" x2="40" y2="8" stroke="currentColor" stroke-width="0.75" opacity="0.35"/>
      <line x1="0" y1="16" x2="40" y2="16" stroke="currentColor" stroke-width="0.75" opacity="0.35"/>
      <line x1="0" y1="24" x2="40" y2="24" stroke="currentColor" stroke-width="0.75" opacity="0.35"/>
      <line x1="0" y1="32" x2="40" y2="32" stroke="currentColor" stroke-width="0.75" opacity="0.35"/>
    `,
  },
  {
    value: 'dotgrid',
    label: 'Titik',
    svgContent: `
      <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="20" cy="8" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="32" cy="8" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="8" cy="20" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="20" cy="20" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="32" cy="20" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="8" cy="32" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="20" cy="32" r="1" fill="currentColor" opacity="0.4"/>
      <circle cx="32" cy="32" r="1" fill="currentColor" opacity="0.4"/>
    `,
  },
  {
    value: 'grid',
    label: 'Kotak',
    svgContent: `
      <line x1="0" y1="10" x2="40" y2="10" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>
      <line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>
      <line x1="0" y1="30" x2="40" y2="30" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>
      <line x1="10" y1="0" x2="10" y2="40" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>
      <line x1="20" y1="0" x2="20" y2="40" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>
      <line x1="30" y1="0" x2="30" y2="40" stroke="currentColor" stroke-width="0.6" opacity="0.3"/>
    `,
  },
];

// ─── CSS class helper ─────────────────────────────────────────────────────────

export function textureClass(texture: NoteTexture): string {
  switch (texture) {
    case 'lined':
      return 'texture-lined';
    case 'dotgrid':
      return 'texture-dotgrid';
    case 'grid':
      return 'texture-grid';
    case 'plain':
    default:
      return '';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteTexturePicker({ value, onChange, className }: NoteTexturePickerProps) {
  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="radiogroup"
      aria-label="Pilih tekstur catatan"
    >
      {TEXTURES.map((tex) => {
        const isSelected = value === tex.value;
        return (
          <button
            key={tex.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(tex.value)}
            aria-label={tex.label}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1',
              'w-14 h-12 rounded-lg border transition-all overflow-hidden',
              'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              isSelected
                ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--surface-base)] text-[var(--text-tertiary)]',
              'hover:border-[var(--accent)]/60'
            )}
          >
            {/* Pattern preview */}
            <svg
              viewBox="0 0 40 40"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: tex.svgContent }}
            />
            {/* Label */}
            <span className="relative z-10 text-[9px] font-medium mt-auto mb-1 leading-none">
              {tex.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
