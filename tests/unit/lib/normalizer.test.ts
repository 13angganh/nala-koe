import { describe, it, expect } from 'vitest';
import { ok, err, isOk, normalizeTimestamp, normalizeDocument } from '@/lib/normalizer';

describe('ok', () => {
  it('wraps data in ApiResponse shape', () => {
    const result = ok({ id: '1', title: 'Test' });
    expect(result.data).toEqual({ id: '1', title: 'Test' });
    expect(result.error).toBeNull();
  });

  it('works with primitive values', () => {
    expect(ok(42).data).toBe(42);
    expect(ok('hello').data).toBe('hello');
  });
});

describe('err', () => {
  it('wraps error info in ApiError shape', () => {
    const result = err('NOT_FOUND', 'Resource not found');
    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      details: undefined,
    });
  });

  it('includes details when provided', () => {
    const result = err('VALIDATION', 'Invalid input', { field: 'title' });
    expect(result.error?.details).toEqual({ field: 'title' });
  });
});

describe('isOk', () => {
  it('returns true for successful response', () => {
    expect(isOk(ok('hello'))).toBe(true);
  });

  it('returns false for error response', () => {
    expect(isOk(err('ERR', 'fail'))).toBe(false);
  });
});

describe('normalizeTimestamp', () => {
  it('returns string as-is', () => {
    const iso = '2025-01-15T09:30:00.000Z';
    expect(normalizeTimestamp(iso)).toBe(iso);
  });

  it('converts Date to ISO string', () => {
    const date = new Date('2025-01-15T09:30:00.000Z');
    expect(normalizeTimestamp(date)).toBe(date.toISOString());
  });

  it('handles Firestore Timestamp-like objects', () => {
    const firestoreTs = {
      toDate: () => new Date('2025-01-15T09:30:00.000Z'),
    };
    expect(normalizeTimestamp(firestoreTs)).toBe('2025-01-15T09:30:00.000Z');
  });

  it('returns current time for unrecognized values', () => {
    const before = Date.now();
    const result = normalizeTimestamp(null);
    const after = Date.now();
    const ts = new Date(result).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe('normalizeDocument', () => {
  it('normalizes known timestamp fields', () => {
    const firestoreTs = { toDate: () => new Date('2025-06-01T00:00:00.000Z') };
    const doc = {
      id: '1',
      title: 'Test',
      createdAt: firestoreTs,
      updatedAt: firestoreTs,
    };

    const result = normalizeDocument(doc);
    expect(typeof result.createdAt).toBe('string');
    expect(typeof result.updatedAt).toBe('string');
    expect(result.id).toBe('1');
    expect(result.title).toBe('Test');
  });

  it('leaves non-timestamp fields untouched', () => {
    const doc = { id: '1', wordCount: 42, tags: ['a', 'b'] };
    const result = normalizeDocument(doc);
    expect(result.wordCount).toBe(42);
    expect(result.tags).toEqual(['a', 'b']);
  });

  it('handles missing timestamp fields gracefully', () => {
    const doc = { id: '1' };
    expect(() => normalizeDocument(doc)).not.toThrow();
  });
});
