import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useNoteEditor } from '@/hooks/use-note-editor';
import { useNotesStore } from '@/stores/notes.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Note } from '@/types/note.types';

// ─── Why this test exists ──────────────────────────────────────────────────
//
// Every existing tag test (tag-input.test.tsx, notes-service-update.test.ts)
// mocks its target in isolation: TagInput is tested with a plain onChange
// spy, updateNote() is tested with a plain getDoc/updateDoc mock. Both pass.
// Neither exercises useNoteEditor itself — the layer where
// subscribeToNote's onSnapshot callback and scheduleAutoSave's
// inFlightSaveRef actually interact. This is the integration gap: Vina
// reported the tag bug is STILL happening in production after both prior
// fixes (v1.2.3, v1.2.5) landed and were individually verified, which means
// the reproduction has to happen at the point where they compose, not at
// either fix's own unit boundary.
//
// Root cause found here: inFlightSaveRef.current is written ONCE per batch,
// at the moment scheduleAutoSave's setTimeout fires (use-note-editor.ts,
// "inFlightSaveRef.current = { ...inFlightSaveRef.current, ...merged }").
// It is a snapshot of `tags` AT THAT INSTANT — not a live reference to
// whatever the user has typed since. The onSnapshot handler then does
// `{ ...note, ...pendingInputRef.current, ...inFlightSaveRef.current }` and
// pushes the result straight into setActiveNote(). For a scalar field
// (mood, title) the newest value always wins because there's only ever one
// in-flight version at a time. For `tags`, if the user adds a SECOND tag
// while the FIRST tag's save is still in flight, inFlightSaveRef.current
// still holds the FIRST tag's array — and if a snapshot arrives in that
// window, it overwrites the just-typed second tag in Zustand with the
// stale in-flight one. This reproduces exactly what Vina described: typed
// repeatedly, comes back empty (or missing what was just typed).

const mockUnsubscribe = vi.fn();
let snapshotCallback: ((note: Note, hasPendingWrites: boolean) => void) | null = null;
let updateNoteCalls: Array<{ noteId: string; userId: string; input: Record<string, unknown> }> = [];

vi.mock('@/services/notes.service', () => ({
  subscribeToNote: vi.fn((_noteId: string, _userId: string, onData: (note: Note, hasPendingWrites: boolean) => void) => {
    snapshotCallback = onData;
    return mockUnsubscribe;
  }),
  // Deliberately never resolves — mirrors real Firestore network latency
  // and lets each test control exactly when a snapshot callback fires
  // relative to an in-flight save. That gap is where the bug lives.
  updateNote: vi.fn((noteId: string, userId: string, input: Record<string, unknown>) => {
    updateNoteCalls.push({ noteId, userId, input });
    return new Promise(() => {});
  }),
}));

const baseNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Judul',
  content: 'Isi',
  contentFormat: 'plain',
  blocks: [],
  mood: null,
  tags: [],
  status: 'active',
  isPinned: false,
  isSecret: false,
  isTimeCapsule: false,
  timeCapsuleUnlockAt: null,
  isScheduled: false,
  scheduledAt: null,
  language: null,
  texture: 'plain',
  fontWeight: 'regular',
  accentColor: null,
  weather: null,
  location: null,
  reaction: null,
  linkedNoteIds: [],
  highlights: [],
  hiddenSections: [],
  wordCount: 0,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  trashedAt: null,
  archivedAt: null,
  originalCreatedAt: null,
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// After vi.advanceTimersByTime() fires the setTimeout inside
// scheduleAutoSave, saveMutation.mutate() runs — but @tanstack/react-query's
// useMutation executes mutationFn through its own internal promise chain,
// which needs actual microtask turns to progress. A synchronous
// advanceTimersByTime() alone fires the timer callback but doesn't give
// that promise chain a chance to run before assertions execute. Flushing a
// couple of Promise.resolve() ticks inside the same act() is what lets
// updateNote() (this test's mock) actually get called before we check it.
async function advanceAndFlush(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useNoteEditor — reproduksi bug tag hilang saat integrasi penuh (subscribeToNote + scheduleAutoSave)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    snapshotCallback = null;
    updateNoteCalls = [];
    mockUnsubscribe.mockClear();
    useAuthStore.setState({ user: { uid: 'user-1' } as never });
    useNotesStore.setState({ activeNote: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('REPRO: tag pertama hilang jika snapshot server tiba saat save tag KEDUA masih in-flight', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    // Note loads via the live subscription, same as production.
    // useEffect (where subscribeToNote is called) only runs after the
    // effect-mount pass renderHook performs internally, so
    // snapshotCallback is already populated by the time this act() block
    // runs — no waitFor needed, and waitFor's internal polling doesn't mix
    // with fake timers anyway (that's what caused the earlier timeout).
    act(() => {
      snapshotCallback?.(baseNote, false);
    });
    expect(result.current.note).not.toBeNull();

    // User types tag 1 and it's accepted (TagInput's own valueRef fix
    // already guarantees this part is correct — verified by
    // tag-input.test.tsx). handleTagsChange is what the real
    // TagInput.onChange wires to.
    act(() => {
      result.current.handleTagsChange(['kerja']);
    });
    expect(result.current.note?.tags).toEqual(['kerja']);

    // Auto-save timer for tag 1 fires -> updateNote() called, and its
    // promise is intentionally left unresolved (production: real network
    // latency to Firestore) to open the in-flight window.
    await advanceAndFlush(1500);
    expect(updateNoteCalls).toHaveLength(1);
    expect(updateNoteCalls[0].input).toEqual({ tags: ['kerja'] });

    // While tag 1's save is still in flight, user types tag 2 — a normal
    // thing to do, not an edge case. This is the exact "diketik berulang
    // kali" pattern Vina described.
    act(() => {
      result.current.handleTagsChange(['kerja', 'ide']);
    });
    expect(result.current.note?.tags).toEqual(['kerja', 'ide']);

    // Now a snapshot arrives in that window — e.g. the server confirming
    // tag 1 just landed (hasPendingWrites: false), or any other snapshot
    // for this document firing while inFlightSaveRef still only knows
    // about tag 1. This is realistic: it's the exact mechanism
    // subscribeToNote's own comment describes as "any other still-unsettled
    // local write queued ahead of it" arriving mid-stream.
    act(() => {
      snapshotCallback?.({ ...baseNote, tags: ['kerja'] }, false);
    });

    // BUG: at this point, Zustand's activeNote.tags reverts to ['kerja'] —
    // the just-typed second tag is gone from the UI, even though the user
    // never removed it and handleTagsChange was called correctly with
    // both tags.
    expect(result.current.note?.tags).toEqual(['kerja', 'ide']);
  });

  it('REPRO: tag hilang sepenuhnya jika snapshot tiba tepat setelah tag PERTAMA diketik (kasus "tak pernah tersimpan sama sekali")', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    act(() => {
      snapshotCallback?.(baseNote, false);
    });
    expect(result.current.note).not.toBeNull();

    // User types the very first tag on a brand new note.
    act(() => {
      result.current.handleTagsChange(['pribadi']);
    });
    expect(result.current.note?.tags).toEqual(['pribadi']);

    // Timer fires, save begins (still in flight).
    await advanceAndFlush(1500);
    expect(updateNoteCalls[0].input).toEqual({ tags: ['pribadi'] });

    // A snapshot for this note arrives before the save settles — e.g.
    // triggered by ANY other field's write on the same document (mood,
    // weather, wordCount from the debounced content analysis all save
    // independently per the file's own "Phase 3" comments), reflecting
    // the version of the doc from before this tag save reached the
    // server.
    act(() => {
      snapshotCallback?.({ ...baseNote, tags: [] }, false);
    });

    // BUG: the tag the user just typed and that is still actively being
    // saved disappears from the editor entirely — this is the "tag ditulis
    // berulang kali tapi saat kembali lagi dibuka catatannya kosong
    // tagnya" report on a note being actively edited, not just on reopen.
    expect(result.current.note?.tags).toEqual(['pribadi']);
  });

  it('REGRESSION GUARD: field HANYA di inFlightSaveRef (pendingInputRef kosong untuk field itu) tetap dilindungi seperti semula', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    act(() => {
      snapshotCallback?.(baseNote, false);
    });

    // A single tag save, no follow-up edit — pendingInputRef.current is
    // empty by the time the snapshot below arrives, so this only exercises
    // the inFlightSaveRef side of the merge (the case the swap must NOT
    // break).
    act(() => {
      result.current.handleTagsChange(['satu']);
    });
    await advanceAndFlush(1500);
    expect(updateNoteCalls[0].input).toEqual({ tags: ['satu'] });

    // A stale/partial snapshot arrives while this save is still in flight
    // and pendingInputRef has nothing queued.
    act(() => {
      snapshotCallback?.({ ...baseNote, tags: [] }, false);
    });

    // The in-flight value must still win here — this is the original
    // v1.2.5-era guarantee (an unsettled snapshot can't present stale data
    // for a field mid-write), and it must survive the spread-order fix.
    expect(result.current.note?.tags).toEqual(['satu']);
  });
});
