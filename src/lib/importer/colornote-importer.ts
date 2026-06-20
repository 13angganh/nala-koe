/**
 * ColorNote JSON Importer — Phase 10
 *
 * ColorNote backup format: a JSON array of ColorNoteItem objects.
 * type 0 = text note, type 1 = checklist
 */

import type { Note, NoteContentBlock } from '@/types/note.types';
import type { ColorNoteItem, ImportResult } from '@/types/import-export.types';
import { nanoid } from 'nanoid';

// ColorNote uses integer color indices
const COLORNOTE_COLORS: Record<number, string> = {
  0: '#ef4444', // red
  1: '#f97316', // orange
  2: '#eab308', // yellow
  3: '#22c55e', // green
  4: '#3b82f6', // blue
  5: '#a855f7', // purple
  6: '#ec4899', // pink
  7: '#0ea5e9', // sky (default)
};

function colorNoteColor(colorIdx?: number): string {
  if (colorIdx === undefined || colorIdx === null) return '#0ea5e9';
  return COLORNOTE_COLORS[colorIdx] ?? '#0ea5e9';
}

function buildBlocksFromColorNote(item: ColorNoteItem): NoteContentBlock[] {
  if (item.type === 1 && item.note) {
    // Checklist — lines starting with tick chars or plain lines
    const lines = item.note.split('\n').filter((l) => l.trim());
    const checkItems = lines.map((l) => {
      const checked = l.startsWith('☑') || l.startsWith('[x]') || l.startsWith('✓');
      const text = l.replace(/^[☑☐✓\[\]x\s]+/, '').trim();
      return { id: nanoid(), text, isChecked: checked };
    });
    return [
      {
        id: nanoid(),
        type: 'checklist' as const,
        content: JSON.stringify(checkItems),
        order: 0,
      },
    ];
  }

  // Text note — split by double newline
  const text = item.note ?? '';
  if (!text.trim()) return [];
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return paragraphs.map((p, i) => ({
    id: nanoid(),
    type: 'paragraph' as const,
    content: p.trim(),
    order: i,
  }));
}

function colorNoteToNote(item: ColorNoteItem, userId: string): Note {
  const now = new Date().toISOString();
  // create_time / modify_time are Unix seconds
  const createdAt = item.create_time
    ? new Date(item.create_time * 1000).toISOString()
    : now;
  const updatedAt = item.modify_time
    ? new Date(item.modify_time * 1000).toISOString()
    : createdAt;

  const blocks = buildBlocksFromColorNote(item);
  const plainContent = item.note ?? '';
  const wordCount = plainContent.trim()
    ? plainContent.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return {
    id: nanoid(),
    userId,
    title: item.title ?? '',
    content: plainContent,
    contentFormat: 'plain',
    blocks,
    mood: null,
    tags: [],
    status: 'active',
    isPinned: false,
    isSecret: false,
    isTimeCapsule: false,
    timeCapsuleUnlockAt: null,
    isScheduled: false,
    scheduledAt: null,
    language: null,
    texture: 'plain',
    fontWeight: 'regular',
    accentColor: colorNoteColor(item.color),
    weather: null,
    location: null,
    reaction: null,
    linkedNoteIds: [],
    highlights: [],
    hiddenSections: [],
    wordCount,
    createdAt,
    updatedAt,
    trashedAt: null,
    archivedAt: null,
    originalCreatedAt: createdAt,
  };
}

export function parseColorNoteJson(
  rawJson: unknown,
  userId: string
): { notes: Note[]; result: ImportResult } {
  const errors: ImportResult['errors'] = [];
  const notes: Note[] = [];

  let items: unknown[] = [];

  if (Array.isArray(rawJson)) {
    items = rawJson;
  } else if (rawJson && typeof rawJson === 'object') {
    // Some ColorNote exports wrap notes in a key
    const obj = rawJson as Record<string, unknown>;
    const key = Object.keys(obj).find((k) => Array.isArray(obj[k]));
    if (key) {
      items = obj[key] as unknown[];
    } else {
      items = [rawJson];
    }
  } else {
    return {
      notes: [],
      result: { total: 0, imported: 0, skipped: 0, errors: [{ index: 0, reason: 'Format tidak dikenali' }] },
    };
  }

  items.forEach((item, idx) => {
    try {
      const cn = item as ColorNoteItem;
      if (!cn.note && !cn.title) {
        errors.push({ index: idx, reason: 'Catatan kosong, dilewati' });
        return;
      }
      notes.push(colorNoteToNote(cn, userId));
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
