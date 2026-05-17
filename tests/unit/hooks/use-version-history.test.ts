import { describe, it, expect } from 'vitest';
import { diffText, formatVersionLabel } from '@/hooks/use-version-history';
import type { NoteVersion } from '@/types/note.types';

describe('diffText', () => {
  it('marks identical lines as unchanged', () => {
    const result = diffText('hello\nworld', 'hello\nworld');
    expect(result.every((l) => l.type === 'unchanged')).toBe(true);
  });

  it('marks added lines when new content has more lines', () => {
    const result = diffText('hello', 'hello\nworld');
    const added = result.filter((l) => l.type === 'added');
    expect(added.length).toBeGreaterThan(0);
    expect(added[0].text).toBe('world');
  });

  it('marks removed lines when old content has more lines', () => {
    const result = diffText('hello\nworld', 'hello');
    const removed = result.filter((l) => l.type === 'removed');
    expect(removed.length).toBeGreaterThan(0);
    expect(removed[0].text).toBe('world');
  });

  it('marks changed lines as both removed and added', () => {
    const result = diffText('old line', 'new line');
    const types = result.map((l) => l.type);
    expect(types).toContain('removed');
    expect(types).toContain('added');
  });

  it('handles empty strings', () => {
    const result = diffText('', '');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('unchanged');
  });

  it('handles old empty, new non-empty', () => {
    const result = diffText('', 'new content');
    const added = result.filter((l) => l.type === 'added');
    expect(added.length).toBe(1);
    expect(added[0].text).toBe('new content');
  });
});

describe('formatVersionLabel', () => {
  it('formats ISO date to Indonesian locale', () => {
    const version: NoteVersion = {
      id: 'v1',
      noteId: 'note1',
      snapshot: { title: 'T', content: 'C', blocks: [] },
      createdAt: '2026-01-15T10:30:00.000Z',
    };
    const label = formatVersionLabel(version);
    // Should contain year 2026
    expect(label).toContain('2026');
  });
});
