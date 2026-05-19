import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  collection,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err, normalizeDocument } from '@/lib/normalizer';
import type { ApiResult } from '@/types/api.types';
import type { NoteHighlight } from '@/types/note.types';

const COLLECTION = 'notes';

export interface HighlightWithNote {
  highlight: NoteHighlight;
  noteId: string;
  noteTitle: string;
  noteCreatedAt: string;
}

export async function addHighlight(
  noteId: string,
  userId: string,
  text: string,
  startOffset: number,
  endOffset: number
): Promise<ApiResult<NoteHighlight>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().userId !== userId) {
      return err('highlights/not-found', 'Catatan tidak ditemukan');
    }

    const existing: NoteHighlight[] = snap.data().highlights ?? [];

    // Prevent duplicate overlapping highlights
    const overlaps = existing.some(
      (h) => !(endOffset <= h.startOffset || startOffset >= h.endOffset)
    );
    if (overlaps) {
      return err('highlights/overlap', 'Highlight bertumpang tindih dengan yang sudah ada');
    }

    const newHighlight: NoteHighlight = {
      id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      text,
      startOffset,
      endOffset,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(ref, {
      highlights: [...existing, newHighlight],
      updatedAt: serverTimestamp(),
    });

    logger.info('highlights.add', { noteId, userId, highlightId: newHighlight.id });
    return ok(newHighlight);
  } catch (error) {
    logger.error('highlights.add.failed', { error, noteId });
    return err('highlights/add-failed', 'Gagal menambah highlight');
  }
}

export async function removeHighlight(
  noteId: string,
  userId: string,
  highlightId: string
): Promise<ApiResult<void>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().userId !== userId) {
      return err('highlights/not-found', 'Catatan tidak ditemukan');
    }

    const existing: NoteHighlight[] = snap.data().highlights ?? [];
    const updated = existing.filter((h) => h.id !== highlightId);

    await updateDoc(ref, {
      highlights: updated,
      updatedAt: serverTimestamp(),
    });

    logger.info('highlights.remove', { noteId, userId, highlightId });
    return ok(undefined);
  } catch (error) {
    logger.error('highlights.remove.failed', { error, noteId });
    return err('highlights/remove-failed', 'Gagal menghapus highlight');
  }
}

export async function getAllHighlights(
  userId: string
): Promise<ApiResult<HighlightWithNote[]>> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('updatedAt', 'desc')
    );

    const snap = await getDocs(q);
    const results: HighlightWithNote[] = [];

    for (const d of snap.docs) {
      const data = normalizeDocument(d.data());
      const highlights = (data.highlights as NoteHighlight[]) ?? [];
      if (highlights.length === 0) continue;

      for (const highlight of highlights) {
        results.push({
          highlight,
          noteId: d.id,
          noteTitle: (data.title as string) ?? 'Tanpa judul',
          noteCreatedAt: data.createdAt as string,
        });
      }
    }

    // Sort by highlight creation date desc
    results.sort((a, b) =>
      new Date(b.highlight.createdAt).getTime() -
      new Date(a.highlight.createdAt).getTime()
    );

    return ok(results);
  } catch (error) {
    logger.error('highlights.getAll.failed', { error, userId });
    return err('highlights/get-failed', 'Gagal memuat highlights');
  }
}
