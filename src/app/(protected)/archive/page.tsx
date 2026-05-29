'use client';

import { useState } from 'react';
import { Archive, Trash2 } from 'lucide-react';
import { useNotes, useRestoreNote, useTrashNote } from '@/hooks/use-notes';
import { NoteCard } from '@/components/notes/note-card';
import { NoteCardSkeleton } from '@/components/notes/note-card-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

export default function ArchivePage() {
  const { data: notes = [], isLoading } = useNotes({ status: 'archived' });
  const restoreMutation = useRestoreNote();
  const trashMutation = useTrashNote();
  const [trashTarget, setTrashTarget] = useState<string | null>(null);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Archive className="h-5 w-5 text-[var(--text-tertiary)]" aria-hidden />
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Arsip</h1>
        {notes.length > 0 && (
          <span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-sm text-[var(--text-tertiary)] tabular-nums">
            {notes.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="Arsip kosong"
          description="Catatan yang diarsipkan akan muncul di sini."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onRestore={() => restoreMutation.mutate(note.id)}
              onTrash={() => setTrashTarget(note.id)}
              isArchive
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!trashTarget}
        onOpenChange={(v) => !v && setTrashTarget(null)}
        title="Pindahkan ke Sampah?"
        description="Catatan akan dipindahkan ke sampah dan bisa dihapus permanen setelah 30 hari."
        confirmLabel="Pindah ke Sampah"
        variant="destructive"
        onConfirm={() => { if (trashTarget) { trashMutation.mutate(trashTarget); setTrashTarget(null); } }}
        icon={<Trash2 className="h-5 w-5 text-[var(--error)]" />}
      />
    </div>
  );
}
