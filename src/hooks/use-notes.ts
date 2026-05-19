'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';
import {
  getNotes,
  createNote,
  trashNote,
  restoreNote,
  deleteNote,
  getRecentNotes,
  archiveNote,
  duplicateNote,
} from '@/services/notes.service';
import { isOk } from '@/lib/normalizer';
import type { NoteFilters, CreateNoteInput } from '@/types/note.types';

export const NOTES_QUERY_KEY = 'notes';

export function useNotes(filters: NoteFilters = {}) {
  const { user } = useAuthStore();
  const { setNotes, setListLoading } = useNotesStore();

  return useQuery({
    queryKey: [NOTES_QUERY_KEY, user?.uid, filters],
    queryFn: async () => {
      setListLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
        const result = await getNotes(user!.uid, filters); // reason: safe — enabled: !!user?.uid prevents execution when user is null
        if (isOk(result)) {
          setNotes(result.data);
          return result.data;
        }
        throw new Error(result.error.message);
      } finally {
        setListLoading(false);
      }
    },
    enabled: !!user?.uid,
    staleTime: 30_000,
  });
}

export function useRecentNotes(count = 5) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [NOTES_QUERY_KEY, 'recent', user?.uid, count],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const result = await getRecentNotes(user!.uid, count); // reason: safe — enabled: !!user?.uid prevents execution when user is null
      if (isOk(result)) return result.data;
      throw new Error(result.error.message);
    },
    enabled: !!user?.uid,
    staleTime: 30_000,
  });
}

export function useCreateNote() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { addNote } = useNotesStore();

  return useMutation({
    mutationFn: async (input: Partial<CreateNoteInput>) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await createNote(user!.uid, input); // reason: safe — mutationFn only reachable when user is authenticated (ProtectedLayout)
      if (!isOk(result)) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (note) => {
      const listItem = {
        id: note.id,
        title: note.title,
        content: note.content,
        mood: note.mood,
        tags: note.tags,
        status: note.status,
        isPinned: note.isPinned,
        isSecret: note.isSecret,
        isTimeCapsule: note.isTimeCapsule,
        timeCapsuleUnlockAt: note.timeCapsuleUnlockAt,
        wordCount: note.wordCount,
        linkedNoteIds: note.linkedNoteIds,
        texture: note.texture,
        fontWeight: note.fontWeight,
        accentColor: note.accentColor,
        language: note.language,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
      addNote(listItem);
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal membuat catatan');
    },
  });
}

export function useTrashNote() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { removeNoteFromList } = useNotesStore();

  return useMutation({
    mutationFn: async (noteId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await trashNote(noteId, user!.uid); // reason: safe — mutationFn only reachable when user is authenticated (ProtectedLayout)
      if (!isOk(result)) throw new Error(result.error.message);
      return noteId;
    },
    onSuccess: (noteId) => {
      removeNoteFromList(noteId);
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      toast.success('Catatan dipindahkan ke sampah');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal memindahkan ke sampah');
    },
  });
}

export function useRestoreNote() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { removeNoteFromList } = useNotesStore();

  return useMutation({
    mutationFn: async (noteId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await restoreNote(noteId, user!.uid); // reason: safe — mutationFn only reachable when user is authenticated (ProtectedLayout)
      if (!isOk(result)) throw new Error(result.error.message);
      return noteId;
    },
    onSuccess: (noteId) => {
      removeNoteFromList(noteId);
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      toast.success('Catatan berhasil dipulihkan');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal memulihkan catatan');
    },
  });
}

export function useDeleteNote() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { removeNoteFromList } = useNotesStore();

  return useMutation({
    mutationFn: async (noteId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await deleteNote(noteId, user!.uid); // reason: safe — mutationFn only reachable when user is authenticated (ProtectedLayout)
      if (!isOk(result)) throw new Error(result.error.message);
      return noteId;
    },
    onSuccess: (noteId) => {
      removeNoteFromList(noteId);
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      toast.success('Catatan dihapus permanen');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal menghapus catatan');
    },
  });
}

export function useArchiveNote() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { removeNoteFromList } = useNotesStore();

  return useMutation({
    mutationFn: async (noteId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await archiveNote(noteId, user!.uid); // reason: safe — mutationFn only reachable when user is authenticated (ProtectedLayout)
      if (!isOk(result)) throw new Error(result.error.message);
      return noteId;
    },
    onSuccess: (noteId) => {
      removeNoteFromList(noteId);
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      toast.success('Catatan diarsipkan');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal mengarsipkan catatan');
    },
  });
}

export function useDuplicateNote() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { addNote } = useNotesStore();

  return useMutation({
    mutationFn: async (noteId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await duplicateNote(noteId, user!.uid); // reason: safe — mutationFn only reachable when user is authenticated (ProtectedLayout)
      if (!isOk(result)) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (note) => {
      const listItem = {
        id: note.id,
        title: note.title,
        content: note.content,
        mood: note.mood,
        tags: note.tags,
        status: note.status,
        isPinned: note.isPinned,
        isSecret: note.isSecret,
        isTimeCapsule: note.isTimeCapsule,
        timeCapsuleUnlockAt: note.timeCapsuleUnlockAt,
        wordCount: note.wordCount,
        linkedNoteIds: note.linkedNoteIds,
        texture: note.texture,
        fontWeight: note.fontWeight,
        accentColor: note.accentColor,
        language: note.language,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      };
      addNote(listItem);
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
      toast.success('Catatan berhasil disalin');
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Gagal menduplikat catatan');
    },
  });
}
