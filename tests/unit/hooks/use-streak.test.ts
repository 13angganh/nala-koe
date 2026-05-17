import { describe, it, expect } from 'vitest';

// Extract pure logic from use-streak for testing
function toDateStr(iso: string): string {
  return iso.slice(0, 10);
}

function computeStreak(sortedDates: string[]): { current: number; longest: number } {
  if (sortedDates.length === 0) return { current: 0, longest: 0 };

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let longest = 0;
  let run = 1;

  for (let i = sortedDates.length - 1; i > 0; i--) {
    const a = new Date(sortedDates[i]);
    const b = new Date(sortedDates[i - 1]);
    const diffDays = Math.round((a.getTime() - b.getTime()) / 86400000);
    if (diffDays === 1) {
      run++;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  let current = 0;
  const last = sortedDates[sortedDates.length - 1];
  if (last === todayStr || last === yesterdayStr) {
    let streak = 1;
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const a = new Date(sortedDates[i]);
      const b = new Date(sortedDates[i - 1]);
      if (Math.round((a.getTime() - b.getTime()) / 86400000) === 1) {
        streak++;
      } else {
        break;
      }
    }
    current = streak;
  }

  return { current, longest };
}

// Helper to build dates relative to today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

describe('computeStreak', () => {
  it('returns zeros for empty array', () => {
    expect(computeStreak([])).toEqual({ current: 0, longest: 0 });
  });

  it('returns current=1 if today is the only date', () => {
    const { current, longest } = computeStreak([daysAgo(0)]);
    expect(current).toBe(1);
    expect(longest).toBe(1);
  });

  it('returns current=1 if yesterday is the only date', () => {
    const { current } = computeStreak([daysAgo(1)]);
    expect(current).toBe(1);
  });

  it('returns current=0 if last date is 2+ days ago', () => {
    const { current } = computeStreak([daysAgo(3), daysAgo(2)]);
    expect(current).toBe(0);
  });

  it('counts consecutive days streak correctly', () => {
    const dates = [daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1), daysAgo(0)];
    const { current, longest } = computeStreak(dates);
    expect(current).toBe(5);
    expect(longest).toBe(5);
  });

  it('counts longest streak even when current streak is broken', () => {
    const dates = [daysAgo(10), daysAgo(9), daysAgo(8), daysAgo(5), daysAgo(4)];
    const { current, longest } = computeStreak(dates);
    expect(longest).toBe(3);
    expect(current).toBe(0); // last entry was 4 days ago
  });

  it('handles single date today', () => {
    const { current } = computeStreak([daysAgo(0)]);
    expect(current).toBe(1);
  });

  it('computes longest among multiple sub-streaks', () => {
    // 5-day streak vs 3-day streak, neither touching today
    const dates = [
      daysAgo(20), daysAgo(19), daysAgo(18), daysAgo(17), daysAgo(16), // 5-day
      daysAgo(10), daysAgo(9), daysAgo(8), // 3-day
    ];
    const { longest, current } = computeStreak(dates);
    expect(longest).toBe(5);
    expect(current).toBe(0);
  });
});
