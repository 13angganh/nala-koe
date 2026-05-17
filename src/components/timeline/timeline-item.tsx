'use client';

import { useRouter } from 'next/navigation';
import { FileText, Lock, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import type { NoteListItem } from '@/types/note.types';
import { MOODS } from '@/constants/moods';

interface TimelineItemProps {
  note: NoteListItem;
  isLeft: boolean;
}

export function TimelineItem({ note, isLeft }: TimelineItemProps) {
  const router = useRouter();
  const mood = note.mood ? MOODS.find((m) => m.id === note.mood) : null;

  function handleClick() {
    router.push(ROUTES.NOTE(note.id));
  }

  const preview = note.content.slice(0, 120);

  return (
    <div
      className={`flex items-start gap-4 group ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Card */}
      <button
        onClick={handleClick}
        className={`flex-1 max-w-[calc(50%-2rem)] text-left rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[var(--accent)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${isLeft ? 'mr-auto' : 'ml-auto'}`}
        aria-label={`Buka catatan: ${note.title}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
            {note.isSecret ? (
              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                <Lock size={12} />
                Catatan rahasia
              </span>
            ) : note.isTimeCapsule ? (
              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                <Clock size={12} />
                Time capsule
              </span>
            ) : (
              note.title || 'Tanpa judul'
            )}
          </h3>
          {mood && (
            <span className="text-base flex-shrink-0" aria-label={mood.label}>
              {/* mood icon rendered as text since it's data, not UI decoration */}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {mood.label}
              </Badge>
            </span>
          )}
        </div>

        {/* Preview */}
        {!note.isSecret && !note.isTimeCapsule && preview && (
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-3">
            {preview}
            {note.content.length > 120 ? '…' : ''}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            {formatDate(note.createdAt)}
          </span>
          {note.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {note.tags.length > 2 && (
            <span className="text-[10px] text-[var(--text-muted)]">
              +{note.tags.length - 2}
            </span>
          )}
          {note.wordCount > 0 && (
            <span className="text-[10px] text-[var(--text-muted)] ml-auto flex items-center gap-1">
              <FileText size={10} />
              {note.wordCount} kata
            </span>
          )}
        </div>
      </button>

      {/* Dot connector */}
      <div className="flex flex-col items-center flex-shrink-0 pt-4">
        <div className="w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--surface-base)] shadow-sm group-hover:scale-125 transition-transform duration-200" />
      </div>

      {/* Spacer for opposite side */}
      <div className="flex-1 max-w-[calc(50%-2rem)]" />
    </div>
  );
}
