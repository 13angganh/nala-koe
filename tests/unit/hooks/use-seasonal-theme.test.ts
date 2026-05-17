import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSeasonalTheme } from '@/hooks/use-seasonal-theme';

// Helper: override Date to a fixed date
function mockDate(isoDate: string) {
  const fixed = new Date(isoDate);
  vi.setSystemTime(fixed);
}

describe('useSeasonalTheme', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when disabled', () => {
    mockDate('2025-03-10');
    const { result } = renderHook(() => useSeasonalTheme(false));
    expect(result.current.activeTheme).toBeNull();
    expect(result.current.isActive).toBe(false);
  });

  it('activates Ramadan theme in range (March 10)', () => {
    mockDate('2025-03-10');
    const { result } = renderHook(() => useSeasonalTheme(true));
    expect(result.current.activeTheme?.id).toBe('ramadan');
    expect(result.current.isActive).toBe(true);
  });

  it('activates Lebaran theme in range (April 5)', () => {
    mockDate('2025-04-05');
    const { result } = renderHook(() => useSeasonalTheme(true));
    expect(result.current.activeTheme?.id).toBe('lebaran');
    expect(result.current.isActive).toBe(true);
  });

  it('does not activate Lebaran theme after range (April 20)', () => {
    mockDate('2025-04-20');
    const { result } = renderHook(() => useSeasonalTheme(true));
    expect(result.current.activeTheme).toBeNull();
    expect(result.current.isActive).toBe(false);
  });

  it('activates new-year theme on Dec 28', () => {
    mockDate('2025-12-28');
    const { result } = renderHook(() => useSeasonalTheme(true));
    expect(result.current.activeTheme?.id).toBe('new-year');
    expect(result.current.isActive).toBe(true);
  });

  it('activates new-year theme on Jan 3 (cross-year)', () => {
    mockDate('2026-01-03');
    const { result } = renderHook(() => useSeasonalTheme(true));
    expect(result.current.activeTheme?.id).toBe('new-year');
    expect(result.current.isActive).toBe(true);
  });

  it('returns null in neutral month (July)', () => {
    mockDate('2025-07-15');
    const { result } = renderHook(() => useSeasonalTheme(true));
    expect(result.current.activeTheme).toBeNull();
    expect(result.current.isActive).toBe(false);
  });

  it('active theme has accentColor property', () => {
    mockDate('2025-03-15');
    const { result } = renderHook(() => useSeasonalTheme(true));
    expect(result.current.activeTheme?.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
