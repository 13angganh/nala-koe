'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Highlighter, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { getAllHighlights, removeHighlight } from '@/services/highlights.service';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import { isOk } from '@/lib/normalizer';
import type { HighlightWithNote } from '@/services/highlights.service';

export default function HighlightsPage() {
  const { user } = useAuthStore();
  const [deletingId, setDeletingId] = useState<{ noteId: string; highlightId: string } | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['highlights', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('unauthenticated');
      const result = await getAllHighlights(user.uid);
      if (isOk(result)) return result.data;
      throw new Error(result.error.message);
    },
    enabled: !!user?.uid,
    staleTime: 30_000,
  });

  async function handleDelete() {
    if (!user || !deletingId || isPending) return;
    setIsPending(true);
    try {
      const result = await removeHighlight(deletingId.noteId, user.uid, deletingId.highlightId);
      if (isOk(result)) {
        toast.success('Highlight dihapus');
        void refetch();
      } else {
        toast.error(result.error.message);
      }
    } finally {
      setIsPending(false);
      setDeletingId(null);
    }
  }

  const grouped = (data ?? []).reduce<Record<string, HighlightWithNote[]>>((acc, item) => {
    if (!acc[item.noteId]) acc[item.noteId] = [];
    acc[item.noteId].push(item);
    return acc;
  }, {});

  const noteEntries = Object.entries(grouped);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10">
          <Highlighter className="h-4 w-4 text-amber-500" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Highlights</h1>
          {data && data.length > 0 && (
            <p className="text-sm text-[var(--text-secondary)]">
              {data.length} highlight di {noteEntries.length} catatan
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-4/5" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState
          icon={Highlighter}
          title="Belum ada highlight"
          description="Buka catatan, pilih teks, lalu lepas untuk meng-highlight bagian penting."
        />
      )}

      {!isLoading && noteEntries.length > 0 && (
        <div className="space-y-5">
          {noteEntries.map(([noteId, items]) => {
            const noteTitle = items[0].noteTitle;
            const noteCreatedAt = items[0].noteCreatedAt;
            return (
              <section
                key={noteId}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] overflow-hidden"
                aria-labelledby={`note-title-${noteId}`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-2.5">
                  <div className="min-w-0">
                    <h2
                      id={`note-title-${noteId}`}
                      className="truncate text-sm font-semibold text-[var(--text-primary)]"
                    >
                      {noteTitle || 'Tanpa judul'}
                    </h2>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {formatRelativeTime(noteCreatedAt)}
                    </p>
                  </div>
                  <Link href={ROUTES.NOTE(noteId)} aria-label={`Buka catatan ${noteTitle}`}>
                    <Button variant="ghost" size="icon-sm">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
                <ul className="divide-y divide-[var(--border)]" role="list">
                  {items.map(({ highlight }) => (
                    <li
                      key={highlight.id}
                      className="group flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors duration-100"
                    >
                      <div
                        className="mt-1 w-[3px] shrink-0 self-stretch rounded-full bg-amber-400"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                          &ldquo;{highlight.text}&rdquo;
                        </p>
                        <time
                          dateTime={highlight.createdAt}
                          className="text-[10px] text-[var(--text-tertiary)]"
                        >
                          Di-highlight {formatRelativeTime(highlight.createdAt)}
                        </time>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeletingId({ noteId, highlightId: highlight.id })}
                        aria-label="Hapus highlight"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-tertiary)] hover:text-[var(--error)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Hapus highlight?"
        description="Highlight ini akan dihapus permanen dari catatan."
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isPending}
      />
    </div>
  );
}
