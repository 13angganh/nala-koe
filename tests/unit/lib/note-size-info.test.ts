import { describe, it, expect } from 'vitest';
import { getNoteSizeInfo } from '@/services/notes.service';
import type { Note } from '@/types/note.types';

function makeNote(overrides: Partial<Note> = {}): Note {
  const now = new Date().toISOString();
  return {
    id: 'note-1',
    userId: 'user-1',
    title: 'Test',
    content: 'Short content',
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
    wordCount: 5,
    createdAt: now,
    updatedAt: now,
    trashedAt: null,
    archivedAt: null,
    originalCreatedAt: null,
    ...overrides,
  };
}

describe('getNoteSizeInfo', () => {
  it('returns small label for short text note', () => {
    const note = makeNote();
    const result = getNoteSizeInfo(note);
    expect(result.label).toBe('small');
    expect(result.hasImages).toBe(false);
    expect(result.hasAudio).toBe(false);
  });

  it('detects image blocks', () => {
    const note = makeNote({
      blocks: [{ id: '1', type: 'image', content: '', order: 0 }],
    });
    const result = getNoteSizeInfo(note);
    expect(result.hasImages).toBe(true);
    expect(result.label).toBe('large'); // due to 100KB estimate
  });

  it('detects audio blocks', () => {
    const note = makeNote({
      blocks: [{ id: '1', type: 'audio', content: '', order: 0 }],
    });
    const result = getNoteSizeInfo(note);
    expect(result.hasAudio).toBe(true);
    expect(result.label).toBe('large'); // due to 500KB estimate
  });

  it('returns medium for moderately long text', () => {
    const note = makeNote({ content: 'a'.repeat(25_000) });
    const result = getNoteSizeInfo(note);
    expect(result.label).toBe('medium');
  });
});
