'use client';

import { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { NoteCard } from './note-card';
import { AnimatedNoteCard, AnimatedNoteList } from './animated-note-card';
import { NoteListSkeleton } from './note-list-skeleton';
import { useTrashNote, useRestoreNote, useDeleteNote } from '@/hooks/use-notes';
import { useSettingsStore } from '@/stores/settings.store';
import type { NoteListItem, NoteStatus } from '@/types/note.types';

interface NoteListProps {
  notes: NoteListItem[];
  isLoading?: boolean;
  status?: NoteStatus;
  emptyTitle?: string;
  emptyDescription?: string;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMerge?: (id: string) => void;
}

export function NoteList({
  notes,
  isLoading = false,
  status = 'active',
  emptyTitle = 'Belum ada catatan',
  emptyDescription = 'Buat catatan pertamamu dengan menekan tombol di atas.',
  onArchive,
  onDuplicate,
  onMerge,
}: NoteListProps) {
  const [pendingTrashId, setPendingTrashId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { mutate: trashNote } = useTrashNote();
  const { mutate: restoreNote } = useRestoreNote();
  const { mutate: deleteNote } = useDeleteNote();
  const { preferences } = useSettingsStore();
  const animationsEnabled = preferences.enableAnimations ?? true;

  const handleTrash = useCallback((id: string) => setPendingTrashId(id), []);
  const handleDelete = useCallback((id: string) => setPendingDeleteId(id), []);

  const confirmTrash = useCallback(() => {
    if (pendingTrashId) { trashNote(pendingTrashId); setPendingTrashId(null); }
  }, [pendingTrashId, trashNote]);

  const confirmDelete = useCallback(() => {
    if (pendingDeleteId) { deleteNote(pendingDeleteId); setPendingDeleteId(null); }
  }, [pendingDeleteId, deleteNote]);

  if (isLoading) return <NoteListSkeleton />;

  if (notes.length === 0) {
    return <EmptyState icon={FileText} title={emptyTitle} description={emptyDescription} />;
  }

  const isTrash = status === 'trashed';

  return (
    <>
      <AnimatedNoteList
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        aria-label="Daftar catatan"
        role="list"
      >
        {notes.map((note, i) => (
          <AnimatedNoteCard key={note.id} index={i} enabled={animationsEnabled}>
            <div role="listitem">
              <NoteCard
                note={note}
                onTrash={handleTrash}
                onRestore={isTrash ? (id) => restoreNote(id) : undefined}
                onDelete={isTrash ? handleDelete : undefined}
                onArchive={!isTrash ? onArchive : undefined}
                onDuplicate={!isTrash ? onDuplicate : undefined}
                onMerge={!isTrash ? onMerge : undefined}
                isTrash={isTrash}
              />
            </div>
          </AnimatedNoteCard>
        ))}
      </AnimatedNoteList>

      <ConfirmDialog
        isOpen={!!pendingTrashId}
        title="Pindahkan ke sampah?"
        description="Catatan akan dihapus otomatis setelah 30 hari di sampah."
        confirmLabel="Pindahkan"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={confirmTrash}
        onCancel={() => setPendingTrashId(null)}
      />

      <ConfirmDialog
        isOpen={!!pendingDeleteId}
        title="Hapus permanen?"
        description="Catatan ini akan dihapus selamanya dan tidak bisa dipulihkan."
        confirmLabel="Hapus permanen"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
