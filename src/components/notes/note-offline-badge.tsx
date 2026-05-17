'use client';

import { WifiOff, CloudOff, Cloud, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useNetworkStatus } from '@/hooks/use-network-status';

interface NoteOfflineBadgeProps {
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
  className?: string;
  /** compact = just an icon dot, default = icon + text */
  variant?: 'compact' | 'default';
}

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 10) return 'Baru saja';
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function NoteOfflineBadge({
  isSaving,
  isDirty,
  lastSavedAt,
  className,
  variant = 'default',
}: NoteOfflineBadgeProps) {
  const { isOffline } = useNetworkStatus();

  // ── Offline ───────────────────────────────────────────────────────────────
  if (isOffline) {
    const label = 'Offline — perubahan disimpan lokal';
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-0.5',
              'bg-[var(--warning)]/15 text-[var(--warning)]',
              variant === 'compact' && 'px-1 py-1',
              className
            )}
            role="status"
            aria-label={label}
          >
            <WifiOff className="h-3 w-3 shrink-0" aria-hidden="true" />
            {variant === 'default' && (
              <span className="text-[10px] font-medium">Offline</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // ── Saving ────────────────────────────────────────────────────────────────
  if (isSaving) {
    return (
      <div
        className={cn(
          'flex items-center gap-1.5 text-[var(--text-tertiary)]',
          className
        )}
        role="status"
        aria-label="Menyimpan..."
      >
        <Loader2 className="h-3 w-3 animate-spin shrink-0" aria-hidden="true" />
        {variant === 'default' && (
          <span className="text-[10px]">Menyimpan...</span>
        )}
      </div>
    );
  }

  // ── Dirty (unsaved changes) ───────────────────────────────────────────────
  if (isDirty) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 text-[var(--text-tertiary)]',
              className
            )}
            role="status"
            aria-label="Ada perubahan yang belum tersimpan"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--warning)] shrink-0" aria-hidden="true" />
            {variant === 'default' && (
              <span className="text-[10px]">Belum disimpan</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Ada perubahan yang belum disimpan
        </TooltipContent>
      </Tooltip>
    );
  }

  // ── Saved ─────────────────────────────────────────────────────────────────
  if (lastSavedAt) {
    const label = `Tersimpan ${formatLastSaved(lastSavedAt)}`;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 text-[var(--text-tertiary)]',
              className
            )}
            role="status"
            aria-label={label}
          >
            <Cloud className="h-3 w-3 shrink-0" aria-hidden="true" />
            {variant === 'default' && (
              <span className="text-[10px]">{label}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // ── Nothing to show ────────────────────────────────────────────────────────
  return null;
}
