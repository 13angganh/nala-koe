'use client';

import { useState, useDeferredValue, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteList } from '@/components/notes/note-list';
import { NoteSearch } from '@/components/notes/note-search';
import { NoteFilters } from '@/components/notes/note-filters';
import { NoteSort } from '@/components/notes/note-sort';
import { NoteMergeDialog } from '@/components/notes/note-merge-dialog';
import { SmartFolderPanel } from '@/components/smart-folder/smart-folder-panel';
import { useNotes, useCreateNote, useArchiveNote, useDuplicateNote } from '@/hooks/use-notes';
import { useSmartFolders, type SmartFolderKey } from '@/hooks/use-smart-folder';
import { useMergeNotes } from '@/hooks/use-merge-notes';
import { useNotesStore } from '@/stores/notes.store';
import { ROUTES } from '@/constants/routes';
import type { NoteStatus, NoteSort as NoteSortType, NoteSortDirection, NoteListItem } from '@/types/note.types';

export default function NotesPage() {
  const router = useRouter();
  const { filters, setFilters } = useNotesStore();
  const [searchValue, setSearchValue] = useState('');
  const [showSmartFolders, setShowSmartFolders] = useState(false);
  const [activeFolderKey, setActiveFolderKey] = useState<SmartFolderKey | null>(null);
  const [mergeTarget, setMergeTarget] = useState<NoteListItem | null>(null);
  const deferredSearch = useDeferredValue(searchValue);

  const activeFilters = {
    ...filters,
    ...(deferredSearch ? { search: deferredSearch } : {}),
  };

  const { data: allNotes = [], isLoading } = useNotes(activeFilters);
  const { mutateAsync: createNote, isPending: isCreating } = useCreateNote();
  const archiveMutation = useArchiveNote();
  const duplicateMutation = useDuplicateNote();
  const { merge, isMerging } = useMergeNotes();

  const smartFolders = useSmartFolders(allNotes);

  // Filter by smart folder if active
  const notes = activeFolderKey
    ? allNotes.filter((n) => {
        const folder = smartFolders.find((f) => f.key === activeFolderKey);
        return folder ? folder.noteIds.includes(n.id) : true;
      })
    : allNotes;

  const handleCreate = useCallback(async () => {
    const note = await createNote({});
    router.push(ROUTES.NOTE(note.id));
  }, [createNote, router]);

  const status = (filters.status ?? 'active') as NoteStatus;

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Catatan</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSmartFolders((v) => !v)}
            aria-pressed={showSmartFolders}
            aria-label="Smart Folder"
            className="gap-1.5 text-sm"
          >
            <FolderOpen className="h-4 w-4" aria-hidden />
            Smart Folder
          </Button>
          <Button
            onClick={handleCreate}
            isLoading={isCreating}
            size="sm"
            className="gap-1.5"
            aria-label="Buat catatan baru"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat Catatan
          </Button>
        </div>
      </div>

      {showSmartFolders && smartFolders.length > 0 && (
        <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <SmartFolderPanel
            folders={smartFolders}
            activeKey={activeFolderKey}
            onSelect={setActiveFolderKey}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <NoteSearch
          value={searchValue}
          onChange={setSearchValue}
          className="w-full sm:max-w-xs"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <NoteFilters
            status={status}
            onStatusChange={(s) => setFilters({ status: s })}
          />
          <NoteSort
            sort={filters.sort ?? 'updatedAt'}
            sortDirection={filters.sortDirection ?? 'desc'}
            onSortChange={(sort) => setFilters({ sort: sort as NoteSortType })}
            onDirectionChange={(dir) => setFilters({ sortDirection: dir as NoteSortDirection })}
          />
        </div>
      </div>

      <NoteList
        notes={notes}
        isLoading={isLoading}
        status={status}
        emptyTitle={activeFolderKey ? 'Tidak ada catatan di folder ini' : 'Belum ada catatan'}
        emptyDescription={activeFolderKey ? 'Coba pilih smart folder lain.' : 'Mulai tulis pikiran pertamamu.'}
        onArchive={(id) => archiveMutation.mutate(id)}
        onDuplicate={(id) => duplicateMutation.mutate(id)}
        onMerge={(id) => {
          const note = notes.find((n) => n.id === id);
          if (note) setMergeTarget(note);
        }}
      />

      {mergeTarget && (
        <NoteMergeDialog
          open={!!mergeTarget}
          onClose={() => setMergeTarget(null)}
          targetNote={mergeTarget}
          allNotes={allNotes}
          onMerge={(targetId, sourceIds) => merge({ targetId, sourceIds })}
          isMerging={isMerging}
        />
      )}
    </div>
  );
}
