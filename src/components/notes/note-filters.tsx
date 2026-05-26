'use client';

import {
  Smile, Cloud, Zap, CloudRain, AlertCircle, Flame,
  Sparkles, Moon, Heart, MinusCircle, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TagBadge } from '@/components/tags/tag-badge';
import { MOODS } from '@/constants/moods';
import type { NoteStatus } from '@/types/note.types';
import type { MoodId } from '@/types/mood.types';

// ─── Status filter ────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: NoteStatus; label: string }[] = [
  { value: 'active', label: 'Aktif' },
  { value: 'archived', label: 'Arsip' },
  { value: 'trashed', label: 'Sampah' },
];

const MOOD_ICONS: Record<string, React.ElementType> = {
  smile: Smile, cloud: Cloud, zap: Zap, 'cloud-rain': CloudRain,
  'alert-circle': AlertCircle, flame: Flame, sparkles: Sparkles,
  moon: Moon, heart: Heart, 'minus-circle': MinusCircle,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface NoteFiltersProps {
  status: NoteStatus;
  activeMood?: MoodId | null;
  activeTags?: string[];
  onStatusChange: (status: NoteStatus) => void;
  onMoodChange?: (mood: MoodId | null) => void;
  onTagRemove?: (tag: string) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteFilters({
  status,
  activeMood,
  activeTags = [],
  onStatusChange,
  onMoodChange,
  onTagRemove,
  className,
}: NoteFiltersProps) {
  const hasActiveFilters = !!activeMood || activeTags.length > 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Status tabs */}
      <div
        role="tablist"
        aria-label="Filter status catatan"
        className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-1 self-start"
      >
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={status === f.value}
            onClick={() => onStatusChange(f.value)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-all duration-100',
              'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              status === f.value
                ? 'bg-[var(--surface-base)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mood filter pills */}
      {onMoodChange && (
        <div
          role="group"
          aria-label="Filter mood"
          className="flex flex-wrap items-center gap-1"
        >
          {MOODS.map((mood) => {
            const Icon = MOOD_ICONS[mood.icon] ?? MinusCircle;
            const isActive = activeMood === mood.id;

            return (
              <Tooltip key={mood.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onMoodChange(isActive ? null : mood.id)}
                    aria-pressed={isActive}
                    aria-label={`Filter mood: ${mood.label}`}
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-lg border',
                      'transition-all duration-100',
                      'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
                      isActive
                        ? 'border-transparent scale-110 shadow-sm'
                        : 'border-[var(--border)] bg-[var(--surface-base)] hover:border-[var(--border-emphasis)] hover:scale-105'
                    )}
                    style={
                      isActive
                        ? { backgroundColor: `${mood.color}22`, borderColor: mood.color }
                        : undefined
                    }
                  >
                    <Icon
                      className="h-3.5 w-3.5"
                      style={{ color: isActive ? mood.color : 'var(--text-tertiary)' }}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{mood.label}</TooltipContent>
              </Tooltip>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onMoodChange(null);
                activeTags.forEach((t) => onTagRemove?.(t));
              }}
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 h-7 text-xs',
                'border border-[var(--border)] bg-[var(--surface-base)]',
                'text-[var(--text-tertiary)] hover:text-[var(--error)] hover:border-[var(--error)]/30',
                'transition-colors duration-100',
                'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
              )}
              aria-label="Hapus semua filter"
            >
              <X className="h-3 w-3" />
              Reset filter
            </button>
          )}
        </div>
      )}

      {/* Active tag filters */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Tag filter aktif">
          {activeTags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              isActive
              size="sm"
              {...(onTagRemove ? { onRemove: onTagRemove } : {})}
            />
          ))}
        </div>
      )}
    </div>
  );
}
