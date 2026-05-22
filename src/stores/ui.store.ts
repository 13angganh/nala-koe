import { create }   from 'zustand';
import { persist }  from 'zustand/middleware';
import { colors }   from '@/tokens/colors';

type Theme = 'light' | 'dark' | 'system';

interface UiStore {
  // Sidebar
  sidebarOpen:    boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar:  () => void;

  // Theme
  theme:    Theme;
  setTheme: (theme: Theme) => void;

  // Accent color
  accentColor:    string;
  setAccentColor: (color: string) => void;

  // Command Palette
  commandPaletteOpen:    boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette:  () => void;
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }, false),
      toggleSidebar: () =>
        set((s: UiStore) => ({ sidebarOpen: !s.sidebarOpen }), false),

      theme: 'system',
      setTheme: (theme) =>
        set({ theme }, false),

      // Default accent color dari design token — bukan hardcoded hex
      accentColor: colors.brand[500],
      setAccentColor: (accentColor) =>
        set({ accentColor }, false),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) =>
        set({ commandPaletteOpen: open }, false),
      toggleCommandPalette: () =>
        set(
          (s: UiStore) => ({ commandPaletteOpen: !s.commandPaletteOpen }), false),
    }),
    {
      name:       'nalakoe-ui',
      partialize: (s: UiStore) => ({
        sidebarOpen: s.sidebarOpen,
        theme:       s.theme,
        accentColor: s.accentColor,
      }),
    }
  )
);
