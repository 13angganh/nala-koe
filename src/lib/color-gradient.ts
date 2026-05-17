/**
 * color-gradient.ts
 * Generates dynamic accent colors based on time-of-day when a note was created.
 * Used for the "Gradasi Warna Dinamis" feature.
 */

export type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

export interface TimeGradient {
  period: TimeOfDay;
  label: string;
  from: string;
  to: string;
  /** CSS gradient string */
  gradient: string;
  /** Single accent hex for card border/badge */
  accent: string;
}

const TIME_GRADIENTS: Record<TimeOfDay, Omit<TimeGradient, 'period'>> = {
  dawn: {
    label: 'Fajar',
    from: '#f9a8d4',
    to: '#fde68a',
    gradient: 'linear-gradient(135deg, #f9a8d4 0%, #fde68a 100%)',
    accent: '#f472b6',
  },
  morning: {
    label: 'Pagi',
    from: '#bae6fd',
    to: '#d1fae5',
    gradient: 'linear-gradient(135deg, #bae6fd 0%, #d1fae5 100%)',
    accent: '#0ea5e9',
  },
  noon: {
    label: 'Siang',
    from: '#fde68a',
    to: '#fca5a5',
    gradient: 'linear-gradient(135deg, #fde68a 0%, #fca5a5 100%)',
    accent: '#f59e0b',
  },
  afternoon: {
    label: 'Sore',
    from: '#fed7aa',
    to: '#fca5a5',
    gradient: 'linear-gradient(135deg, #fed7aa 0%, #fca5a5 100%)',
    accent: '#f97316',
  },
  evening: {
    label: 'Petang',
    from: '#c4b5fd',
    to: '#f9a8d4',
    gradient: 'linear-gradient(135deg, #c4b5fd 0%, #f9a8d4 100%)',
    accent: '#a78bfa',
  },
  night: {
    label: 'Malam',
    from: '#1e293b',
    to: '#334155',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    accent: '#64748b',
  },
};

/**
 * Determine time-of-day period from an hour (0–23).
 * Dawn: 04–06, Morning: 06–11, Noon: 11–14,
 * Afternoon: 14–17, Evening: 17–20, Night: 20–04
 */
function hourToPeriod(hour: number): TimeOfDay {
  if (hour >= 4 && hour < 6) return 'dawn';
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

/**
 * Get the time gradient for a given ISO date string.
 */
export function getTimeGradient(isoDate: string): TimeGradient {
  const date = new Date(isoDate);
  const hour = date.getHours();
  const period = hourToPeriod(hour);
  return { period, ...TIME_GRADIENTS[period] };
}

/**
 * Get the time gradient for the current moment.
 */
export function getCurrentTimeGradient(): TimeGradient {
  return getTimeGradient(new Date().toISOString());
}

/**
 * Get a CSS opacity-aware background style for note cards.
 * In dark mode the gradient should be subtle (low opacity).
 */
export function getCardGradientStyle(
  isoDate: string,
  isDark: boolean
): React.CSSProperties {
  const gradient = getTimeGradient(isoDate);
  const opacity = isDark ? 0.06 : 0.12;

  return {
    background: gradient.gradient.replace(
      /linear-gradient/,
      `linear-gradient`
    ),
    opacity,
  } as React.CSSProperties;
}

/**
 * Get card accent border color for a note created at a given time.
 */
export function getCardAccentColor(isoDate: string): string {
  return getTimeGradient(isoDate).accent;
}
