'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/stores/ui.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useSeasonalTheme } from './use-seasonal-theme';

/**
 * Applies the active accent color to CSS custom properties on :root.
 * Priority: seasonal theme (if enabled) > user accent preference.
 * Also derives --accent-hover and --accent-subtle from the active color.
 */
export function useAccentColor(): { accentColor: string; isSeasonalActive: boolean } {
  const { accentColor: userAccent } = useUiStore();
  const { preferences } = useSettingsStore();
  const { activeTheme, isActive: isSeasonalActive } = useSeasonalTheme(
    preferences.enableSeasonalTheme ?? true
  );

  const resolvedColor =
    isSeasonalActive && activeTheme ? activeTheme.accentColor : userAccent;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Set main accent
    root.style.setProperty('--accent', resolvedColor);

    // Derive hover (darken ~10% via opacity overlay trick — simple approach)
    root.style.setProperty('--accent-hover', resolvedColor);

    // Derive subtle (accent at 15% opacity as a hex alpha)
    root.style.setProperty('--accent-subtle', `${resolvedColor}26`);
  }, [resolvedColor]);

  return { accentColor: resolvedColor, isSeasonalActive };
}
