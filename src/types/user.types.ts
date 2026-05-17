export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string; // ISO string
  updatedAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  accentColor: string; // CSS custom property override, e.g. '#0ea5e9'
  defaultView: 'grid' | 'list';
  enableWeather: boolean;
  enableLocation: boolean;
  enableSeasonalTheme: boolean;
  enableAnimations: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  accentColor: '#0ea5e9',
  defaultView: 'grid',
  enableWeather: false,
  enableLocation: false,
  enableSeasonalTheme: true,
  enableAnimations: true,
};
