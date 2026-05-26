'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { ChecklistItem } from './note-checklist';

interface NoteChecklistProgressProps {
  items: ChecklistItem[];
  className?: string;
}

export function NoteChecklistProgress({ items, className }: NoteChecklistProgressProps) {
  const total = items.length;
  const checked = items.filter((i) => i.isChecked).length;
  const percentage = total === 0 ? 0 : Math.round((checked / total) * 100);

  if (total === 0) return null;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">
          {checked}/{total} selesai
        </span>
        <span className="text-xs text-[var(--text-tertiary)] tabular-nums">{percentage}%</span>
      </div>
      <Progress
        value={percentage}
        className="h-1"
        aria-label={`Progress: ${checked} dari ${total} item selesai`}
      />
    </div>
  );
}
