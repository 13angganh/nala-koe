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
  /**
   * When true, this block's content is preserved but collapsed out of the
   * note's visible layout — used to shorten long notes without deleting
   * data. Toggled via the block's own "Sembunyikan"/"Tampilkan" action.
   * Defaults to false (visible) for all existing blocks via ?? false reads.
   */
  isHidden?: boolean;
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

/**
 * Identifies a note "section" — a metadata feature whose data lives at the
 * top level of a Note (as opposed to a content block, which has its own
 * per-block isHidden flag). Used by `hiddenSections` to let the user
 * collapse a section's display in the note without deleting its data, e.g.
 * keep the mood/tags/weather/location set but hide them from the long note
 * view when the note is getting visually cluttered.
 */
export type NoteSectionKey =
  | 'mood'
  | 'tags'
  | 'weather'
  | 'location'
  | 'linkedNotes'
  | 'reaction'
  | 'highlights';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string; // Plain text, OR sanitized HTML when contentFormat === 'html'
  /**
   * 'plain' (default): content is rendered/edited as plain text, exactly as
   * every note worked before rich formatting existed — zero behavior change.
   * 'html': content holds sanitized HTML (p/strong/em/u + text-align) and is
   * edited via the rich text editor. A note is upgraded the moment the user
   * applies their first inline format or alignment; it never auto-downgrades.
   */
  contentFormat: 'plain' | 'html';
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
  /**
   * Section keys currently collapsed from view in this note (data is kept,
   * only the visual display is hidden). See NoteSectionKey.
   */
  hiddenSections: NoteSectionKey[];
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
