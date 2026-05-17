export type ExportFormat = 'txt' | 'markdown' | 'pdf' | 'docx' | 'xlsx' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  includeMood: boolean;
  includeTags: boolean;
  noteIds?: string[]; // If empty, export all
}

export type ImportSource = 'google-keep' | 'colornote' | 'json';

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ index: number; reason: string }>;
}

/** Google Keep JSON export format */
export interface KeepNote {
  title?: string;
  textContent?: string;
  listContent?: Array<{ text: string; isChecked: boolean }>;
  color?: string;
  labels?: Array<{ name: string }>;
  isTrashed?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  createdTimestampUsec?: number;
  userEditedTimestampUsec?: number;
}

/** ColorNote JSON export format */
export interface ColorNoteItem {
  uuid?: string;
  title?: string;
  note?: string;
  color?: number;
  create_time?: number;
  modify_time?: number;
  type?: number; // 0=text, 1=checklist
}
