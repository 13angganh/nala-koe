'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';
import { getNoteById, updateNote } from '@/services/notes.service';
import { isOk } from '@/lib/normalizer';
import { analyzeContent, estimateReadingTime } from '@/lib/reading-time';
import { detectLanguage } from '@/lib/language-detector';
import type { UpdateNoteInput, NoteLocation, NoteContentBlock, NoteReaction, NoteHighlight, NoteSectionKey } from '@/types/note.types';
import type { MoodId } from '@/types/mood.types';
import type { WeatherSnapshot } from '@/types/api.types';
import type { NoteFontWeight, NoteTexture } from '@/types/settings.types';
import { generateId, stripHtml } from '@/lib/utils';
import { createEmptyTable, serializeTable } from '@/components/notes/note-table';
import { NOTES_QUERY_KEY } from './use-notes';

const AUTO_SAVE_DELAY = 1500; // ms
const CONTENT_ANALYSIS_DELAY = 400; // ms — debounce for word count + language detection

export function useNoteEditor(noteId: string) {
  const { user } = useAuthStore();
  const { activeNote, setActiveNote, updateActiveNote, setSaving } = useNotesStore();
  const qc = useQueryClient();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      // Defensive guard: if a refetch lands while the user has unsaved edits
      // still sitting in the auto-save debounce window (pendingInputRef),
      // re-apply those edits on top of the freshly-fetched server data so
      // they're never silently discarded. This matters for any path that
      // can trigger a refetch of THIS query while the editor is open —
      // window refocus, reconnect, manual invalidation elsewhere, etc.
      const pending = pendingInputRef.current;
      const merged = Object.keys(pending).length > 0 ? { ...result.data, ...pending } : result.data;
      setActiveNote(merged);
      return merged;
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
      // IMPORTANT: We deliberately do NOT invalidate this note's own detail
      // query ([NOTES_QUERY_KEY, noteId, user.uid]). Doing so would refetch
      // from Firestore and call setActiveNote(), overwriting any local edit
      // that's still sitting in the auto-save debounce window (not yet
      // written) — silently reverting fields like tags that the user just
      // typed. The active note is already the source of truth locally; we
      // only need OTHER views (notes list, recent notes, stats, dashboards)
      // to refetch so they reflect this save.
      void qc.invalidateQueries({
        queryKey: [NOTES_QUERY_KEY],
        predicate: (query) => {
          const [, key1, key2] = query.queryKey;
          const isThisNoteDetail = key1 === noteId && key2 === user?.uid;
          return !isThisNoteDetail;
        },
      });
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
      // Update content immediately so the textarea/editor never waits on
      // analysis — analyzeContent() and detectLanguage() both do a full
      // pass over the string, which gets expensive on longer notes and was
      // previously running synchronously on every single keystroke,
      // producing visible input lag.
      const patch: UpdateNoteInput = { content };
      if (contentFormat) patch.contentFormat = contentFormat;
      updateActiveNote(patch);
      setIsDirty(true);
      scheduleAutoSave(patch);

      // Word count + language detection are debounced separately (shorter
      // window than auto-save) so they settle shortly after the user pauses
      // typing, without blocking each keystroke.
      if (analysisTimer.current) clearTimeout(analysisTimer.current);
      analysisTimer.current = setTimeout(() => {
        analysisTimer.current = null;
        const { wordCount } = analyzeContent(content);
        const detection = detectLanguage(stripHtml(content));
        const language = detection.confidence >= 0.5 ? detection.language : (activeNote?.language ?? null);
        const analysisPatch: UpdateNoteInput = { wordCount, language };
        updateActiveNote(analysisPatch);
        scheduleAutoSave(analysisPatch);
      }, CONTENT_ANALYSIS_DELAY);
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
      contentFormat: activeNote.contentFormat,
      blocks: activeNote.blocks,
      mood: activeNote.mood,
      tags: activeNote.tags,
      language: activeNote.language,
      weather: activeNote.weather,
      location: activeNote.location,
      fontWeight: activeNote.fontWeight,
      texture: activeNote.texture,
      linkedNoteIds: activeNote.linkedNoteIds,
      isPinned: activeNote.isPinned,
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
      if (analysisTimer.current) {
        clearTimeout(analysisTimer.current);
        analysisTimer.current = null;
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

  // wordCount/readingTimeMinutes are sourced from activeNote.wordCount, which
  // is updated by the debounced analysis in handleContentChange (settles
  // ~400ms after the user pauses typing) rather than recomputed from the
  // raw content string on every render — recomputing here would mean a
  // full word-count pass on every single keystroke purely to feed a toolbar
  // badge display.
  const wordCount = activeNote?.wordCount ?? 0;
  const readingTimeMinutes = useMemo(() => estimateReadingTime(wordCount), [wordCount]);

  const handleReactionChange = useCallback(
    (reaction: NoteReaction | null) => {
      updateActiveNote({ reaction });
      setIsDirty(true);
      scheduleAutoSave({ reaction });
    },
    [updateActiveNote, scheduleAutoSave]
  );

  /**
   * Toggle a section's visibility within the note view without touching its
   * underlying data (mood/tags/weather/location/etc. stay set — only the
   * display is collapsed). Used to let the user shorten a long note's
   * vertical footprint while keeping every feature's data intact.
   */
  const handleToggleSectionVisibility = useCallback(
    (section: NoteSectionKey) => {
      if (!activeNote) return;
      const current = activeNote.hiddenSections ?? [];
      const hiddenSections = current.includes(section)
        ? current.filter((s) => s !== section)
        : [...current, section];
      updateActiveNote({ hiddenSections });
      setIsDirty(true);
      scheduleAutoSave({ hiddenSections });
    },
    [activeNote, updateActiveNote, scheduleAutoSave]
  );

  /** Toggle a single content block's visibility (table/math/url-preview/checklist) without deleting it. */
  const handleToggleBlockVisibility = useCallback(
    (blockId: string) => {
      if (!activeNote) return;
      const blocks = activeNote.blocks.map((b) =>
        b.id === blockId ? { ...b, isHidden: !b.isHidden } : b
      );
      updateActiveNote({ blocks });
      setIsDirty(true);
      scheduleAutoSave({ blocks });
    },
    [activeNote, updateActiveNote, scheduleAutoSave]
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
    handleToggleSectionVisibility,
    handleToggleBlockVisibility,
    // Phase 9
    handleScheduledChange,
  };
}
