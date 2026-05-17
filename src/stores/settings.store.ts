import { create }   from 'zustand';
import { persist }  from 'zustand/middleware';
import { type UserPreferences, DEFAULT_PREFERENCES } from '@/types/user.types';

interface SettingsStore {
  preferences:    UserPreferences;
  setPreference:  <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,

      setPreference: (key, value) =>
        set(
          (s) => ({ preferences: { ...s.preferences, [key]: value } }),
          false,
          'settings/setPreference'
        ),

      resetPreferences: () =>
        set({ preferences: DEFAULT_PREFERENCES }, false, 'settings/resetPreferences'),
    }),
    { name: 'nalakoe-settings' }
  )
);
