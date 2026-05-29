'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useNotes, useRestoreNote, useDeleteNote } from '@/hooks/use-notes';
import { deleteNote } from '@/services/notes.service';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { NOTES_QUERY_KEY } from '@/hooks/use-notes';
import { toast } from 'sonner';
import { NoteCard } from '@/components/notes/note-card';
import { NoteCardSkeleton } from '@/components/notes/note-card-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { CONFIG } from '@/constants/config';

export default function TrashPage() {
  const { user } = useAuthStore();
  const { data: notes = [], isLoading } = useNotes({ status: 'trashed' });
  const restoreMutation = useRestoreNote();
  const deleteMutation = useDeleteNote();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const qc = useQueryClient();

  async function handleDeleteAll() {
    if (!user || isDeletingAll) return;
    setIsDeletingAll(true);
    try {
      // Jalankan semua delete secara paralel, tangkap error individual
      const results = await Promise.allSettled(
        notes.map((n) => deleteNote(n.id, user.uid))
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        toast.error(`${failed} catatan gagal dihapus`);
      } else {
        toast.success(`${notes.length} catatan dihapus permanen`);
      }
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    } finally {
      setIsDeletingAll(false);
      setDeleteAllConfirm(false);
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Trash2 className="h-5 w-5 text-[var(--text-tertiary)]" aria-hidden />
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Sampah</h1>
        {notes.length > 0 && (
          <span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-sm text-[var(--text-tertiary)] tabular-nums">
            {notes.length}
          </span>
        )}
        {notes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 text-sm"
            onClick={() => setDeleteAllConfirm(true)}
            disabled={isDeletingAll}
          >
            Hapus Semua
          </Button>
        )}
      </div>

      {notes.length > 0 && (
        <p className="mb-4 flex items-center gap-1.5 text-sm text-[var(--text-tertiary)]">
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
          Catatan di sampah otomatis dihapus setelah {CONFIG.TRASH_RETENTION_DAYS} hari.
        </p>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Sampah kosong"
          description="Catatan yang dihapus akan muncul di sini selama 30 hari."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onRestore={() => restoreMutation.mutate(note.id)}
              onDelete={() => setDeleteTarget(note.id)}
              isTrash
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Permanen?"
        description="Catatan ini akan dihapus selamanya dan tidak bisa dipulihkan."
        confirmLabel="Hapus Permanen"
        variant="destructive"
        onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget); setDeleteTarget(null); } }}
        icon={<Trash2 className="h-5 w-5 text-[var(--error)]" />}
      />

      <ConfirmDialog
        open={deleteAllConfirm}
        onOpenChange={(v) => { if (!isDeletingAll) setDeleteAllConfirm(v); }}
        title="Kosongkan Sampah?"
        description={`Semua ${notes.length} catatan di sampah akan dihapus permanen dan tidak bisa dipulihkan.`}
        confirmLabel="Kosongkan Sampah"
        variant="destructive"
        isLoading={isDeletingAll}
        onConfirm={handleDeleteAll}
        icon={<Trash2 className="h-5 w-5 text-[var(--error)]" />}
      />
    </div>
  );
}

