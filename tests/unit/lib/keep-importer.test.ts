import { describe, it, expect } from 'vitest';
import { parseKeepJson } from '@/lib/importer/keep-importer';

const USER_ID = 'user-test-123';

describe('parseKeepJson', () => {
  it('parses a single text note', () => {
    const raw = {
      title: 'My Keep Note',
      textContent: 'Hello world',
      createdTimestampUsec: 1_700_000_000_000_000,
      userEditedTimestampUsec: 1_700_000_100_000_000,
    };
    const { notes, result } = parseKeepJson(raw, USER_ID);
    expect(result.total).toBe(1);
    expect(result.imported).toBe(1);
    expect(notes[0].title).toBe('My Keep Note');
    expect(notes[0].content).toBe('Hello world');
    expect(notes[0].userId).toBe(USER_ID);
    expect(notes[0].originalCreatedAt).toBeTruthy();
  });

  it('parses an array of notes', () => {
    const raw = [
      { title: 'A', textContent: 'Content A' },
      { title: 'B', textContent: 'Content B' },
    ];
    const { notes, result } = parseKeepJson(raw, USER_ID);
    expect(result.total).toBe(2);
    expect(result.imported).toBe(2);
    expect(notes).toHaveLength(2);
  });

  it('converts listContent to checklist block', () => {
    const raw = {
      title: 'Shopping',
      listContent: [
        { text: 'Apples', isChecked: true },
        { text: 'Bananas', isChecked: false },
      ],
    };
    const { notes } = parseKeepJson(raw, USER_ID);
    expect(notes[0].blocks[0].type).toBe('checklist');
    const items = JSON.parse(notes[0].blocks[0].content);
    expect(items).toHaveLength(2);
    expect(items[0].isChecked).toBe(true);
  });

  it('maps Keep labels to tags', () => {
    const raw = {
      title: 'Tagged',
      textContent: 'text',
      labels: [{ name: 'Work' }, { name: 'Personal' }],
    };
    const { notes } = parseKeepJson(raw, USER_ID);
    expect(notes[0].tags).toContain('work');
    expect(notes[0].tags).toContain('personal');
  });

  it('preserves isPinned and trashed status', () => {
    const raw = { title: 'Pinned', textContent: 'x', isPinned: true };
    const { notes } = parseKeepJson(raw, USER_ID);
    expect(notes[0].isPinned).toBe(true);
    expect(notes[0].status).toBe('active');

    const trashed = { title: 'Trashed', textContent: 'x', isTrashed: true };
    const { notes: t } = parseKeepJson(trashed, USER_ID);
    expect(t[0].status).toBe('trashed');
  });

  it('maps Keep color to accent color', () => {
    const raw = { title: 'Red', textContent: 'x', color: 'RED' };
    const { notes } = parseKeepJson(raw, USER_ID);
    expect(notes[0].accentColor).toBe('#ef4444');
  });

  it('skips empty notes and records in errors', () => {
    const raw = [
      { title: '', textContent: '' },
      { title: 'Good', textContent: 'content' },
    ];
    const { result } = parseKeepJson(raw, USER_ID);
    expect(result.skipped).toBe(1);
    expect(result.imported).toBe(1);
    expect(result.errors).toHaveLength(1);
  });

  it('handles invalid JSON gracefully', () => {
    const { notes, result } = parseKeepJson(null, USER_ID);
    expect(notes).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
  });
});
