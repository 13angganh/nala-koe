'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';
import { mergeNotes } from '@/services/notes.service';
import { isOk } from '@/lib/normalizer';
import { NOTES_QUERY_KEY } from './use-notes';

export function useMergeNotes() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { removeNoteFromList } = useNotesStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: async ({
      targetId,
      sourceIds,
    }: {
      targetId: string;
      sourceIds: string[];
    }) => {
      const result = await mergeNotes(targetId, sourceIds, user!.uid);
      if (!isOk(result)) throw new Error(result.error.message);
      return { targetId, sourceIds };
    },
    onSuccess: ({ sourceIds }) => {
      sourceIds.forEach((id) => removeNoteFromList(id));
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      setSelectedIds([]);
      toast.success('Catatan berhasil digabungkan');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal menggabungkan catatan');
    },
  });

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  return {
    selectedIds,
    toggleSelect,
    clearSelection,
    isMerging: mutation.isPending,
    merge: mutation.mutate,
  };
}
