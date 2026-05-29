'use client';

import { X, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TagBadgeProps {
  tag: string;
  onRemove?: (tag: string) => void;
  onClick?: (tag: string) => void;
  isActive?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TagBadge({
  tag,
  onRemove,
  onClick,
  isActive = false,
  size = 'sm',
  className,
}: TagBadgeProps) {
  const isInteractive = !!onClick;

  return (
    <span
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? () => onClick(tag) : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick(tag);
            }
          : undefined
      }
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        'border transition-colors duration-100',
        size === 'sm' && 'text-sm px-1.5 py-0.5',
        size === 'md' && 'text-sm px-2 py-1',
        isActive
          ? 'border-[var(--accent)]/50 bg-[var(--accent-subtle)] text-[var(--accent)]'
          : 'border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]',
        isInteractive && 'cursor-pointer hover:border-[var(--accent)]/50 hover:text-[var(--accent)]',
        !isInteractive && 'cursor-default',
        'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
        className
      )}
      aria-label={isInteractive ? `Filter tag: ${tag}` : `Tag: ${tag}`}
      aria-pressed={isInteractive ? isActive : undefined}
    >
      <Hash className={cn('shrink-0', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          aria-label={`Hapus tag ${tag}`}
          className={cn(
            'ml-0.5 rounded-sm outline-none',
            'hover:text-[var(--error)]',
            'focus-visible:ring-1 focus-visible:ring-[var(--error)]'
          )}
        >
          <X className={cn('shrink-0', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
        </button>
      )}
    </span>
  );
}
