'use client';

import { cn } from '@/lib/utils';
import { formatWordCount, formatReadingTime } from '@/lib/format';

interface NoteWordCountProps {
  wordCount: number;
  readingTimeMinutes: number;
  className?: string;
}

export function NoteWordCount({ wordCount, readingTimeMinutes, className }: NoteWordCountProps) {
  if (wordCount === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs text-[var(--text-tertiary)] tabular-nums',
        className
      )}
      aria-live="polite"
      aria-label={`${wordCount} kata, estimasi ${readingTimeMinutes} menit baca`}
    >
      <span>{formatWordCount(wordCount)}</span>
      <span aria-hidden="true">·</span>
      <span>{formatReadingTime(wordCount)}</span>
    </div>
  );
}
