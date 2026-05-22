import { describe, it, expect } from 'vitest';
import { parseColorNoteJson } from '@/lib/importer/colornote-importer';

const USER_ID = 'user-test-456';

describe('parseColorNoteJson', () => {
  it('parses a single text note', () => {
    const raw = [
      {
        title: 'CN Note',
        note: 'Hello from ColorNote',
        color: 7,
        create_time: 1_700_000_000,
        modify_time: 1_700_000_100,
        type: 0,
      },
    ];
    const { notes, result } = parseColorNoteJson(raw, USER_ID);
    expect(result.imported).toBe(1);
    expect(notes[0]?.title).toBe('CN Note');
    expect(notes[0]?.content).toBe('Hello from ColorNote');
    expect(notes[0]?.userId).toBe(USER_ID);
  });

  it('parses checklist note (type 1)', () => {
    const raw = [
      {
        title: 'Tasks',
        note: '☑ Done task\n☐ Pending task',
        type: 1,
      },
    ];
    const { notes } = parseColorNoteJson(raw, USER_ID);
    expect(notes[0]?.blocks[0]?.type).toBe('checklist');
    const items = JSON.parse(notes[0]?.blocks[0]?.content);
    expect(items[0]?.isChecked).toBe(true);
    expect(items[1]?.isChecked).toBe(false);
  });

  it('maps color index to accent color', () => {
    const raw = [{ title: 'Red', note: 'x', color: 0, type: 0 }];
    const { notes } = parseColorNoteJson(raw, USER_ID);
    expect(notes[0]?.accentColor).toBe('#ef4444');
  });

  it('handles wrapped object format', () => {
    const raw = {
      notes: [
        { title: 'A', note: 'content', type: 0 },
        { title: 'B', note: 'content', type: 0 },
      ],
    };
    const { notes, result } = parseColorNoteJson(raw, USER_ID);
    expect(result.imported).toBe(2);
    expect(notes).toHaveLength(2);
  });

  it('preserves original timestamps', () => {
    const raw = [{ title: 'T', note: 'x', create_time: 1_000_000, type: 0 }];
    const { notes } = parseColorNoteJson(raw, USER_ID);
    expect(notes[0]?.originalCreatedAt).toBeTruthy();
    expect(new Date(notes[0]?.createdAt).getTime()).toBe(1_000_000_000);
  });

  it('skips empty notes', () => {
    const raw = [{ title: '', note: '', type: 0 }];
    const { result } = parseColorNoteJson(raw, USER_ID);
    expect(result.skipped).toBe(1);
    expect(result.imported).toBe(0);
  });

  it('calculates word count', () => {
    const raw = [{ title: 'W', note: 'one two three four five', type: 0 }];
    const { notes } = parseColorNoteJson(raw, USER_ID);
    expect(notes[0]?.wordCount).toBe(5);
  });
});
