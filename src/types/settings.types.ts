export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  defaultNoteView: 'grid' | 'list';
  defaultNoteSort: 'updatedAt' | 'createdAt' | 'title';
  enableAnimations: boolean;
  enableWeather: boolean;
  enableLocation: boolean;
  enableBiometric: boolean;
  enableSeasonalTheme: boolean;
  noteTextureDefault: NoteTexture;
  noteFontDefault: NoteFontWeight;
}

export type NoteTexture = 'plain' | 'lined' | 'dotgrid' | 'grid';

export type NoteFontWeight = 'regular' | 'medium' | 'semibold' | 'italic';

export interface SeasonalTheme {
  id: string;
  name: string;
  active: {
    monthStart: number; // 0-indexed
    dayStart: number;
    monthEnd: number;
    dayEnd: number;
  };
  accentColor: string;
  backgroundClass: string;
}
