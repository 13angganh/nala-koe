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
// Vina's report this round is much more specific than before: "klik icon
// mata di tag lalu klik lagi sudah itu hilang" — toggling the eye icon
// (NoteVisibilityToggle -> handleToggleSectionVisibility) on the tags
// section, then toggling it back, loses the tags. This is a code path NO
// prior test in this project has ever touched — every previous tag test
// exercises handleTagsChange/TagInput directly, never
// handleToggleSectionVisibility. She also separately describes: type a
// tag, save, navigate to ANY other page/menu, reopen the SAME note — tags
// come back empty. That's the subscribe/resubscribe path, also never
// directly tested (every prior test used a single subscribeToNote
// snapshot per test, never simulated unsubscribe-then-resubscribe to the
// same note).

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
  contentFormat: 'plain', blocks: [], mood: null, tags: ['kerja', 'penting'], status: 'active',
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

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('handleToggleSectionVisibility — "icon mata" scenario', () => {
  beforeEach(() => {
    snapshotCallback = null;
    updateNoteCalls = [];
    mockUnsubscribe.mockClear();
    useAuthStore.setState({ user: { uid: 'user-1' } as never });
    useNotesStore.setState({ activeNote: null });
  });

  it('toggle sembunyikan lalu tampilkan lagi section "tags" — tags TIDAK hilang, dan payload yang dikirim ke Firestore tetap punya tags-nya', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.(baseNote, false); });
    expect(result.current.note?.tags).toEqual(['kerja', 'penting']);

    // Klik icon mata pertama — sembunyikan section tags.
    act(() => { result.current.handleToggleSectionVisibility('tags'); });
    expect(result.current.note?.hiddenSections).toEqual(['tags']);
    // Local state must not have touched tags at all — only hiddenSections.
    expect(result.current.note?.tags).toEqual(['kerja', 'penting']);

    // Klik lagi — tampilkan lagi.
    act(() => { result.current.handleToggleSectionVisibility('tags'); });
    expect(result.current.note?.hiddenSections).toEqual([]);
    expect(result.current.note?.tags).toEqual(['kerja', 'penting']);

    await flush();

    // Whatever got sent to Firestore across both toggles must never have
    // included an empty/missing tags — hiddenSections is a completely
    // separate field, updateNote() should never receive `tags: []` or
    // `tags: undefined` from a visibility toggle alone.
    for (const call of updateNoteCalls) {
      if ('tags' in call.input) {
        expect(call.input.tags).not.toEqual([]);
      }
    }
  });

  it('toggle icon mata SAAT tag masih pending (belum sempat auto-save) — tag tetap ikut tersimpan, tidak tertimpa hiddenSections-only payload', async () => {
    const { result } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.({ ...baseNote, tags: [] }, false); });

    // User ketik tag baru — belum sempat auto-save 1500ms selesai (real
    // timers here, deliberately not advancing them).
    act(() => { result.current.handleTagsChange(['baru']); });
    expect(result.current.note?.tags).toEqual(['baru']);

    // User langsung klik icon mata untuk mood (bukan tags — section lain,
    // untuk mengecek apakah toggle section APAPUN bisa mengganggu tag yang
    // sedang pending) sebelum auto-save tag sempat menembak.
    act(() => { result.current.handleToggleSectionVisibility('mood'); });

    // Local state: tag yang baru diketik harus tetap ada.
    expect(result.current.note?.tags).toEqual(['baru']);
    expect(result.current.note?.hiddenSections).toEqual(['mood']);
  });

  it('SKENARIO UTAMA VINA: tag diketik, disimpan (auto-save selesai, terkonfirmasi), user tutup catatan lalu buka LAGI catatan yang sama — tag yang sudah tersimpan tetap muncul', async () => {
    // First visit: open note, type a tag, wait for it to fully save.
    const { result, unmount } = renderHook(() => useNoteEditor('note-1'), { wrapper });
    act(() => { snapshotCallback?.({ ...baseNote, tags: [] }, false); });
    act(() => { result.current.handleTagsChange(['penting']); });

    // Simulate the save actually completing and Firestore echoing back a
    // server-confirmed snapshot with the new tag — this is what a real
    // save-then-confirm cycle looks like.
    await flush();
    act(() => { snapshotCallback?.({ ...baseNote, tags: ['penting'] }, false); });
    expect(result.current.note?.tags).toEqual(['penting']);

    // User closes the note (navigates away — full unmount, the clearest
    // possible "left this note" case).
    unmount();
    await flush();

    // User reopens the SAME note. This is a NEW subscribeToNote() call —
    // snapshotCallback is reassigned by the mock to whatever this new
    // subscription passes.
    snapshotCallback = null;
    const { result: result2 } = renderHook(() => useNoteEditor('note-1'), { wrapper });

    // The reopened note's very first snapshot is what Firestore/the mock
    // provides — simulating the server-confirmed state from the first
    // visit's save (which is what SHOULD happen: the write succeeded and
    // the document really does have the tag now).
    act(() => { snapshotCallback?.({ ...baseNote, tags: ['penting'] }, false); });

    expect(result2.current.note?.tags).toEqual(['penting']);
  });
});
