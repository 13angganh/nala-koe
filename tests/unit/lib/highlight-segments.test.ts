import { describe, it, expect } from 'vitest';
import type { NoteHighlight } from '@/types/note.types';

// Inline pure function from note-highlight-marker for testing
function buildSegments(
  content: string,
  highlights: NoteHighlight[]
): { text: string; hasHighlight: boolean }[] {
  if (!highlights.length) {
    return [{ text: content, hasHighlight: false }];
  }
  const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);
  const segments: { text: string; hasHighlight: boolean }[] = [];
  let cursor = 0;

  for (const hl of sorted) {
    if (hl.startOffset > cursor) {
      segments.push({ text: content.slice(cursor, hl.startOffset), hasHighlight: false });
    }
    segments.push({ text: content.slice(hl.startOffset, hl.endOffset), hasHighlight: true });
    cursor = hl.endOffset;
  }
  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), hasHighlight: false });
  }
  return segments;
}

function makeHighlight(id: string, start: number, end: number, text: string): NoteHighlight {
  return { id, text, startOffset: start, endOffset: end, createdAt: new Date().toISOString() };
}

describe('buildSegments', () => {
  it('returns full content when no highlights', () => {
    const segs = buildSegments('Hello world', []);
    expect(segs).toHaveLength(1);
    expect(segs[0].text).toBe('Hello world');
    expect(segs[0].hasHighlight).toBe(false);
  });

  it('wraps single highlight in the middle', () => {
    const segs = buildSegments('Hello world', [makeHighlight('h1', 6, 11, 'world')]);
    expect(segs).toHaveLength(2);
    expect(segs[0]).toEqual({ text: 'Hello ', hasHighlight: false });
    expect(segs[1]).toEqual({ text: 'world', hasHighlight: true });
  });

  it('wraps highlight at start', () => {
    const segs = buildSegments('Hello world', [makeHighlight('h1', 0, 5, 'Hello')]);
    expect(segs[0]).toEqual({ text: 'Hello', hasHighlight: true });
    expect(segs[1]).toEqual({ text: ' world', hasHighlight: false });
  });

  it('handles full content highlight', () => {
    const segs = buildSegments('Hi', [makeHighlight('h1', 0, 2, 'Hi')]);
    expect(segs).toHaveLength(1);
    expect(segs[0].hasHighlight).toBe(true);
  });

  it('handles multiple highlights in order', () => {
    const content = 'one two three';
    const segs = buildSegments(content, [
      makeHighlight('h1', 0, 3, 'one'),
      makeHighlight('h2', 8, 13, 'three'),
    ]);
    expect(segs).toHaveLength(3);
    expect(segs[0]).toEqual({ text: 'one', hasHighlight: true });
    expect(segs[1]).toEqual({ text: ' two ', hasHighlight: false });
    expect(segs[2]).toEqual({ text: 'three', hasHighlight: true });
  });

  it('sorts out-of-order highlights before segmenting', () => {
    const content = 'abc def ghi';
    const segs = buildSegments(content, [
      makeHighlight('h2', 8, 11, 'ghi'),
      makeHighlight('h1', 0, 3, 'abc'),
    ]);
    expect(segs[0].text).toBe('abc');
    expect(segs[0].hasHighlight).toBe(true);
    expect(segs[2].text).toBe('ghi');
    expect(segs[2].hasHighlight).toBe(true);
  });
});
