import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNoteEditor } from '@/hooks/use-note-editor';
import { useNotesStore } from '@/stores/notes.store';
import { useAuthStore } from '@/stores/auth.store';
import { NoteMetaPanel } from '@/components/notes/note-meta-panel';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Note } from '@/types/note.types';

// ─── Why this test exists ──────────────────────────────────────────────────
//
// EVERY test written so far in this codebase for the tag bug — the
// previous session's tag-input.test.tsx, notes-service-update.test.ts,
// AND this session's own use-note-editor-tags.test.tsx (which passed
// against the reapplied fix, confirmed above) — calls handleTagsChange()
// or addTag()/removeTag() as a DIRECT FUNCTION CALL. None of them render
// TagInput as an actual DOM element and type into it via a real keyboard
// event. If the bug lives in something that only happens during a REAL
// keystroke — the exact sequence of onChange/onKeyDown/setInputValue/
// re-render that userEvent.type() + userEvent.keyboard('{Enter}')
// triggers, as opposed to calling addTag() as a bare function — no
// existing test could ever have caught it, no matter how many times it's
// re-run.
//
// This test wires up the REAL NoteMetaPanel -> REAL TagInput, backed by
// the REAL useNoteEditor hook (only Firestore itself is mocked, at the
// service boundary — everything above that is genuine, unmocked
// application code), and drives it via userEvent exactly the way a
// person using a keyboard would.

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

// A thin harness component that plays the exact same role notes/[id]/page.tsx
// does: call useNoteEditor(), pass its live `note.tags`/`handleTagsChange`
// straight into NoteMetaPanel as controlled props. This is the real prop
// wiring, not a stand-in.
function RealHarness() {
  const { note, handleTagsChange } = useNoteEditor('note-1');
  if (!note) return null;
  return (
    <NoteMetaPanel
      mood={note.mood}
      onMoodChange={() => {}}
      tags={note.tags}
      onTagsChange={handleTagsChange}
      tagSuggestions={[]}
      onTagSearchChange={() => {}}
      weather={note.weather}
      onWeatherChange={() => {}}
      location={note.location}
      onLocationChange={() => {}}
      onRequestLocation={() => {}}
      isRequestingLocation={false}
      isFetchingWeather={false}
      onFetchWeatherForLocation={() => {}}
      language={note.language}
      hiddenSections={note.hiddenSections}
      onToggleSection={() => {}}
    />
  );
}

function renderHarness() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <TooltipProvider delayDuration={300}>
        <RealHarness />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

describe('REAL DOM RENDER: TagInput typed via actual keyboard events, not direct function calls', () => {
  beforeEach(() => {
    snapshotCallback = null;
    updateNoteCalls = [];
    mockUnsubscribe.mockClear();
    useAuthStore.setState({ user: { uid: 'user-1' } as never });
    useNotesStore.setState({ activeNote: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mengetik SATU tag via keyboard sungguhan dan menunggu auto-save — kasus paling dasar, tanpa race condition sama sekali', async () => {
    // Real timers here (not fake) so userEvent's internal timing and the
    // component's real setTimeout-based debounce interact exactly as they
    // do in a real browser — fake timers were only needed in the
    // hook-level tests above to deterministically step through race
    // windows; this test is deliberately checking the NON-race, everyday
    // path with everything running at real speed.
    const user = userEvent.setup();
    renderHarness();

    act(() => { snapshotCallback?.(baseNote, false); });

    const input = await screen.findByLabelText('Ketik tag baru');
    await user.type(input, 'kerja');
    await user.keyboard('{Enter}');

    // Immediately after Enter, the tag should show as a badge — this is
    // TagInput's own optimistic value prop update via onChange, no
    // network involved yet.
    expect(await screen.findByText('kerja')).toBeInTheDocument();

    // Wait for the real 1500ms AUTO_SAVE_DELAY using real timers + a
    // generous real-time wait, then check what actually reached
    // updateNote().
    await new Promise((resolve) => setTimeout(resolve, 1800));

    expect(updateNoteCalls).toHaveLength(1);
    expect(updateNoteCalls[0]?.input).toEqual({ tags: ['kerja'] });
  }, 10000);
});
