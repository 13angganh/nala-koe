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
// Vina's phrasing this round — "padahal jelas sudah disimpan/save DI
// KLIK" — points specifically at the manual Save button, not just
// auto-save. handleManualSave reads `tags: activeNote.tags` from this
// hook's OWN closure over the `activeNote` returned by useNotesStore() at
// render time — not from a ref, not from the freshest possible source.
// Zustand's set() is synchronous (the STORE updates immediately), but
// React re-rendering the COMPONENT that calls useNoteEditor() and gets a
// fresh `activeNote` value back is not instant — it's whatever React
// schedules. If handleManualSave's closure is the one from BEFORE that
// re-render lands, it still holds the pre-tag-update `activeNote`.

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
    return Promise.resolve({ data: undefined, error: null });
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

describe('handleManualSave — closure staleness over activeNote', () => {
  beforeEach(() => {
    snapshotCallback = null;
    updateNoteCalls = [];
    mockUnsubscribe.mockClear();
    useAuthStore.setState({ user: { uid: 'user-1' } as never });
    useNotesStore.setState({ activeNote: null });
  });

  it('ketik tag lalu LANGSUNG panggil handleManualSave dalam act() YANG SAMA (tanpa re-render sela) — payload yang terkirim harus tetap punya tag terbaru, bukan closure basi', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.(baseNote, false); });

    // Grab handleTagsChange and handleManualSave from THIS render — the
    // exact reference React handed back before any re-render happens.
    const { handleTagsChange, handleManualSave } = result.current;

    // Call both back-to-back inside the SAME act() block, using the
    // ORIGINAL function references captured above (not result.current,
    // which act() may have already refreshed by the time we read it a
    // second time within this same block) — this is the tightest
    // possible reproduction of "type then immediately click Save before
    // React re-renders this hook".
    act(() => {
      handleTagsChange(['baru']);
      handleManualSave();
    });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateNoteCalls).toHaveLength(1);
    expect(updateNoteCalls[0]?.input.tags).toEqual(['baru']);
  });

  it('KONTROL: kalau re-render SEMPAT terjadi di antara ketik dan klik Save (act() terpisah), tetap benar (baseline yang sudah pasti berfungsi)', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.(baseNote, false); });

    act(() => { result.current.handleTagsChange(['baru']); });
    // Separate act() — React re-renders this hook instance in between,
    // result.current is guaranteed fresh here.
    act(() => { result.current.handleManualSave(); });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateNoteCalls).toHaveLength(1);
    expect(updateNoteCalls[0]?.input.tags).toEqual(['baru']);
  });

  it('SAMA persis tapi untuk handleToggleSectionVisibility (icon mata) — ketik tag lalu SEGERA toggle visibility dalam act() yang sama, tag yang dikirim untuk scheduleAutoSave harus tetap benar', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.(baseNote, false); });

    const { handleTagsChange, handleToggleSectionVisibility } = result.current;

    act(() => {
      handleTagsChange(['baru']);
      handleToggleSectionVisibility('mood');
    });

    // Wait for the debounce to fire (real timer — no fake timers set up
    // in this file) plus a microtask flush.
    await new Promise((r) => setTimeout(r, 1600));
    await act(async () => {
      await Promise.resolve();
    });

    // Whatever ends up saved must include the tag — handleToggleSectionVisibility
    // must not have caused it to be lost or overwritten with a stale
    // pendingInputRef merge.
    const tagCalls = updateNoteCalls.filter((c) => 'tags' in c.input);
    expect(tagCalls.length).toBeGreaterThan(0);
    expect(tagCalls[tagCalls.length - 1]?.input.tags).toEqual(['baru']);
  }, 10000);

  it('GABUNGAN: ketik tag, klik Save manual, SEGERA pindah ke catatan lain sebelum mutation Save settle — tag harus tetap terkirim ke catatan yang BENAR', async () => {
    const { result, rerender } = renderHook(({ noteId }) => useNoteEditor(noteId), {
      wrapper,
      initialProps: { noteId: 'note-1' },
    });
    act(() => { snapshotCallback?.(baseNote, false); });

    act(() => { result.current.handleTagsChange(['gabungan']); });
    act(() => { result.current.handleManualSave(); });

    // Switch notes IMMEDIATELY — before the manual save's mutationFn (an
    // async function that awaits updateNote()) has had a chance to
    // resolve, let alone before any debounce would matter here since
    // handleManualSave clears pending timers and saves synchronously.
    const noteB = { ...baseNote, id: 'note-2', tags: [] };
    rerender({ noteId: 'note-2' });
    act(() => { snapshotCallback?.(noteB, false); });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const noteOneCalls = updateNoteCalls.filter((c) => c.noteId === 'note-1');
    expect(noteOneCalls).toHaveLength(1);
    expect(noteOneCalls[0]?.input.tags).toEqual(['gabungan']);
  });

  it('REGRESSION GUARD: handleManualSave tanpa perubahan apapun sebelumnya (kasus paling umum) tetap mengirim data note yang benar', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.({ ...baseNote, tags: ['sudah-ada'] }, false); });

    act(() => { result.current.handleManualSave(); });

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(updateNoteCalls).toHaveLength(1);
    expect(updateNoteCalls[0]?.input.tags).toEqual(['sudah-ada']);
    expect(updateNoteCalls[0]?.input.title).toBe('Judul');
  });
});
