import { describe, it, expect } from 'vitest';
import { getTimeGradient, getCurrentTimeGradient, getCardAccentColor } from '@/lib/color-gradient';

describe('getTimeGradient', () => {
  const makeISO = (hour: number) => {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  it('returns "dawn" for 05:00', () => {
    expect(getTimeGradient(makeISO(5)).period).toBe('dawn');
  });

  it('returns "morning" for 08:00', () => {
    expect(getTimeGradient(makeISO(8)).period).toBe('morning');
  });

  it('returns "noon" for 12:00', () => {
    expect(getTimeGradient(makeISO(12)).period).toBe('noon');
  });

  it('returns "afternoon" for 15:00', () => {
    expect(getTimeGradient(makeISO(15)).period).toBe('afternoon');
  });

  it('returns "evening" for 18:00', () => {
    expect(getTimeGradient(makeISO(18)).period).toBe('evening');
  });

  it('returns "night" for 22:00', () => {
    expect(getTimeGradient(makeISO(22)).period).toBe('night');
  });

  it('returns "night" for 02:00 (pre-dawn)', () => {
    expect(getTimeGradient(makeISO(2)).period).toBe('night');
  });

  it('includes gradient CSS string', () => {
    const result = getTimeGradient(makeISO(9));
    expect(result.gradient).toContain('linear-gradient');
  });

  it('includes hex accent color', () => {
    const result = getTimeGradient(makeISO(9));
    expect(result.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('includes human label', () => {
    const result = getTimeGradient(makeISO(9));
    expect(result.label).toBeTruthy();
  });
});

describe('getCurrentTimeGradient', () => {
  it('returns a valid gradient for the current time', () => {
    const result = getCurrentTimeGradient();
    expect(result.period).toMatch(/dawn|morning|noon|afternoon|evening|night/);
    expect(result.accent).toMatch(/^#/);
  });
});

describe('getCardAccentColor', () => {
  it('returns a hex color string', () => {
    const iso = new Date().toISOString();
    const result = getCardAccentColor(iso);
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
