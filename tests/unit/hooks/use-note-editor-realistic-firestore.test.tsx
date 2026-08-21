import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useNoteEditor } from '@/hooks/use-note-editor';
import { useNotesStore } from '@/stores/notes.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Note } from '@/types/note.types';

// ─── Why this test exists ──────────────────────────────────────────────────
//
// Every prior test (including this session's use-note-editor-visibility
// tests, which all passed) hand-crafts each snapshotCallback() call with
// whatever data the test author decides is "correct" at that point. None
// of them simulate what a REAL Firestore onSnapshot subscription actually
// does: fire an "echo" snapshot almost immediately after a local write
// (hasPendingWrites: true, reflecting the optimistic local state), THEN
// — after a real network round-trip — fire a SECOND snapshot once the
// server confirms (hasPendingWrites: false). This test builds a small
// fake Firestore layer that mimics that two-phase behavior with real
// setTimeout delays, and drives the exact sequence Vina described: type
// a tag, let it save, close the note, immediately reopen it — checking
// what the reopened note actually shows at each point in that timeline,
// not just at a moment the test author chose to check.

const mockUnsubscribe = vi.fn();

/**
 * Simulates a single Firestore document with realistic onSnapshot
 * semantics: writes are queued, echoed back immediately (hasPendingWrites:
 * true), then "committed" after a delay (hasPendingWrites: false) — and
 * EVERY currently-subscribed listener receives both phases, mimicking how
 * a real Firestore listener behaves regardless of which client performed
 * the write.
 */
function createFakeFirestoreDoc(initial: Note) {
  let serverState: Note = initial;
  const listeners = new Set<(note: Note, hasPendingWrites: boolean) => void>();

  function subscribe(onData: (note: Note, hasPendingWrites: boolean) => void) {
    listeners.add(onData);
    // Real Firestore fires an initial snapshot (from cache or server)
    // the moment a listener attaches.
    onData(serverState, false);
    return () => listeners.delete(onData);
  }

  async function write(input: Record<string, unknown>) {
    const optimistic = { ...serverState, ...input } as Note;
    // Echo phase — every listener sees the optimistic write immediately,
    // tagged as not-yet-committed.
    for (const l of listeners) l(optimistic, true);

    // Real network delay before the server actually commits.
    await new Promise((resolve) => setTimeout(resolve, 300));

    serverState = optimistic;
    // Commit phase — every currently-subscribed listener (which may be a
    // DIFFERENT listener than the one that initiated the write, if the
    // user closed and reopened the note in the meantime) sees the
    // server-confirmed state.
    for (const l of listeners) l(serverState, false);
  }

  return { subscribe, write, getServerState: () => serverState };
}

let fakeDoc: ReturnType<typeof createFakeFirestoreDoc>;

vi.mock('@/services/notes.service', () => ({
  subscribeToNote: vi.fn((_noteId: string, _userId: string, onData: (note: Note, hasPendingWrites: boolean) => void) => {
    return fakeDoc.subscribe(onData);
  }),
  updateNote: vi.fn(async (_noteId: string, _userId: string, input: Record<string, unknown>) => {
    await fakeDoc.write(input);
    return { data: undefined, error: null };
  }),
}));

const baseNote: Note = {
  id: 'note-1', userId: 'user-1', title: 'Judul', content: 'Isi',
  contentFormat: 'plain', blocks: [], mood: null, tags: [], status: 'active',
  isPinned: false, isSecret: false, isTimeCapsule: false, timeCapsuleUnlockAt: null,
  isScheduled: false, scheduledAt: null, language: null, texture: 'plain',
  fontWeight: 'regular', accentColor: null, weather: null, location: null,
  reaction: null, linkedNoteIds: [], highlights: [], hiddenSections: [], wordCount: 0,
  createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-01T00:00:00.000Z',
  trashedAt: null, archivedAt: null, originalCreatedAt: null,
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('REALISTIC Firestore echo-then-confirm simulation — the full Vina scenario', () => {
  beforeEach(() => {
    mockUnsubscribe.mockClear();
    fakeDoc = createFakeFirestoreDoc(baseNote);
    useAuthStore.setState({ user: { uid: 'user-1' } as never });
    useNotesStore.setState({ activeNote: null });
  });

  it('ketik tag → tunggu commit penuh (echo + server-confirm, 300ms nyata) → tutup catatan → buka LAGI → tag masih ada', async () => {
    const { result, unmount } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    act(() => { result.current.handleTagsChange(['penting']); });
    expect(result.current.note?.tags).toEqual(['penting']);

    // Wait for the full 1500ms debounce + 300ms fake network commit,
    // using REAL timers (not fake) so the setTimeout inside
    // createFakeFirestoreDoc's write() actually elapses.
    await new Promise((r) => setTimeout(r, 2000));

    // Server state (the single source of truth in this simulation) must
    // actually have the tag now.
    expect(fakeDoc.getServerState().tags).toEqual(['penting']);

    // Close the note.
    unmount();
    await new Promise((r) => setTimeout(r, 50));

    // Reopen the SAME note — a fresh subscribeToNote() call, which per
    // createFakeFirestoreDoc.subscribe() fires an initial snapshot
    // immediately from serverState (the only state this fake tracks,
    // analogous to Firestore's local cache having long since caught up
    // given the 2000ms wait above).
    const { result: result2 } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    expect(result2.current.note?.tags).toEqual(['penting']);
  }, 10000);

  it('SKENARIO PALING KETAT: ketik tag, TUTUP CATATAN SEGERA (sebelum 300ms commit selesai), BUKA LAGI SEGERA — apakah listener BARU menangkap commit yang masih berjalan?', async () => {
    const { result, unmount } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    act(() => { result.current.handleTagsChange(['cepat']); });

    // Wait only for the 1500ms debounce to fire (auto-save begins), but
    // NOT for the fake network's 300ms commit delay — closing the note
    // right as the write is mid-flight, the tightest possible version of
    // "type, save, immediately leave".
    await new Promise((r) => setTimeout(r, 1550));

    unmount();

    // Reopen essentially immediately — before the 300ms commit would have
    // elapsed from when the write started (~1500ms mark), so we're
    // reopening at ~1550-1600ms while the commit lands at ~1800ms.
    const { result: result2 } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    // At the moment of reopening, the fake doc's subscribe() will fire
    // immediately from whatever serverState currently is — which, this
    // early, might still be the OLD (pre-write) state, since the write's
    // commit phase hasn't landed yet. This is expected and fine SO LONG
    // AS the second snapshot (the commit, which every listener including
    // this new one receives once it actually lands) corrects it.
    await new Promise((r) => setTimeout(r, 400));

    // After waiting past the commit's actual landing time, the reopened
    // note's listener — which subscribed to the SAME fakeDoc instance and
    // is therefore in `listeners` when write()'s commit phase iterates
    // over them — must have received the corrected, tagged state.
    expect(result2.current.note?.tags).toEqual(['cepat']);
  }, 10000);
});
