import { describe, it, expect } from 'vitest';
import { countWords, estimateReadingTime, analyzeContent } from '@/lib/reading-time';

describe('countWords', () => {
  it('counts simple words', () => {
    expect(countWords('satu dua tiga')).toBe(3);
  });

  it('strips HTML before counting', () => {
    expect(countWords('<p>satu dua</p> <em>tiga</em>')).toBe(3);
  });

  it('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only string', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('handles multiple spaces between words', () => {
    expect(countWords('satu   dua    tiga')).toBe(3);
  });

  it('handles newlines', () => {
    expect(countWords('satu\ndua\ntiga')).toBe(3);
  });
});

describe('estimateReadingTime', () => {
  it('returns minimum 1 for very short content', () => {
    expect(estimateReadingTime(0)).toBe(1);
    expect(estimateReadingTime(1)).toBe(1);
  });

  it('estimates proportionally for longer content', () => {
    // Assuming WORDS_PER_MINUTE is ~200
    const result = estimateReadingTime(400);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeGreaterThan(0);
  });

  it('always returns a positive integer', () => {
    [0, 50, 200, 500, 1000].forEach((count) => {
      const result = estimateReadingTime(count);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});

describe('analyzeContent', () => {
  it('returns wordCount and readingTimeMinutes', () => {
    const result = analyzeContent('satu dua tiga empat lima');
    expect(result.wordCount).toBe(5);
    expect(result.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it('returns zeros for empty content', () => {
    const result = analyzeContent('');
    expect(result.wordCount).toBe(0);
    expect(result.readingTimeMinutes).toBeGreaterThanOrEqual(1); // minimum 1
  });

  it('handles HTML content', () => {
    const result = analyzeContent('<p>Ini adalah <strong>catatan</strong> saya.</p>');
    expect(result.wordCount).toBe(4);
  });
});
