import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err } from '@/lib/normalizer';
import type { ApiResult } from '@/types/api.types';
import type { NoteReaction } from '@/types/note.types';

const COLLECTION = 'notes';

export async function setNoteReaction(
  noteId: string,
  userId: string,
  reactionType: NoteReaction['type'] | null
): Promise<ApiResult<void>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().userId !== userId) {
      return err('reactions/not-found', 'Catatan tidak ditemukan');
    }

    const reaction: NoteReaction | null =
      reactionType === null
        ? null
        : { type: reactionType, reactedAt: new Date().toISOString() };

    await updateDoc(ref, {
      reaction,
      updatedAt: serverTimestamp(),
    });

    logger.info('reactions.set', { noteId, userId, reactionType });
    return ok(undefined);
  } catch (error) {
    logger.error('reactions.set.failed', { error, noteId });
    return err('reactions/set-failed', 'Gagal menyimpan reaksi');
  }
}

export async function clearNoteReaction(
  noteId: string,
  userId: string
): Promise<ApiResult<void>> {
  return setNoteReaction(noteId, userId, null);
}
