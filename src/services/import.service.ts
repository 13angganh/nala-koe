/**
 * Import Service — Phase 10
 * Batch-writes parsed notes to Firestore.
 * Uses chunks of 499 to stay under Firestore batch limit (500).
 */

import {
  collection,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Note } from '@/types/note.types';
import type { ImportResult } from '@/types/import-export.types';

const BATCH_SIZE = 499;
const COLLECTION = 'notes';

export async function importNotesToFirestore(
  notes: Note[],
  userId: string
): Promise<ImportResult> {
  const errors: ImportResult['errors'] = [];
  let imported = 0;

  // Split into chunks
  const chunks: Note[][] = [];
  for (let i = 0; i < notes.length; i += BATCH_SIZE) {
    chunks.push(notes.slice(i, i + BATCH_SIZE));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((note) => {
      const ref = doc(collection(db, COLLECTION));
      batch.set(ref, {
        ...note,
        id: ref.id,
        userId,
        createdAt: note.createdAt,
        updatedAt: new Date().toISOString(),
        originalCreatedAt: note.originalCreatedAt ?? note.createdAt,
      });
    });

    try {
      await batch.commit();
      imported += chunk.length;
    } catch (e) {
      logger.error('[import] Batch commit failed', e);
      const firstNote = chunk[0];
      const startIdx = firstNote ? notes.indexOf(firstNote) : -1;
      chunk.forEach((_, i) => {
        errors.push({ index: startIdx + i, reason: 'Gagal simpan ke database' });
      });
    }
  }

  return {
    total: notes.length,
    imported,
    skipped: errors.length,
    errors,
  };
}
