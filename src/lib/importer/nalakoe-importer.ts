/**
 * NalaKoe JSON Backup Importer — Phase 10
 * Parses the full backup JSON exported by exportNotesAsJson()
 */

import type { Note } from '@/types/note.types';
import type { ImportResult } from '@/types/import-export.types';
import { nanoid } from 'nanoid';

interface NalakoeBackup {
  version: string;
  exportedAt: string;
  count: number;
  notes: Note[];
}

export function parseNalakoeJson(
  rawJson: unknown,
  userId: string
): { notes: Note[]; result: ImportResult } {
  const errors: ImportResult['errors'] = [];
  const notes: Note[] = [];

  let rawNotes: unknown[] = [];

  if (
    rawJson &&
    typeof rawJson === 'object' &&
    'notes' in (rawJson as object) &&
    Array.isArray((rawJson as NalakoeBackup).notes)
  ) {
    rawNotes = (rawJson as NalakoeBackup).notes;
  } else if (Array.isArray(rawJson)) {
    rawNotes = rawJson;
  } else {
    return {
      notes: [],
      result: {
        total: 0,
        imported: 0,
        skipped: 0,
        errors: [{ index: 0, reason: 'Format backup tidak dikenali' }],
      },
    };
  }

  rawNotes.forEach((item, idx) => {
    try {
      const n = item as Note;
      if (!n.title && !n.content) {
        errors.push({ index: idx, reason: 'Catatan kosong, dilewati' });
        return;
      }
      // Re-assign new ID and userId, preserve originalCreatedAt
      const imported: Note = {
        ...n,
        id: nanoid(),
        userId,
        originalCreatedAt: n.originalCreatedAt ?? n.createdAt,
      };
      notes.push(imported);
    } catch {
      errors.push({ index: idx, reason: `Parse error: ${String(e)}` });
    }
  });

  return {
    notes,
    result: {
      total: rawNotes.length,
      imported: notes.length,
      skipped: errors.length,
      errors,
    },
  };
}
