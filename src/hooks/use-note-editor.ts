'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';
import { getNoteById, updateNote } from '@/services/notes.service';
import { isOk } from '@/lib/normalizer';
import { analyzeContent } from '@/lib/reading-time';
import { detectLanguage } from '@/lib/language-detector';
import type { UpdateNoteInput, NoteLocation, NoteContentBlock, NoteReaction, NoteHighlight } from '@/types/note.types';
import type { MoodId } from '@/types/mood.types';
import type { WeatherSnapshot } from '@/types/api.types';
import type { NoteFontWeight, NoteTexture } from '@/types/settings.types';
import { generateId, stripHtml } from '@/lib/utils';
import { createEmptyTable, serializeTable } from '@/components/notes/note-table';
import { NOTES_QUERY_KEY } from './use-notes';

const AUTO_SAVE_DELAY = 1500; // ms

export function useNoteEditor(noteId: string) {
  const { user } = useAuthStore();
  const { activeNote, setActiveNote, updateActiveNote, setSaving } = useNotesStore();
  const qc = useQueryClient();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Accumulates field patches scheduled within the same debounce window so that
  // e.g. a title edit followed by a content edit (both within 1.5s) are saved
  // together instead of the later call silently overwriting/dropping the earlier one.
  const pendingInputRef = useRef<UpdateNoteInput>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load note
  const { isLoading, isError } = useQuery({
    queryKey: [NOTES_QUERY_KEY, noteId, user?.uid],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: enabled: !!user?.uid
      const result = await getNoteById(noteId, user!.uid);
      if (!isOk(result)) throw new Error(result.error.message);
      setActiveNote(result.data);
      return result.data;
    },
    enabled: !!user?.uid && !!noteId,
    staleTime: 60_000,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (input: UpdateNoteInput) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: mutationFn only reachable when user is authenticated (ProtectedLayout)
      const result = await updateNote(noteId, user!.uid, input);
      if (!isOk(result)) throw new Error(result.error.message);
    },
    onMutate: () => setSaving(true),
    onSuccess: () => {
      setSaving(false);
      setLastSavedAt(new Date());
      setIsDirty(false);
      void qc.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      setSaving(false);
      toast.error(error.message ?? 'Gagal menyimpan catatan');
    },
  });

  const scheduleAutoSave = useCallback(
    (input: UpdateNoteInput) => {
      pendingInputRef.current = { ...pendingInputRef.current, ...input };
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        const merged = pendingInputRef.current;
        pendingInputRef.current = {};
        autoSaveTimer.current = null;
        saveMutation.mutate(merged);
      }, AUTO_SAVE_DELAY);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      updateActiveNote({ title });
      setIsDirty(true);
      scheduleAutoSave({ title });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleContentChange = useCallback(
    (content: string, contentFormat?: 'plain' | 'html') => {
      const { wordCount } = analyzeContent(content);
      // Auto-detect language when content is long enough
      const detection = detectLanguage(stripHtml(content));
      const language = detection.confidence >= 0.5 ? detection.language : (activeNote?.language ?? null);
      const patch: UpdateNoteInput = { content, wordCount, language };
      if (contentFormat) patch.contentFormat = contentFormat;
      updateActiveNote(patch);
      setIsDirty(true);
      scheduleAutoSave(patch);
    },
    [updateActiveNote, scheduleAutoSave, activeNote?.language]
  );

  const handleBlocksChange = useCallback(
    (blocks: typeof activeNote extends null ? never[] : NonNullable<typeof activeNote>['blocks']) => {
      updateActiveNote({ blocks });
      setIsDirty(true);
      scheduleAutoSave({ blocks });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleManualSave = useCallback(() => {
    if (!activeNote) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = null;
    pendingInputRef.current = {};
    saveMutation.mutate({
      title: activeNote.title,
      content: activeNote.content,
      blocks: activeNote.blocks,
      mood: activeNote.mood,
      tags: activeNote.tags,
      language: activeNote.language,
      weather: activeNote.weather,
      location: activeNote.location,
    });
  }, [activeNote, saveMutation]);

  const handleTogglePin = useCallback(() => {
    if (!activeNote) return;
    const isPinned = !activeNote.isPinned;
    updateActiveNote({ isPinned });
    saveMutation.mutate({ isPinned });
  }, [activeNote, updateActiveNote, saveMutation]);

  // ── Phase 3: Mood, Tags, Weather, Location ───────────────────────────────

  const handleMoodChange = useCallback(
    (mood: MoodId | null) => {
      updateActiveNote({ mood });
      setIsDirty(true);
      scheduleAutoSave({ mood });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleTagsChange = useCallback(
    (tags: string[]) => {
      updateActiveNote({ tags });
      setIsDirty(true);
      scheduleAutoSave({ tags });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleWeatherChange = useCallback(
    (weather: WeatherSnapshot | null) => {
      updateActiveNote({ weather });
      setIsDirty(true);
      scheduleAutoSave({ weather });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleLocationChange = useCallback(
    (location: NoteLocation | null) => {
      updateActiveNote({ location });
      setIsDirty(true);
      scheduleAutoSave({ location });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  // ── Phase 4: Font, Texture, LinkedNotes, Table, Math, UrlPreview ──────────

  const handleFontChange = useCallback(
    (fontWeight: NoteFontWeight) => {
      updateActiveNote({ fontWeight });
      setIsDirty(true);
      scheduleAutoSave({ fontWeight });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleTextureChange = useCallback(
    (texture: NoteTexture) => {
      updateActiveNote({ texture });
      setIsDirty(true);
      scheduleAutoSave({ texture });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleLinkedNotesChange = useCallback(
    (linkedNoteIds: string[]) => {
      updateActiveNote({ linkedNoteIds });
      setIsDirty(true);
      scheduleAutoSave({ linkedNoteIds });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  /** Insert a new empty Table block at the end of blocks */
  const handleInsertTable = useCallback(() => {
    if (!activeNote) return;
    const newBlock: NoteContentBlock = {
      id: generateId(),
      type: 'table',
      content: serializeTable(createEmptyTable(3, 2)),
      order: activeNote.blocks.length,
    };
    const updated = [...activeNote.blocks, newBlock];
    updateActiveNote({ blocks: updated });
    setIsDirty(true);
    scheduleAutoSave({ blocks: updated });
  }, [activeNote, updateActiveNote, scheduleAutoSave]);

  /** Insert a new empty Math block at the end of blocks */
  const handleInsertMath = useCallback(() => {
    if (!activeNote) return;
    const newBlock: NoteContentBlock = {
      id: generateId(),
      type: 'math',
      content: '',
      order: activeNote.blocks.length,
    };
    const updated = [...activeNote.blocks, newBlock];
    updateActiveNote({ blocks: updated });
    setIsDirty(true);
    scheduleAutoSave({ blocks: updated });
  }, [activeNote, updateActiveNote, scheduleAutoSave]);

  /** Insert a new URL-preview block. rawUrl becomes the initial content. */
  const handleInsertUrlPreview = useCallback(
    (rawUrl: string) => {
      if (!activeNote) return;
      const newBlock: NoteContentBlock = {
        id: generateId(),
        type: 'url-preview',
        // Store as JSON: { url, meta, cachedAt } — initially no meta
        content: JSON.stringify({ url: rawUrl, meta: null, cachedAt: null }),
        order: activeNote.blocks.length,
      };
      const updated = [...activeNote.blocks, newBlock];
      updateActiveNote({ blocks: updated });
      setIsDirty(true);
      scheduleAutoSave({ blocks: updated });
    },
    [activeNote, updateActiveNote, scheduleAutoSave]
  );

  // ── Phase 6: Time Capsule, Secret, Offline ────────────────────────────────

  const handleTimeCapsuleChange = useCallback(
    (isTimeCapsule: boolean, timeCapsuleUnlockAt: string | null) => {
      updateActiveNote({ isTimeCapsule, timeCapsuleUnlockAt });
      saveMutation.mutate({ isTimeCapsule, timeCapsuleUnlockAt });
    },
    [updateActiveNote, saveMutation]
  );

  const handleSecretChange = useCallback(
    (isSecret: boolean) => {
      updateActiveNote({ isSecret });
      saveMutation.mutate({ isSecret });
    },
    [updateActiveNote, saveMutation]
  );

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = null;
      }
      const pending = pendingInputRef.current;
      pendingInputRef.current = {};
      if (Object.keys(pending).length > 0) {
        // Fire-and-forget: the mutation runs against the query client, which
        // outlives this component, so the patch still reaches Firestore even
        // though we're navigating away right now.
        saveMutation.mutate(pending);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reason: intentionally only runs on mount/unmount; saveMutation.mutate is stable
  }, []);

  const { wordCount, readingTimeMinutes } = analyzeContent(activeNote?.content ?? '');

  const handleReactionChange = useCallback(
    (reaction: NoteReaction | null) => {
      updateActiveNote({ reaction });
      setIsDirty(true);
      scheduleAutoSave({ reaction });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  const handleHighlightsChange = useCallback(
    (highlights: NoteHighlight[]) => {
      updateActiveNote({ highlights });
      // Highlights are saved directly via service, but also sync to activeNote
    },
    [updateActiveNote]
  );

  const handleScheduledChange = useCallback(
    (isScheduled: boolean, scheduledAt: string | null) => {
      updateActiveNote({ isScheduled, scheduledAt });
      saveMutation.mutate({ isScheduled, scheduledAt });
    },
    [updateActiveNote, saveMutation]
  );

  return {
    note: activeNote,
    isLoading,
    isError,
    isSaving: saveMutation.isPending,
    isDirty,
    lastSavedAt,
    wordCount,
    readingTimeMinutes,
    // Phase 3
    handleTitleChange,
    handleContentChange,
    handleBlocksChange,
    handleManualSave,
    handleTogglePin,
    handleMoodChange,
    handleTagsChange,
    handleWeatherChange,
    handleLocationChange,
    // Phase 4
    handleFontChange,
    handleTextureChange,
    handleLinkedNotesChange,
    handleInsertTable,
    handleInsertMath,
    handleInsertUrlPreview,
    // Phase 6
    handleTimeCapsuleChange,
    handleSecretChange,
    // Phase 8
    handleReactionChange,
    handleHighlightsChange,
    // Phase 9
    handleScheduledChange,
  };
}
