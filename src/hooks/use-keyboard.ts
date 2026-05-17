'use client';

import { useEffect, useCallback } from 'react';

type ModifierKey = 'meta' | 'ctrl' | 'alt' | 'shift';

interface KeyboardShortcut {
  key: string;
  modifiers?: ModifierKey[];
  onKeyDown: () => void;
  enabled?: boolean;
}

/**
 * Register keyboard shortcuts. Handles Cmd (Mac) / Ctrl (Windows) automatically.
 *
 * @example
 * useKeyboard([
 *   { key: 'k', modifiers: ['meta'], onKeyDown: openCommandPalette },
 *   { key: 'Escape', onKeyDown: closeModal },
 * ]);
 */
export function useKeyboard(shortcuts: KeyboardShortcut[]): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        if (!keyMatch) continue;

        const modifiers = shortcut.modifiers ?? [];
        const metaOrCtrl = modifiers.includes('meta') || modifiers.includes('ctrl');

        const modifierMatch =
          (!metaOrCtrl || e.metaKey || e.ctrlKey) &&
          (!modifiers.includes('alt') || e.altKey) &&
          (!modifiers.includes('shift') || e.shiftKey);

        if (modifierMatch) {
          e.preventDefault();
          shortcut.onKeyDown();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
