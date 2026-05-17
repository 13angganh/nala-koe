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
        set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),
      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'ui/toggleSidebar'),

      theme: 'system',
      setTheme: (theme) =>
        set({ theme }, false, 'ui/setTheme'),

      // Default accent color dari design token — bukan hardcoded hex
      accentColor: colors.brand[500],
      setAccentColor: (accentColor) =>
        set({ accentColor }, false, 'ui/setAccentColor'),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) =>
        set({ commandPaletteOpen: open }, false, 'ui/setCommandPaletteOpen'),
      toggleCommandPalette: () =>
        set(
          (s) => ({ commandPaletteOpen: !s.commandPaletteOpen }),
          false,
          'ui/toggleCommandPalette'
        ),
    }),
    {
      name:       'nalakoe-ui',
      partialize: (s) => ({
        sidebarOpen: s.sidebarOpen,
        theme:       s.theme,
        accentColor: s.accentColor,
      }),
    }
  )
);
