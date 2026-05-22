import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err, isOk, normalizeDocument } from '@/lib/normalizer';
import type { ApiResult } from '@/types/api.types';
import type { CanvasBoard, CanvasSticky } from '@/types/canvas.types';

const BOARDS_COLLECTION = 'canvas_boards';
const STICKIES_COLLECTION = 'canvas_stickies';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeBoard(id: string, data: Record<string, unknown>): CanvasBoard {
  const d = normalizeDocument(data);
  return {
    id,
    userId: (d.userId as string) ?? '',
    name: (d.name as string) ?? 'Board baru',
    stickies: [],
    viewportX: (d.viewportX as number) ?? 0,
    viewportY: (d.viewportY as number) ?? 0,
    zoom: (d.zoom as number) ?? 1,
    updatedAt: d.updatedAt as string,
  };
}

function normalizeSticky(id: string, data: Record<string, unknown>): CanvasSticky {
  const d = normalizeDocument(data);
  return {
    id,
    userId: (d.userId as string) ?? '',
    noteId: (d.noteId as string | null) ?? null,
    content: (d.content as string) ?? '',
    color: (d.color as string) ?? '#fef08a',
    x: (d.x as number) ?? 0,
    y: (d.y as number) ?? 0,
    width: (d.width as number) ?? 200,
    height: (d.height as number) ?? 160,
    rotation: (d.rotation as number) ?? 0,
    zIndex: (d.zIndex as number) ?? 1,
    createdAt: d.createdAt as string,
    updatedAt: d.updatedAt as string,
  };
}

// ─── Board CRUD ───────────────────────────────────────────────────────────────

export async function getOrCreateDefaultBoard(
  userId: string
): Promise<ApiResult<CanvasBoard | null>> {
  try {
    const q = query(
      collection(db, BOARDS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const boardDoc = snap.docs[0];
      if (!boardDoc) return ok(null);
      const board = normalizeBoard(boardDoc.id, boardDoc.data() as Record<string, unknown>);

      // Load stickies for this board
      const stickiesResult = await getBoardStickies(boardDoc.id, userId);
      if (isOk(stickiesResult)) {
        board.stickies = stickiesResult.data;
      }

      return ok(board);
    }

    // Create default board
    const ref = await addDoc(collection(db, BOARDS_COLLECTION), {
      userId,
      name: 'Board utama',
      viewportX: 0,
      viewportY: 0,
      zoom: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newBoard: CanvasBoard = {
      id: ref.id,
      userId,
      name: 'Board utama',
      stickies: [],
      viewportX: 0,
      viewportY: 0,
      zoom: 1,
      updatedAt: new Date().toISOString(),
    };

    logger.info('canvas.board.created', { userId, boardId: ref.id });
    return ok(newBoard);
  } catch (error) {
    logger.error('canvas.board.get-or-create.failed', { error, userId });
    return err('canvas/board-failed', 'Gagal memuat canvas board');
  }
}

export async function updateBoardViewport(
  boardId: string,
  userId: string,
  viewport: { viewportX: number; viewportY: number; zoom: number }
): Promise<ApiResult<void>> {
  try {
    await updateDoc(doc(db, BOARDS_COLLECTION, boardId), {
      ...viewport,
      updatedAt: serverTimestamp(),
    });
    return ok(undefined);
  } catch (error) {
    logger.error('canvas.board.viewport.failed', { error });
    return err('canvas/viewport-failed', 'Gagal menyimpan posisi canvas');
  }
}

// ─── Sticky CRUD ──────────────────────────────────────────────────────────────

export async function getBoardStickies(
  boardId: string,
  userId: string
): Promise<ApiResult<CanvasSticky[]>> {
  try {
    const q = query(
      collection(db, STICKIES_COLLECTION),
      where('boardId', '==', boardId),
      where('userId', '==', userId),
      orderBy('zIndex', 'asc')
    );
    const snap = await getDocs(q);
    const stickies = snap.docs.map((d) =>
      normalizeSticky(d.id, d.data() as Record<string, unknown>)
    );
    return ok(stickies);
  } catch (error) {
    logger.error('canvas.stickies.get.failed', { error });
    return err('canvas/stickies-failed', 'Gagal memuat sticky notes');
  }
}

export async function createSticky(
  boardId: string,
  userId: string,
  input: Partial<Omit<CanvasSticky, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<ApiResult<CanvasSticky>> {
  try {
    const now = new Date().toISOString();
    const payload = {
      boardId,
      userId,
      noteId: input.noteId ?? null,
      content: input.content ?? '',
      color: input.color ?? '#fef08a',
      x: input.x ?? 80,
      y: input.y ?? 80,
      width: input.width ?? 200,
      height: input.height ?? 160,
      rotation: input.rotation ?? 0,
      zIndex: input.zIndex ?? 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, STICKIES_COLLECTION), payload);
    logger.info('canvas.sticky.created', { boardId, userId });

    const sticky: CanvasSticky = {
      id: ref.id,
      userId,
      noteId: payload.noteId,
      content: payload.content,
      color: payload.color,
      x: payload.x,
      y: payload.y,
      width: payload.width,
      height: payload.height,
      rotation: payload.rotation,
      zIndex: payload.zIndex,
      createdAt: now,
      updatedAt: now,
    };
    return ok(sticky);
  } catch (error) {
    logger.error('canvas.sticky.create.failed', { error });
    return err('canvas/sticky-create-failed', 'Gagal membuat sticky note');
  }
}

export async function updateSticky(
  stickyId: string,
  updates: Partial<Omit<CanvasSticky, 'id' | 'userId' | 'createdAt'>>
): Promise<ApiResult<void>> {
  try {
    await updateDoc(doc(db, STICKIES_COLLECTION, stickyId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return ok(undefined);
  } catch (error) {
    logger.error('canvas.sticky.update.failed', { error });
    return err('canvas/sticky-update-failed', 'Gagal memperbarui sticky note');
  }
}

export async function deleteSticky(stickyId: string): Promise<ApiResult<void>> {
  try {
    await deleteDoc(doc(db, STICKIES_COLLECTION, stickyId));
    logger.info('canvas.sticky.deleted', { stickyId });
    return ok(undefined);
  } catch (error) {
    logger.error('canvas.sticky.delete.failed', { error });
    return err('canvas/sticky-delete-failed', 'Gagal menghapus sticky note');
  }
}

/** Batch-update positions for all stickies (after drag) */
export async function batchUpdateStickyPositions(
  updates: Array<{ id: string; x: number; y: number; zIndex: number }>
): Promise<ApiResult<void>> {
  try {
    const batch = writeBatch(db);
    for (const u of updates) {
      batch.update(doc(db, STICKIES_COLLECTION, u.id), {
        x: u.x,
        y: u.y,
        zIndex: u.zIndex,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    return ok(undefined);
  } catch (error) {
    logger.error('canvas.sticky.batch-update.failed', { error });
    return err('canvas/batch-failed', 'Gagal menyimpan posisi sticky notes');
  }
}
