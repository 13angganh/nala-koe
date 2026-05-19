'use client';

import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getNoteVersions, updateNote } from '@/services/notes.service';
import { useAuthStore } from '@/stores/auth.store';
import { isOk } from '@/lib/normalizer';
import { NOTES_QUERY_KEY } from '@/hooks/use-notes';
import type { NoteVersion } from '@/types/note.types';

export const VERSIONS_QUERY_KEY = 'note-versions';

export function useVersionHistory(noteId: string) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [previewVersion, setPreviewVersion] = useState<NoteVersion | null>(null);

  const { data: versions = [], isLoading } = useQuery({
    queryKey: [VERSIONS_QUERY_KEY, noteId],
    queryFn: async () => {
      const result = await getNoteVersions(noteId);
      if (isOk(result)) return result.data;
      throw new Error(result.error.message);
    },
    enabled: !!noteId && !!user?.uid,
    staleTime: 60_000,
  });

  const restoreMutation = useMutation({
    mutationFn: async (version: NoteVersion) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await updateNote(noteId, user!.uid, {
        title: version.snapshot.title,
        content: version.snapshot.content,
        blocks: version.snapshot.blocks,
      });
      if (!isOk(result)) throw new Error(result.error.message);
      return version;
    },
    onSuccess: (version) => {
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, noteId] });
      void qc.invalidateQueries({ queryKey: [VERSIONS_QUERY_KEY, noteId] });
      toast.success(`Dipulihkan ke versi ${formatVersionLabel(version)}`);
      setPreviewVersion(null);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal memulihkan versi');
    },
  });

  const previewVersionContent = useCallback((version: NoteVersion | null) => {
    setPreviewVersion(version);
  }, []);

  const restoreVersion = useCallback(
    (version: NoteVersion) => {
      restoreMutation.mutate(version);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [restoreMutation.mutate]
  );

  return {
    versions,
    isLoading,
    previewVersion,
    isRestoring: restoreMutation.isPending,
    previewVersionContent,
    restoreVersion,
  };
}

export function formatVersionLabel(version: NoteVersion): string {
  const date = new Date(version.createdAt);
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Returns a simplified diff between two text snapshots as line-level changes */
export function diffText(
  oldText: string,
  newText: string
): Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const result: Array<{ type: 'added' | 'removed' | 'unchanged'; text: string }> = [];
  const maxLen = Math.max(oldLines.length, newLines.length);

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined) {
      result.push({ type: 'added', text: newLine });
    } else if (newLine === undefined) {
      result.push({ type: 'removed', text: oldLine });
    } else if (oldLine === newLine) {
      result.push({ type: 'unchanged', text: oldLine });
    } else {
      result.push({ type: 'removed', text: oldLine });
      result.push({ type: 'added', text: newLine });
    }
  }

  return result;
}
