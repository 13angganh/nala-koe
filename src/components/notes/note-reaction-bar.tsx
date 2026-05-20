'use client';

import { useState } from 'react';
import { ThumbsUp, MinusCircle, Bookmark, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { setNoteReaction } from '@/services/reactions.service';
import { useAuthStore } from '@/stores/auth.store';
import { isOk } from '@/lib/normalizer';
import type { NoteReaction } from '@/types/note.types';

interface ReactionOption {
  type: NoteReaction['type'];
  label: string;
  icon: React.ElementType;
  activeClass: string;
}

const REACTIONS: ReactionOption[] = [
  {
    type: 'agree',
    label: 'Setuju',
    icon: ThumbsUp,
    activeClass: 'bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]/30',
  },
  {
    type: 'irrelevant',
    label: 'Tidak relevan',
    icon: MinusCircle,
    activeClass: 'bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/30',
  },
  {
    type: 'follow-up',
    label: 'Follow up',
    icon: Bookmark,
    activeClass: 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30',
  },
];

interface NoteReactionBarProps {
  noteId: string;
  reaction: NoteReaction | null;
  onReactionChange?: (reaction: NoteReaction | null) => void;
  className?: string;
}

export function NoteReactionBar({
  noteId,
  reaction,
  onReactionChange,
  className,
}: NoteReactionBarProps) {
  const { user } = useAuthStore();
  const [isPending, setIsPending] = useState(false);

  async function handleReact(type: NoteReaction['type']) {
    if (!user || isPending) return;

    // Toggle off if same reaction
    const newType = reaction?.type === type ? null : type;

    setIsPending(true);
    try {
      const result = await setNoteReaction(noteId, user.uid, newType);
      if (isOk(result)) {
        const newReaction: NoteReaction | null =
          newType === null
            ? null
            : { type: newType, reactedAt: new Date().toISOString() };
        onReactionChange?.(newReaction);
        if (newType) {
          const option = REACTIONS.find((r) => r.type === newType);
          toast.success(`Reaksi "${option?.label}" disimpan`);
        } else {
          toast.success('Reaksi dihapus');
        }
      } else {
        toast.error('Gagal menyimpan reaksi');
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-1.5',
        className
      )}
      role="group"
      aria-label="Reaksi catatan"
    >
      <span className="text-[10px] font-medium text-[var(--text-tertiary)] px-1 select-none">
        Reaksi
      </span>
      {REACTIONS.map(({ type, label, icon: Icon, activeClass }) => {
        const isActive = reaction?.type === type;
        return (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleReact(type)}
                aria-pressed={isActive}
                aria-label={label}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-medium',
                  'transition-all duration-100',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isActive
                    ? activeClass
                    : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isActive ? `Hapus reaksi "${label}"` : label}
            </TooltipContent>
          </Tooltip>
        );
      })}
      {reaction && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending}
              onClick={() => handleReact(reaction.type)}
              aria-label="Hapus reaksi"
              className="ml-auto text-[var(--text-tertiary)] h-7 w-7"
            >
              <X className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Hapus reaksi</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
