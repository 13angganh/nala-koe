import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  slugify,
  truncate,
  generateId,
  isObject,
  clamp,
  debounce,
  stripHtml,
  getContentPreview,
} from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('deduplicates conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    const active = true;
    expect(cn('base', active && 'active')).toBe('base active');
    expect(cn('base', !active && 'inactive')).toBe('base');
  });
});

describe('slugify', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes non-alphanumeric characters', () => {
    expect(slugify('Catatan #1: Penting!')).toBe('catatan-1-penting');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('a  --  b')).toBe('a-b');
  });

  it('handles accented characters', () => {
    expect(slugify('Café résumé')).toBe('cafe-resume');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  it('returns string as-is if within limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis', () => {
    const result = truncate('Hello World', 8);
    expect(result).toHaveLength(8);
    expect(result.endsWith('…')).toBe(true);
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });

  it('contains a hyphen separator', () => {
    expect(generateId()).toContain('-');
  });
});

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject('string')).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject(true)).toBe(false);
  });
});

describe('clamp', () => {
  it('clamps below min', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('clamps above max', () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('returns value when within range', () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it('handles equal min/max', () => {
    expect(clamp(42, 10, 10)).toBe(10);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('resets timer on each call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('passes arguments to the function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('stripHtml', () => {
  it('removes simple HTML tags', () => {
    expect(stripHtml('<p>hello</p>')).toBe('hello');
  });

  it('removes nested tags', () => {
    expect(stripHtml('<div><strong>bold</strong> text</div>')).toBe('bold text');
  });

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('');
  });

  it('leaves plain text unchanged', () => {
    expect(stripHtml('plain text')).toBe('plain text');
  });

  it('removes self-closing tags', () => {
    expect(stripHtml('line1<br/>line2')).toBe('line1line2');
  });
});

describe('getContentPreview', () => {
  it('strips HTML and truncates to maxLength', () => {
    const html = '<p>Ini adalah catatan panjang yang harus dipotong.</p>';
    const result = getContentPreview(html, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result).not.toContain('<');
  });

  it('defaults to 150 chars', () => {
    const long = '<p>' + 'a'.repeat(200) + '</p>';
    expect(getContentPreview(long).length).toBeLessThanOrEqual(150);
  });

  it('returns full text if within limit', () => {
    expect(getContentPreview('<p>pendek</p>', 50)).toBe('pendek');
  });
});
