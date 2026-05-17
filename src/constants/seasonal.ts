import type { SeasonalTheme } from '@/types/settings.types';

/**
 * Seasonal themes activated automatically based on date.
 * Month is 0-indexed (0 = January, 11 = December).
 */
export const SEASONAL_THEMES: SeasonalTheme[] = [
  {
    id: 'ramadan',
    name: 'Ramadan',
    // Approximate dates — adjust yearly. 2025: March 1 – March 30
    active: { monthStart: 2, dayStart: 1, monthEnd: 2, dayEnd: 30 },
    accentColor: '#7c3aed',
    backgroundClass: 'bg-gradient-to-br from-violet-950 to-indigo-900',
  },
  {
    id: 'lebaran',
    name: 'Lebaran',
    // Approximate: first 2 weeks of April
    active: { monthStart: 3, dayStart: 1, monthEnd: 3, dayEnd: 14 },
    accentColor: '#d97706',
    backgroundClass: 'bg-gradient-to-br from-amber-900 to-yellow-800',
  },
  {
    id: 'new-year',
    name: 'Tahun Baru',
    // Dec 25 – Jan 5
    active: { monthStart: 11, dayStart: 25, monthEnd: 0, dayEnd: 5 },
    accentColor: '#0ea5e9',
    backgroundClass: 'bg-gradient-to-br from-slate-900 to-blue-950',
  },
] as const;
