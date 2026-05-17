import { describe, it, expect } from 'vitest';
import { getCardAccentColor, getTimeGradient } from '@/lib/color-gradient';

/**
 * Tests for the utility functions used by NoteShareCard.
 * The component itself (html-to-image, navigator.share) requires browser APIs
 * so we test the pure helper logic here.
 */
describe('note-share-card utilities', () => {
  describe('getCardAccentColor', () => {
    it('returns a valid hex color string', () => {
      const result = getCardAccentColor(new Date().toISOString());
      expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('returns consistent color for same timestamp', () => {
      const ts = '2025-03-15T08:00:00.000Z';
      expect(getCardAccentColor(ts)).toBe(getCardAccentColor(ts));
    });
  });

  describe('getTimeGradient', () => {
    it('returns an object with gradient and label', () => {
      const result = getTimeGradient(new Date().toISOString());
      expect(result).toHaveProperty('gradient');
      expect(result).toHaveProperty('label');
      expect(typeof result.gradient).toBe('string');
      expect(typeof result.label).toBe('string');
    });

    it('gradient string is non-empty', () => {
      const result = getTimeGradient(new Date().toISOString());
      expect(result.gradient.length).toBeGreaterThan(0);
    });
  });
});
