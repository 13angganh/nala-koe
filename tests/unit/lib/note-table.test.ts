import { describe, it, expect } from 'vitest';
import {
  createEmptyTable,
  serializeTable,
  deserializeTable,
} from '@/components/notes/note-table';

// ─── createEmptyTable ─────────────────────────────────────────────────────────

describe('createEmptyTable', () => {
  it('creates table with default 3 cols and 2 rows', () => {
    const t = createEmptyTable();
    expect(t.headers).toHaveLength(3);
    expect(t.rows).toHaveLength(2);
    expect(t.rows[0]).toHaveLength(3);
  });

  it('creates table with custom dimensions', () => {
    const t = createEmptyTable(5, 4);
    expect(t.headers).toHaveLength(5);
    expect(t.rows).toHaveLength(4);
    expect(t.rows[0]).toHaveLength(5);
  });

  it('populates headers as "Kolom N"', () => {
    const t = createEmptyTable(2, 1);
    expect(t.headers[0]).toBe('Kolom 1');
    expect(t.headers[1]).toBe('Kolom 2');
  });

  it('initialises all cells as empty strings', () => {
    const t = createEmptyTable(3, 2);
    t.rows.forEach((row) => row.forEach((cell) => expect(cell).toBe('')));
  });
});

// ─── serializeTable / deserializeTable ───────────────────────────────────────

describe('serializeTable + deserializeTable roundtrip', () => {
  it('roundtrips an empty table', () => {
    const original = createEmptyTable();
    const json = serializeTable(original);
    const restored = deserializeTable(json);

    expect(restored.headers).toEqual(original.headers);
    expect(restored.rows).toEqual(original.rows);
  });

  it('roundtrips a table with values', () => {
    const original = createEmptyTable(2, 2);
    original.headers[0] = 'Nama';
    original.headers[1] = 'Nilai';
    original.rows[0]![0] = 'Alice';
    original.rows[0]![1] = '90';
    original.rows[1]![0] = 'Bob';
    original.rows[1]![1] = '85';

    const json = serializeTable(original);
    const restored = deserializeTable(json);

    expect(restored.headers).toEqual(['Nama', 'Nilai']);
    expect(restored.rows[0]).toEqual(['Alice', '90']);
    expect(restored.rows[1]).toEqual(['Bob', '85']);
  });

  it('returns a fallback empty table for invalid JSON', () => {
    const restored = deserializeTable('not valid json {{');
    expect(restored.headers).toHaveLength(3);
    expect(restored.rows).toHaveLength(2);
  });

  it('returns a fallback empty table for wrong shape', () => {
    const restored = deserializeTable(JSON.stringify({ foo: 'bar' }));
    expect(restored.headers).toHaveLength(3);
    expect(restored.rows).toHaveLength(2);
  });

  it('serializes to valid JSON string', () => {
    const t = createEmptyTable();
    const json = serializeTable(t);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
