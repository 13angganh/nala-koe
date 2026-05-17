'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/stores/ui.store';
import { useAccentColor } from '@/hooks/use-accent-color';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useUiStore();

  // Apply accent color (respects seasonal theme override)
  useAccentColor();

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.toggle('dark', resolvedTheme === 'dark');
    };

    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mql.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
