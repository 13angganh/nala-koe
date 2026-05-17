'use client';

import { useMemo } from 'react';
import { SEASONAL_THEMES } from '@/constants/seasonal';
import type { SeasonalTheme } from '@/types/settings.types';

/**
 * Detects the active seasonal theme based on the current date.
 * Handles cross-year ranges (e.g. Dec 25 – Jan 5).
 */
function isDateInRange(
  date: Date,
  monthStart: number,
  dayStart: number,
  monthEnd: number,
  dayEnd: number
): boolean {
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  // Cross-year range: e.g. Dec (11) → Jan (0)
  if (monthStart > monthEnd) {
    return (
      (month === monthStart && day >= dayStart) ||
      month > monthStart ||
      month < monthEnd ||
      (month === monthEnd && day <= dayEnd)
    );
  }

  // Same-month range
  if (monthStart === monthEnd) {
    return month === monthStart && day >= dayStart && day <= dayEnd;
  }

  // Normal range within same year
  return (
    (month === monthStart && day >= dayStart) ||
    (month > monthStart && month < monthEnd) ||
    (month === monthEnd && day <= dayEnd)
  );
}

export interface UseSeasonalThemeResult {
  activeTheme: SeasonalTheme | null;
  isActive: boolean;
}

export function useSeasonalTheme(enabled: boolean = true): UseSeasonalThemeResult {
  const result = useMemo<UseSeasonalThemeResult>(() => {
    if (!enabled) return { activeTheme: null, isActive: false };

    const now = new Date();
    const found = SEASONAL_THEMES.find((theme) => {
      const { monthStart, dayStart, monthEnd, dayEnd } = theme.active;
      return isDateInRange(now, monthStart, dayStart, monthEnd, dayEnd);
    });

    return found
      ? { activeTheme: found, isActive: true }
      : { activeTheme: null, isActive: false };
  }, [enabled]);

  return result;
}
