'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { useNotesStore } from '@/stores/notes.store';
import { subscribeToNote, updateNote } from '@/services/notes.service';
import { isOk } from '@/lib/normalizer';
import { logger } from '@/lib/logger';
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
  // Separate from pendingInputRef: this stays populated for the FULL duration
  // of an in-flight saveMutation.mutate() call (from the moment the debounce
  // timer fires until the mutation's promise actually settles), not just
  // during the 1.5s debounce window. Root cause of the intermittent
  // "tag/field disappears" reports — pendingInputRef used to get cleared the
  // instant the timer fired, before the network write had a chance to
  // reach Firestore. If a snapshot with hasPendingWrites=true (i.e. not yet
  // server-confirmed — see subscribeToNote) arrived in that gap, there was
  // nothing left to re-apply on top of it, so the snapshot's older data
  // momentarily overwrote the field that was still being saved. Keeping
  // this ref alive until the mutation settles closes that gap.
  const inFlightSaveRef = useRef<UpdateNoteInput>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const isEnabled = !!user?.uid && !!noteId;

  // Live subscription to the note while it's open for editing — replaces a
  // one-shot getDoc() fetch. This is what actually fixes tags/mood/etc.
  // appearing to "not save": with a one-shot fetch, any path that triggers
  // a refetch of this note (invalidateQueries elsewhere, window refocus,
  // tab visibility change) reads via getDoc(), which Firestore's JS SDK can
  // return as a partial/stale snapshot immediately after a write is still
  // settling (documented SDK behavior, firebase-js-sdk#6739) — overwriting
  // local state with an incomplete picture of the document. A live
  // onSnapshot() listener instead receives a fresh, complete callback each
  // time the document actually changes (both the optimistic local write
  // and, again, once the server confirms it), so the editor naturally
  // converges on whatever Firestore really ends up storing.
  //
  // setIsLoading/setIsError are only ever called from inside the
  // subscribeToNote callbacks below (onData/onError) — both genuinely async
  // events arriving from an external system (Firestore), not synchronous
  // calls in the effect body itself.
  useEffect(() => {
    if (!isEnabled) return;
    const unsubscribe = subscribeToNote(
      noteId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: isEnabled guards both user?.uid and noteId
      user!.uid,
      (note, hasPendingWrites) => {
        // Defensive guard, now covering the FULL lifetime of an in-flight
        // save (see inFlightSaveRef above), not just the debounce window:
        // re-apply any field this client is still in the middle of saving
        // on top of whatever this snapshot says, so an unsettled snapshot
        // can never present stale data for a field mid-write as if it were
        // final.
        const stillInFlight = Object.keys(inFlightSaveRef.current);
        // Root cause of the tag bug STILL happening in production after
        // v1.2.3 and v1.2.5 (both individually correct, but not enough —
        // reported again by Vina, reproduced in
        // tests/unit/hooks/use-note-editor-tags.test.tsx): this spread
        // order put inFlightSaveRef LAST, so it always won over
        // pendingInputRef for any field present in both. That's backwards.
        // inFlightSaveRef holds a batch that was ALREADY SENT to Firestore
        // — frozen at the moment its debounce timer fired. pendingInputRef
        // holds whatever the user has typed MORE RECENTLY, still
        // accumulating toward its own not-yet-fired timer. When both
        // contain the same field — completely normal: add a tag, then add
        // a second tag before the first save round-trips — the newer,
        // not-yet-sent pendingInputRef value is the one that should win;
        // the in-flight value is already stale the moment something newer
        // exists. Swapping the spread order fixes this: pendingInputRef
        // now goes LAST, so a field present in both takes the fresher
        // value. Fields that exist in only one of the two are unaffected
        // either way — this only changes behavior for a field that both
        // refs happen to be tracking at once, which is exactly the
        // overlapping-save case this bug lived in.
        const pending = { ...inFlightSaveRef.current, ...pendingInputRef.current };
        const merged = Object.keys(pending).length > 0 ? { ...note, ...pending } : note;
        setActiveNote(merged);
        setIsLoading(false);
        setIsError(false);

        // hasPendingWrites === false means Firestore itself considers this
        // snapshot server-confirmed. If inFlightSaveRef still thinks a field
        // is mid-save at that exact moment, the mutation's onSettled (in
        // scheduleAutoSave) should have already cleared it — the write
        // either succeeded (onSuccess ran) or failed (onError ran and
        // surfaced a toast), and either way onSettled always fires. Seeing
        // both at once past a full auto-save cycle points at a genuine
        // desync — e.g. this tab's mutation promise never settling because
        // of an uncaught error path — worth a warn so it's visible in
        // production logs instead of silently self-correcting on the next
        // snapshot.
        if (!hasPendingWrites && stillInFlight.length > 0) {
          logger.warn('notes.editor.stale-in-flight-ref', { noteId, fields: stillInFlight });
        }
      },
      (message) => {
        toast.error(message);
        setIsLoading(false);
        setIsError(true);
      }
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reason: intentionally re-subscribes only when noteId/user.uid/isEnabled change; setActiveNote is a stable Zustand setter
  }, [noteId, user?.uid, isEnabled]);

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
      // The currently-open note no longer needs a query invalidation to
      // stay in sync — it's on a live onSnapshot() subscription (see the
      // effect above) that picks up the confirmed write automatically.
      // We still invalidate OTHER views (notes list, recent notes, stats,
      // dashboards) so they reflect this save too.
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
        // Mark these fields as in-flight for the mutation's full
        // round-trip — not just for the debounce window that just ended.
        // This is what the onSnapshot handler above checks (via
        // inFlightSaveRef) to avoid letting an unsettled snapshot present
        // stale data for a field that's still being written. See the
        // inFlightSaveRef declaration for the full race condition this
        // closes.
        inFlightSaveRef.current = { ...inFlightSaveRef.current, ...merged };
        const fieldsInThisBatch = Object.keys(merged);
        saveMutation.mutate(merged, {
          onSettled: () => {
            // Only clear the fields THIS batch was responsible for — a
            // second scheduleAutoSave() call can start (and finish) while
            // this one is still in flight (e.g. tags saved, then mood
            // changed and its own timer already fired), and that second
            // batch's fields must stay protected until ITS OWN mutation
            // settles, not get cleared as a side effect of this one.
            const next = { ...inFlightSaveRef.current };
            for (const key of fieldsInThisBatch) delete next[key as keyof UpdateNoteInput];
            inFlightSaveRef.current = next;
          },
        });
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
