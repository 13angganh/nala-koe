'use client';

import Link from 'next/link';
import { Clock, CalendarClock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { ROUTES } from '@/constants/routes';

interface ScheduledNote {
  id: string;
  title: string;
  content: string;
  scheduledAt: string;
  createdAt: string;
}

interface ScheduledNotesPanelProps {
  notes: ScheduledNote[];
  isLoading: boolean;
}

function formatScheduledAt(iso: string): { label: string; isPast: boolean; isSoon: boolean } {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  const formatted = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    label: formatted,
    isPast: diffMs < 0,
    isSoon: diffMs >= 0 && diffDays <= 1,
  };
}

export function ScheduledNotesPanel({ notes, isLoading }: ScheduledNotesPanelProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Tidak ada catatan terjadwal"
        description="Kamu bisa menjadwalkan catatan muncul di feed pada waktu tertentu saat mengedit catatan."
      />
    );
  }

  // Sort: upcoming first, then past
  const upcoming = notes.filter((n) => new Date(n.scheduledAt) >= new Date());
  const past = notes.filter((n) => new Date(n.scheduledAt) < new Date());

  function renderNote(note: ScheduledNote) {
    const { label, isPast, isSoon } = formatScheduledAt(note.scheduledAt);
    return (
      <Link
        key={note.id}
        href={ROUTES.NOTE(note.id)}
        className="group flex items-start gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] p-3 transition-colors hover:bg-[var(--surface-subtle)]"
      >
        <div
          className={cn(
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
            isPast
              ? 'bg-[var(--surface-muted)] text-[var(--text-tertiary)]'
              : isSoon
              ? 'bg-[var(--warning-subtle)] text-[var(--warning)]'
              : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
          )}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-primary)]">
            {note.title || 'Tanpa judul'}
          </p>
          <p className="mt-0.5 truncate text-sm text-[var(--text-tertiary)]">
            {note.content.slice(0, 80) || '—'}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-medium',
                isPast
                  ? 'bg-[var(--surface-muted)] text-[var(--text-tertiary)]'
                  : isSoon
                  ? 'bg-[var(--warning-subtle)] text-[var(--warning)]'
                  : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
              )}
            >
              <CalendarClock className="h-2.5 w-2.5" />
              {isPast ? 'Sudah lewat · ' : ''}{label}
            </span>
          </div>
        </div>

        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    );
  }

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
            Akan datang
          </p>
          <div className="space-y-2">{upcoming.map(renderNote)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
            Sudah lewat
          </p>
          <div className="space-y-2 opacity-60">{past.map(renderNote)}</div>
        </div>
      )}
    </div>
  );
}
