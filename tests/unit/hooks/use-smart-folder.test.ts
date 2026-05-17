import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSmartFolders } from '@/hooks/use-smart-folder';
import type { NoteListItem } from '@/types/note.types';

function makeNote(overrides: Partial<NoteListItem> = {}): NoteListItem {
  const now = new Date().toISOString();
  return {
    id: 'note-1',
    title: 'Test Note',
    content: 'Content',
    mood: null,
    tags: [],
    status: 'active',
    isPinned: false,
    isSecret: false,
    isTimeCapsule: false,
    timeCapsuleUnlockAt: null,
    wordCount: 10,
    linkedNoteIds: [],
    texture: 'plain',
    fontWeight: 'regular',
    accentColor: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('useSmartFolders', () => {
  it('returns empty array when notes are empty', () => {
    const { result } = renderHook(() => useSmartFolders([]));
    expect(result.current).toHaveLength(0);
  });

  it('includes pinned folder when there are pinned notes', () => {
    const notes = [makeNote({ id: '1', isPinned: true })];
    const { result } = renderHook(() => useSmartFolders(notes));
    const pinned = result.current.find((f) => f.key === 'pinned');
    expect(pinned).toBeDefined();
    expect(pinned!.count).toBe(1);
  });

  it('includes today folder for notes updated today', () => {
    const notes = [makeNote({ id: '1', updatedAt: new Date().toISOString() })];
    const { result } = renderHook(() => useSmartFolders(notes));
    const today = result.current.find((f) => f.key === 'today');
    expect(today).toBeDefined();
    expect(today!.count).toBe(1);
  });

  it('includes long-notes folder for notes >= 300 words', () => {
    const notes = [makeNote({ id: '1', wordCount: 400 })];
    const { result } = renderHook(() => useSmartFolders(notes));
    const longNotes = result.current.find((f) => f.key === 'long-notes');
    expect(longNotes).toBeDefined();
    expect(longNotes!.count).toBe(1);
  });

  it('excludes folders with zero count', () => {
    const notes = [makeNote({ id: '1' })];
    const { result } = renderHook(() => useSmartFolders(notes));
    result.current.forEach((f) => expect(f.count).toBeGreaterThan(0));
  });

  it('detects notes with checklist content', () => {
    const notes = [makeNote({ id: '1', content: '[ ] Task item' })];
    const { result } = renderHook(() => useSmartFolders(notes));
    const checklist = result.current.find((f) => f.key === 'with-checklist');
    expect(checklist).toBeDefined();
  });

  it('detects untagged notes', () => {
    const notes = [makeNote({ id: '1', tags: [] })];
    const { result } = renderHook(() => useSmartFolders(notes));
    const untagged = result.current.find((f) => f.key === 'untagged');
    expect(untagged).toBeDefined();
    expect(untagged!.count).toBe(1);
  });
});
