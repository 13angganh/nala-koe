/**
 * Google Keep JSON Importer — Phase 10
 *
 * Google Keep export format (via Google Takeout):
 * A folder with individual JSON files per note, each shaped like KeepNote.
 *
 * This parser accepts a single JSON file (user can upload one note file
 * or a combined array of notes).
 */

import type { Note, NoteContentBlock } from '@/types/note.types';
import type { KeepNote, ImportResult } from '@/types/import-export.types';
import { nanoid } from 'nanoid';

const KEEP_COLOR_TO_ACCENT: Record<string, string> = {
  RED: '#ef4444',
  ORANGE: '#f97316',
  YELLOW: '#eab308',
  GREEN: '#22c55e',
  TEAL: '#14b8a6',
  BLUE: '#3b82f6',
  CERULEAN: '#0ea5e9',
  PURPLE: '#a855f7',
  PINK: '#ec4899',
  DEFAULT: '#0ea5e9',
};

function keepColorToAccent(color?: string): string {
  if (!color) return '#0ea5e9';
  return KEEP_COLOR_TO_ACCENT[color.toUpperCase()] ?? '#0ea5e9';
}

function buildBlocks(keepNote: KeepNote): NoteContentBlock[] {
  const blocks: NoteContentBlock[] = [];

  if (keepNote.listContent && keepNote.listContent.length > 0) {
    const items = keepNote.listContent.map((item) => ({
      id: nanoid(),
      text: item.text,
      isChecked: item.isChecked,
    }));
    blocks.push({
      id: nanoid(),
      type: 'checklist',
      content: JSON.stringify(items),
      order: 0,
    });
  } else if (keepNote.textContent) {
    // Split by double newline into paragraphs
    const paragraphs = keepNote.textContent.split(/\n\n+/).filter(Boolean);
    paragraphs.forEach((p, i) => {
      blocks.push({
        id: nanoid(),
        type: 'paragraph',
        content: p.trim(),
        order: i,
      });
    });
    if (paragraphs.length === 0) {
      blocks.push({
        id: nanoid(),
        type: 'paragraph',
        content: keepNote.textContent.trim(),
        order: 0,
      });
    }
  }

  return blocks;
}

function keepNoteToNote(keepNote: KeepNote, userId: string): Note {
  const now = new Date().toISOString();
  const createdAt = keepNote.createdTimestampUsec
    ? new Date(keepNote.createdTimestampUsec / 1000).toISOString()
    : now;
  const updatedAt = keepNote.userEditedTimestampUsec
    ? new Date(keepNote.userEditedTimestampUsec / 1000).toISOString()
    : createdAt;

  const blocks = buildBlocks(keepNote);
  const plainContent =
    keepNote.textContent ??
    keepNote.listContent?.map((i) => i.text).join(' ') ??
    '';

  const wordCount = plainContent.trim()
    ? plainContent.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const status: Note['status'] = keepNote.isTrashed
    ? 'trashed'
    : keepNote.isArchived
    ? 'archived'
    : 'active';

  const tags: string[] = keepNote.labels?.map((l) => l.name.toLowerCase()) ?? [];

  return {
    id: nanoid(),
    userId,
    title: keepNote.title ?? '',
    content: plainContent,
    contentFormat: 'plain',
    blocks,
    mood: null,
    tags,
    status,
    isPinned: keepNote.isPinned ?? false,
    isSecret: false,
    isTimeCapsule: false,
    timeCapsuleUnlockAt: null,
    isScheduled: false,
    scheduledAt: null,
    language: null,
    texture: 'plain',
    fontWeight: 'regular',
    accentColor: keepColorToAccent(keepNote.color),
    weather: null,
    location: null,
    reaction: null,
    linkedNoteIds: [],
    highlights: [],
    wordCount,
    createdAt,
    updatedAt,
    trashedAt: keepNote.isTrashed ? updatedAt : null,
    archivedAt: keepNote.isArchived ? updatedAt : null,
    originalCreatedAt: createdAt,
  };
}

export function parseKeepJson(
  rawJson: unknown,
  userId: string
): { notes: Note[]; result: ImportResult } {
  const errors: ImportResult['errors'] = [];
  const notes: Note[] = [];

  let items: unknown[] = [];

  if (Array.isArray(rawJson)) {
    items = rawJson;
  } else if (rawJson && typeof rawJson === 'object') {
    // Single note
    items = [rawJson];
  } else {
    return {
      notes: [],
      result: { total: 0, imported: 0, skipped: 0, errors: [{ index: 0, reason: 'Format tidak dikenali' }] },
    };
  }

  items.forEach((item, idx) => {
    try {
      const keepNote = item as KeepNote;
      if (!keepNote.textContent && !keepNote.listContent && !keepNote.title) {
        errors.push({ index: idx, reason: 'Catatan kosong, dilewati' });
        return;
      }
      notes.push(keepNoteToNote(keepNote, userId));
    } catch (e) {
      errors.push({ index: idx, reason: `Parse error: ${String(e)}` });
    }
  });

  return {
    notes,
    result: {
      total: items.length,
      imported: notes.length,
      skipped: errors.length,
      errors,
    },
  };
}
