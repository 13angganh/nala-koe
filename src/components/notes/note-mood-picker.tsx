'use client';

import {
  Smile, Cloud, Zap, CloudRain, AlertCircle, Flame,
  Sparkles, Moon, Heart, MinusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MOODS } from '@/constants/moods';
import type { MoodId } from '@/types/mood.types';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const MOOD_ICONS: Record<string, React.ElementType> = {
  smile: Smile,
  cloud: Cloud,
  zap: Zap,
  'cloud-rain': CloudRain,
  'alert-circle': AlertCircle,
  flame: Flame,
  sparkles: Sparkles,
  moon: Moon,
  heart: Heart,
  'minus-circle': MinusCircle,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface NoteMoodPickerProps {
  value: MoodId | null;
  onChange: (mood: MoodId | null) => void;
  disabled?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteMoodPicker({
  value,
  onChange,
  disabled = false,
  className,
}: NoteMoodPickerProps) {
  function handleSelect(id: MoodId) {
    // Toggle off if already selected
    onChange(value === id ? null : id);
  }

  return (
    <div
      role="group"
      aria-label="Pilih mood catatan"
      className={cn('flex flex-wrap gap-1', className)}
    >
      {MOODS.map((mood) => {
        const Icon = MOOD_ICONS[mood.icon] ?? MinusCircle;
        const isSelected = value === mood.id;

        return (
          <Tooltip key={mood.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(mood.id)}
                aria-pressed={isSelected}
                aria-label={mood.label}
                className={cn(
                  'flex items-center justify-center rounded-lg w-8 h-8',
                  'border transition-all duration-100',
                  'outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  isSelected
                    ? 'border-transparent shadow-sm scale-110'
                    : 'border-[var(--border)] bg-[var(--surface-base)] hover:border-[var(--border-emphasis)] hover:scale-105'
                )}
                style={
                  isSelected
                    ? { backgroundColor: `${mood.color}22`, borderColor: mood.color, color: mood.color }
                    : undefined
                }
              >
                <Icon
                  className="h-4 w-4"
                  style={isSelected ? { color: mood.color } : { color: 'var(--text-tertiary)' }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {mood.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
