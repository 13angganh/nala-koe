import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { addDays, addYears, subDays } from 'date-fns';
import { useTimeCapsule } from '@/hooks/use-time-capsule';

describe('useTimeCapsule', () => {
  const NOW = new Date('2026-06-01T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns unlocked state when isTimeCapsule is false', () => {
    const { result } = renderHook(() => useTimeCapsule(false, null));
    expect(result.current.status.isLocked).toBe(false);
    expect(result.current.status.isUnlocked).toBe(false);
    expect(result.current.status.unlockAt).toBeNull();
  });

  it('returns locked state when unlock date is in the future', () => {
    const future = addDays(NOW, 30).toISOString();
    const { result } = renderHook(() => useTimeCapsule(true, future));
    expect(result.current.status.isLocked).toBe(true);
    expect(result.current.status.isUnlocked).toBe(false);
    expect(result.current.status.daysRemaining).toBeGreaterThan(0);
  });

  it('returns unlocked state when unlock date has passed', () => {
    const past = subDays(NOW, 1).toISOString();
    const { result } = renderHook(() => useTimeCapsule(true, past));
    expect(result.current.status.isLocked).toBe(false);
    expect(result.current.status.isUnlocked).toBe(true);
    expect(result.current.status.daysRemaining).toBe(0);
  });

  it('formats countdown correctly for multi-day duration', () => {
    const future = addDays(NOW, 5).toISOString();
    const { result } = renderHook(() => useTimeCapsule(true, future));
    expect(result.current.status.formattedCountdown).toMatch(/4h|5h/); // approx
  });

  describe('validateUnlockDate', () => {
    it('rejects dates less than 1 day in the future', () => {
      const { result } = renderHook(() => useTimeCapsule(false, null));
      const sameDay = new Date(NOW);
      const error = result.current.validateUnlockDate(sameDay);
      expect(error).not.toBeNull();
    });

    it('accepts valid future date', () => {
      const { result } = renderHook(() => useTimeCapsule(false, null));
      const valid = addDays(NOW, 7);
      const error = result.current.validateUnlockDate(valid);
      expect(error).toBeNull();
    });

    it('rejects date more than 10 years away', () => {
      const { result } = renderHook(() => useTimeCapsule(false, null));
      const tooFar = addYears(NOW, 11);
      const error = result.current.validateUnlockDate(tooFar);
      expect(error).not.toBeNull();
    });
  });
});
