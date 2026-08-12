import { useSyncExternalStore } from 'react';

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
 *
 * Implemented via useSyncExternalStore rather than the classic
 * useState(false) + useEffect(() => setState(true), []) pattern. That
 * pattern is flagged by react-hooks/set-state-in-effect (calling setState
 * synchronously in an effect body), and more importantly it's exactly the
 * case React's own docs point to useSyncExternalStore for: this hook's
 * whole job is telling React "the answer differs between server and
 * client, and only becomes available on the client" — which is what the
 * getServerSnapshot (3rd) argument communicates directly, instead of
 * rendering `false` on both server AND the first client pass, then
 * re-rendering via an effect. There's no real store to subscribe to
 * (mount status never changes again after the first client render), so
 * `subscribe` is a no-op that never calls back — a pattern confirmed
 * workable directly by the React team, not a project-specific hack.
 */
const subscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot: mounted
    () => false // server snapshot: not mounted
  );
}
