'use client';

import { useRouter } from 'next/navigation';
import {
  Pin, Lock, Clock, MoreHorizontal, Trash2, Archive,
  Smile, Cloud, Zap, CloudRain, AlertCircle, Flame,
  Sparkles, Moon, Heart, MinusCircle, Globe,
  Copy, GitMerge, RotateCcw,
} from 'lucide-react';
import { cn, getContentPreview, truncate } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import { getCardAccentColor, getTimeGradient } from '@/lib/color-gradient';
import { getLanguageLabel } from '@/lib/language-detector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { MOOD_MAP } from '@/constants/moods';
import { useTimeCapsule } from '@/hooks/use-time-capsule';
import { NoteSizeBadge } from './note-size-indicator';
import { NotePriorityBadge } from './note-priority-badge';
import type { NoteListItem } from '@/types/note.types';

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

interface NoteCardProps {
  note: NoteListItem;
  onTrash?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMerge?: (id: string) => void;
  isTrash?: boolean;
  isArchive?: boolean;
  sizeLabel?: 'small' | 'medium' | 'large';
}

export function NoteCard({ note, onTrash, onRestore, onDelete, onArchive, onDuplicate, onMerge, isTrash = false, isArchive = false, sizeLabel }: NoteCardProps) {
  const router = useRouter();
  const preview = getContentPreview(note.content, 120);
  const title = note.title || 'Tanpa judul';
  const gradient = getTimeGradient(note.createdAt);
  const accentColor = note.accentColor ?? getCardAccentColor(note.createdAt);
  const moodOption = note.mood ? MOOD_MAP[note.mood] : null;
  const MoodIcon = moodOption ? (MOOD_ICONS[moodOption.icon] ?? MinusCircle) : null;
  const { status: capsuleStatus } = useTimeCapsule(note.isTimeCapsule, note.timeCapsuleUnlockAt);

  function handleCardClick() {
    router.push(ROUTES.NOTE(note.id));
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      className={cn(
        'group relative flex flex-col gap-2.5 rounded-xl border bg-[var(--surface-base)]',
        'p-4 cursor-pointer outline-none overflow-hidden',
        'transition-all duration-100',
        'hover:shadow-[var(--shadow-sm)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
        note.isPinned && 'bg-[var(--accent-subtle)]/20'
      )}
      style={{ borderColor: note.isPinned ? `${accentColor}50` : undefined }}
      aria-label={`Catatan: ${title}`}
    >
      {/* Dynamic time gradient overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] dark:opacity-[0.04]"
        style={{ background: gradient.gradient }}
      />
      {/* Left accent bar */}
      <div
        aria-hidden
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-60"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 pl-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {note.isPinned && <Pin className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" aria-label="Disematkan" fill="currentColor" />}
          {note.isSecret && <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" aria-label="Rahasia" />}
          {note.isTimeCapsule && <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--warning)]" aria-label="Kapsul waktu" />}
          <h2 className="text-base font-medium text-[var(--text-primary)] truncate">{truncate(title, 60)}</h2>
        </div>

        {MoodIcon && moodOption && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="shrink-0 flex items-center justify-center w-5 h-5" aria-label={`Mood: ${moodOption.label}`}>
                <MoodIcon className="h-3.5 w-3.5" style={{ color: moodOption.color }} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">{moodOption.label}</TooltipContent>
          </Tooltip>
        )}

        <div
          className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Opsi catatan">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isTrash ? (
                <>
                  <DropdownMenuItem onClick={() => onRestore?.(note.id)}>
                    <RotateCcw className="h-4 w-4 mr-2" />Pulihkan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[var(--error)]" onClick={() => onDelete?.(note.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />Hapus permanen
                  </DropdownMenuItem>
                </>
              ) : isArchive ? (
                <>
                  <DropdownMenuItem onClick={() => onRestore?.(note.id)}>
                    <RotateCcw className="h-4 w-4 mr-2" />Pulihkan ke aktif
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[var(--error)]" onClick={() => onTrash?.(note.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />Pindah ke sampah
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => router.push(ROUTES.NOTE(note.id))}>Buka catatan</DropdownMenuItem>
                  {onDuplicate && (
                    <DropdownMenuItem onClick={() => onDuplicate(note.id)}>
                      <Copy className="h-4 w-4 mr-2" />Duplikat
                    </DropdownMenuItem>
                  )}
                  {onMerge && (
                    <DropdownMenuItem onClick={() => onMerge(note.id)}>
                      <GitMerge className="h-4 w-4 mr-2" />Gabung ke...
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onArchive && (
                    <DropdownMenuItem onClick={() => onArchive(note.id)}>
                      <Archive className="h-4 w-4 mr-2" />Arsipkan
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-[var(--error)]" onClick={() => onTrash?.(note.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />Pindah ke sampah
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content preview — masked if secret locked or time capsule locked */}
      {note.isSecret ? (
        <p className="text-sm text-[var(--text-tertiary)] italic pl-2">Konten terenkripsi</p>
      ) : capsuleStatus.isLocked ? (
        <div className="flex items-center gap-1.5 pl-2">
          <Clock className="h-3 w-3 text-[var(--warning)] shrink-0" aria-hidden="true" />
          <p className="text-sm text-[var(--warning)]">
            Terbuka dalam {capsuleStatus.formattedCountdown}
          </p>
        </div>
      ) : preview ? (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 pl-2">{preview}</p>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-0.5 pl-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {note.isPinned && !isTrash && !isArchive && (
            <NotePriorityBadge isPinned={note.isPinned} />
          )}
          {note.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-sm px-2 py-0.5">#{tag}</Badge>
          ))}
          {note.tags.length > 2 && (
            <span className="text-sm text-[var(--text-tertiary)]">+{note.tags.length - 2}</span>
          )}
          {note.language && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5 text-xs text-[var(--text-tertiary)] cursor-default" aria-label={`Bahasa: ${getLanguageLabel(note.language)}`}>
                  <Globe className="h-2.5 w-2.5" />{note.language.toUpperCase()}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{getLanguageLabel(note.language)}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {sizeLabel && <NoteSizeBadge label={sizeLabel} />}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm tabular-nums" style={{ color: `${accentColor}99` }} aria-label={`Dibuat saat ${gradient.label}`}>
                {gradient.label}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Dibuat saat {gradient.label}</TooltipContent>
          </Tooltip>
          {note.wordCount > 0 && (
            <span className="text-sm text-[var(--text-tertiary)] tabular-nums">{note.wordCount} kata</span>
          )}
          <time dateTime={note.updatedAt} className="text-sm text-[var(--text-tertiary)] tabular-nums">
            {formatRelativeTime(note.updatedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
