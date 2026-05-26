'use client';

import { Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NotePriorityBadgeProps {
  isPinned: boolean;
  /** Visual scale: 'default' | 'prominent'. Prominent makes card bigger in grid */
  variant?: 'default' | 'prominent';
  className?: string;
}

export function NotePriorityBadge({
  isPinned,
  variant = 'default',
  className,
}: NotePriorityBadgeProps) {
  if (!isPinned) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20',
            variant === 'prominent' && 'px-2.5 py-1 text-xs',
            className
          )}
          aria-label="Catatan disematkan"
        >
          <Pin className="h-2.5 w-2.5 fill-current" aria-hidden />
          Disematkan
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Catatan ini disematkan di bagian atas
      </TooltipContent>
    </Tooltip>
  );
}
