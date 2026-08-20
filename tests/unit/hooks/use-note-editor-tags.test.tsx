import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useNoteEditor } from '@/hooks/use-note-editor';
import { useNotesStore } from '@/stores/notes.store';
import { useAuthStore } from '@/stores/auth.store';
import type { Note } from '@/types/note.types';

const mockUnsubscribe = vi.fn();
let snapshotCallback: ((note: Note, hasPendingWrites: boolean) => void) | null = null;
let updateNoteCalls: Array<{ noteId: string; userId: string; input: Record<string, unknown> }> = [];

vi.mock('@/services/notes.service', () => ({
  subscribeToNote: vi.fn((_noteId: string, _userId: string, onData: (note: Note, hasPendingWrites: boolean) => void) => {
    snapshotCallback = onData;
    return mockUnsubscribe;
  }),
  updateNote: vi.fn((noteId: string, userId: string, input: Record<string, unknown>) => {
    updateNoteCalls.push({ noteId, userId, input });
    return new Promise(() => {});
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

async function advanceAndFlush(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useNoteEditor — noteId-locking fix (menutup celah pindah catatan sebelum auto-save selesai)', () => {
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

  it('tag kedua tidak hilang saat snapshot tiba di tengah save tag ketiga', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.(baseNote, false); });
    act(() => { result.current.handleTagsChange(['kerja']); });
    await advanceAndFlush(1500);
    expect(updateNoteCalls).toHaveLength(1);
    act(() => { result.current.handleTagsChange(['kerja', 'ide']); });
    act(() => { snapshotCallback?.({ ...baseNote, tags: ['kerja'] }, false); });
    expect(result.current.note?.tags).toEqual(['kerja', 'ide']);
  });

  it('SKENARIO PALING REALISTIS: user ketik SATU tag lalu LANGSUNG navigasi keluar (unmount) sebelum 1500ms auto-save timer sempat menembak', async () => {
    const { result, unmount } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.(baseNote, false); });

    // User types a tag and hits Enter — handleTagsChange fires immediately,
    // scheduling an auto-save 1500ms out. This matches TagInput's addTag():
    // onChange(next) is called synchronously the instant Enter is pressed.
    act(() => { result.current.handleTagsChange(['pribadi']); });
    expect(result.current.note?.tags).toEqual(['pribadi']);

    // The tag shows in the UI immediately (optimistic local state) — from
    // the user's perspective the tag IS there. But NO save has been sent
    // to Firestore yet; the 1500ms debounce hasn't elapsed. This is the
    // exact window every real user passes through on every single tag they
    // type — not a rare race, THE NORMAL PATH.
    expect(updateNoteCalls).toHaveLength(0);

    // User immediately clicks "Kembali ke catatan" (the back button in
    // notes/[id]/page.tsx) well within that 1500ms window — a completely
    // ordinary thing to do: type a tag, note looks done, leave.
    act(() => { unmount(); });

    // The cleanup effect's own comment claims this is handled: "the
    // mutation runs against the query client, which outlives this
    // component, so the patch still reaches Firestore". Testing that claim
    // directly instead of trusting the comment.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateNoteCalls).toHaveLength(1);
    expect(updateNoteCalls[0]?.input).toEqual({ tags: ['pribadi'] });
  });

  it('BUG: user ketik tag di Catatan A, sebelum auto-save 1500ms selesai user PINDAH ke Catatan B TANPA full page unmount (Next.js App Router client-component reuse — bukan navigasi hard-reload)', async () => {
    // Next.js App Router documented behavior for dynamic routes:
    // client-side navigation from /notes/A to /notes/B does NOT
    // necessarily unmount and remount the page's client component — React
    // can just re-render it with the new `id` param, reusing the same
    // component instance
    // (https://github.com/vercel/next.js/issues/49553;
    // krapton.com/blog/fixing-nextjs-app-router-useeffect-not-running-on-route-change:
    // "the client component itself doesn't unmount and remount [...]
    // React doesn't unmount and remount that component. Instead, it
    // re-renders it"). NotePage (notes/[id]/page.tsx) calls
    // useNoteEditor(noteId) — if NotePage itself isn't remounted, the
    // useNoteEditor HOOK INSTANCE isn't destroyed either, meaning its
    // useRef()s (pendingInputRef, inFlightSaveRef, autoSaveTimer) persist
    // across the note switch. Only the subscription useEffect (deps:
    // [noteId, ...]) re-runs — refs living OUTSIDE that effect don't get
    // reset just because the effect re-ran.
    //
    // Simulated here by changing the SAME renderHook instance's `noteId`
    // argument via rerender (never unmounted) — this is what actually
    // happens when NotePage re-renders with a new `params.id` without
    // itself unmounting, unlike the unmount() test above.
    const { result, rerender } = renderHook(({ noteId }) => useNoteEditor(noteId), {
      wrapper,
      initialProps: { noteId: 'note-1' },
    });
    act(() => { snapshotCallback?.(baseNote, false); });

    // User types a tag on note-1. Auto-save scheduled for 1500ms out —
    // not fired yet.
    act(() => { result.current.handleTagsChange(['dari-catatan-a']); });
    expect(result.current.note?.tags).toEqual(['dari-catatan-a']);
    expect(updateNoteCalls).toHaveLength(0);

    // Well within that 1500ms window, user clicks a different note from
    // the notes list — noteId prop changes from 'note-1' to 'note-2'.
    // Deliberately NOT unmounting first: this is the App Router
    // same-component-reused case.
    const noteB = { ...baseNote, id: 'note-2', tags: [] };
    rerender({ noteId: 'note-2' });
    act(() => { snapshotCallback?.(noteB, false); });

    // Give the original 1500ms timer (still alive from note-1, since its
    // owning refs were never reset) a chance to fire if it's going to.
    await advanceAndFlush(1500);

    // The tag typed on note-1 should have been saved to note-1 — NOT
    // silently discarded, and CRITICALLY not accidentally sent to note-2
    // either (an even worse form of data corruption: one note's tag
    // landing on a different note).
    const noteOneCalls = updateNoteCalls.filter((c) => c.noteId === 'note-1');
    expect(noteOneCalls).toHaveLength(1);
    expect(noteOneCalls[0]?.input).toEqual({ tags: ['dari-catatan-a'] });
  });

  it('REGRESSION GUARD: fix yang sama juga melindungi field NON-tags — handleTogglePin dipanggil di Catatan A, lalu pindah ke Catatan B sebelum re-render commit', async () => {
    // handleTogglePin (and handleTimeCapsuleChange/handleSecretChange/
    // handleScheduledChange/handleManualSave) call saveMutation.mutate()
    // directly, synchronously — no setTimeout involved, unlike the tags
    // path through scheduleAutoSave. Their OWN useCallback dependency
    // arrays don't include noteId (e.g. handleTogglePin's deps are
    // [activeNote, updateActiveNote, saveMutation]), so before this fix
    // they'd have been just as vulnerable to a stale-noteId mutationFn
    // closure if the mutation's async body (`await updateNote(...)`) was
    // still resolving at the moment a note switch re-rendered the
    // component with a different noteId — the SAME underlying issue as
    // the tags bug, just requiring a narrower timing window since there's
    // no debounce to make it easy to trigger. This test confirms the
    // targetNoteId fix (via noteIdRef.current, read at call time) covers
    // this handler too, not just the tags path.
    const { result, rerender } = renderHook(({ noteId }) => useNoteEditor(noteId), {
      wrapper,
      initialProps: { noteId: 'note-1' },
    });
    act(() => { snapshotCallback?.(baseNote, false); });

    act(() => { result.current.handleTogglePin(); });

    // saveMutation.mutate() is a synchronous call, but TanStack Query's
    // useMutation schedules the actual mutationFn execution asynchronously
    // (it doesn't invoke mutationFn synchronously inside mutate() itself)
    // — same reason the earlier fake-timer tests needed a microtask flush
    // after vi.advanceTimersByTime(). Flushing here so mutationFn's body
    // (which calls updateNote()) actually runs before switching notes.
    await act(async () => {
      await Promise.resolve();
    });

    // Switch notes immediately after — before this synchronous mutate()
    // call's own async body would have resolved in a real Firestore
    // round-trip.
    const noteB = { ...baseNote, id: 'note-2' };
    rerender({ noteId: 'note-2' });
    act(() => { snapshotCallback?.(noteB, false); });

    const noteOneCalls = updateNoteCalls.filter((c) => c.noteId === 'note-1');
    expect(noteOneCalls).toHaveLength(1);
    expect(noteOneCalls[0]?.input).toEqual({ isPinned: true });
  });
});
