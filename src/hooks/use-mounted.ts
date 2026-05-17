import { useState, useEffect } from 'react';

/**
 * Returns true only after the component has mounted on the client.
 * Use this to prevent hydration mismatch for client-only values
 * (theme, localStorage, matchMedia, etc.).
 *
 * @example
 * function ThemeToggle() {
 *   const mounted = useMounted();
 *   if (!mounted) return <div className="w-9 h-9" />; // same size placeholder
 *   return <ActualThemeToggle />;
 * }
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
