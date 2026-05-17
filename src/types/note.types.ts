import type { MoodId } from './mood.types';
import type { NoteTexture, NoteFontWeight } from './settings.types';
import type { WeatherSnapshot } from './api.types';

export type NoteStatus = 'active' | 'archived' | 'trashed';

export type NoteContentBlockType =
  | 'paragraph'
  | 'checklist'
  | 'image'
  | 'table'
  | 'math'
  | 'url-preview'
  | 'audio';

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface NoteContentBlock {
  id: string;
  type: NoteContentBlockType;
  content: string; // JSON string for complex types, plain text for paragraph
  order: number;
}

export interface NoteLocation {
  latitude: number;
  longitude: number;
  placeName: string | null;
}

export interface NoteReaction {
  type: 'agree' | 'irrelevant' | 'follow-up';
  reactedAt: string; // ISO string
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string; // Plain text fallback / search index
  blocks: NoteContentBlock[];
  mood: MoodId | null;
  tags: string[];
  status: NoteStatus;
  isPinned: boolean;
  isSecret: boolean;
  isTimeCapsule: boolean;
  timeCapsuleUnlockAt: string | null; // ISO string
  isScheduled: boolean;
  scheduledAt: string | null; // ISO string
  language: string | null; // ISO 639-1 code
  texture: NoteTexture;
  fontWeight: NoteFontWeight;
  accentColor: string | null; // Override brand color for this note
  weather: WeatherSnapshot | null;
  location: NoteLocation | null;
  reaction: NoteReaction | null;
  linkedNoteIds: string[];
  highlights: NoteHighlight[];
  wordCount: number;
  // Lifecycle
  createdAt: string; // ISO string
  updatedAt: string;
  trashedAt: string | null;
  archivedAt: string | null;
  originalCreatedAt: string | null; // Preserved from imports
}

export interface NoteHighlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  createdAt: string;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  snapshot: Pick<Note, 'title' | 'content' | 'blocks'>;
  createdAt: string;
}

/** Lightweight note for list views — avoids loading full blocks */
export type NoteListItem = Pick<
  Note,
  | 'id'
  | 'title'
  | 'content'
  | 'mood'
  | 'tags'
  | 'status'
  | 'isPinned'
  | 'isSecret'
  | 'isTimeCapsule'
  | 'timeCapsuleUnlockAt'
  | 'wordCount'
  | 'linkedNoteIds'
  | 'texture'
  | 'fontWeight'
  | 'accentColor'
  | 'language'
  | 'createdAt'
  | 'updatedAt'
>;

export type CreateNoteInput = Omit<
  Note,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'wordCount'
>;

export type UpdateNoteInput = Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>;

export type NoteSort = 'updatedAt' | 'createdAt' | 'title' | 'wordCount';
export type NoteSortDirection = 'asc' | 'desc';

export interface NoteFilters {
  status?: NoteStatus;
  mood?: MoodId;
  tags?: string[];
  language?: string;
  search?: string;
  isPinned?: boolean;
  isSecret?: boolean;
  sort?: NoteSort;
  sortDirection?: NoteSortDirection;
}
