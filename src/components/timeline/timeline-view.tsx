'use client';

import { useMemo, useRef } from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { TimelineItem } from './timeline-item';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import type { NoteListItem } from '@/types/note.types';

interface TimelineGroup {
  label: string;
  dateKey: string;
  notes: NoteListItem[];
}

interface TimelineViewProps {
  notes: NoteListItem[];
}

function groupByMonth(notes: NoteListItem[]): TimelineGroup[] {
  const map = new Map<string, NoteListItem[]>();

  for (const note of notes) {
    const d = new Date(note.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(note);
  }

  const groups: TimelineGroup[] = [];
  for (const [key, groupNotes] of map.entries()) {
    const [year, month] = key.split('-').map(Number) as [number, number];
    const d = new Date(year, month - 1, 1);
    groups.push({
      dateKey: key,
      label: d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
      notes: groupNotes.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    });
  }

  return groups.sort((a, b) => (a.dateKey > b.dateKey ? 1 : -1));
}

export function TimelineView({ notes }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => groupByMonth(notes), [notes]);

  if (notes.length === 0) {
    return (
      <EmptyState
        title="Belum ada catatan"
        description="Buat catatan pertamamu untuk melihat perjalanan ide di sini."
        icon={FileText}
      />
    );
  }

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {/* Scroll controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--text-muted)]">
          {notes.length} catatan · Scroll untuk melihat riwayat
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollBy(-480)}
            aria-label="Scroll ke kiri"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollBy(480)}
            aria-label="Scroll ke kanan"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="flex gap-0 min-w-max">
          {groups.map((group) => (
            <TimelineGroup key={group.dateKey} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TimelineGroupProps {
  group: TimelineGroup;
}

function TimelineGroup({ group }: TimelineGroupProps) {
  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px]">
      {/* Month label */}
      <div className="sticky top-0 z-10 bg-[var(--surface-base)] pb-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider whitespace-nowrap px-2 py-1 rounded bg-[var(--surface-subtle)] border border-[var(--border)]">
            {group.label}
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
      </div>

      {/* Notes in this month */}
      <div className="flex flex-col gap-3 px-2">
        {group.notes.map((note) => (
          <VerticalTimelineItem key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}

interface VerticalTimelineItemProps {
  note: NoteListItem;
}

function VerticalTimelineItem({ note }: VerticalTimelineItemProps) {
  const d = new Date(note.createdAt);
  const dayLabel = d.toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex gap-3 group">
      {/* Date indicator */}
      <div className="flex flex-col items-center flex-shrink-0 pt-2">
        <span className="text-[10px] font-mono text-[var(--text-muted)] whitespace-nowrap">
          {dayLabel}
        </span>
        <div className="mt-1 w-0.5 flex-1 bg-[var(--border)] group-last:hidden" />
      </div>

      {/* Card */}
      <TimelineCard note={note} />
    </div>
  );
}

function TimelineCard({ note }: { note: NoteListItem }) {
  const preview = note.content.slice(0, 100);

  return (
    <a
      href={`/notes/${note.id}`}
      className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] p-3 text-left transition-all duration-150 hover:border-[var(--accent)] hover:shadow-sm hover:-translate-y-0.5 block"
    >
      <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1 mb-1">
        {note.title || 'Tanpa judul'}
      </h4>
      {preview && (
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {preview}
          {note.content.length > 100 ? '…' : ''}
        </p>
      )}
      {note.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--surface-subtle)] text-[var(--text-muted)] border border-[var(--border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
