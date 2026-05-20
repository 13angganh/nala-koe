import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ok, err, normalizeDocument } from '@/lib/normalizer';
import { analyzeContent } from '@/lib/reading-time';
import type { ApiResult } from '@/types/api.types';
import type {
  Note,
  NoteListItem,
  CreateNoteInput,
  UpdateNoteInput,
  NoteFilters,
  NoteVersion,
} from '@/types/note.types';
import { CONFIG } from '@/constants/config';

const COLLECTION = 'notes';
const VERSIONS_SUBCOLLECTION = 'versions';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toNoteListItem(data: Note): NoteListItem {
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    mood: data.mood,
    tags: data.tags,
    status: data.status,
    isPinned: data.isPinned,
    isSecret: data.isSecret,
    isTimeCapsule: data.isTimeCapsule,
    timeCapsuleUnlockAt: data.timeCapsuleUnlockAt,
    wordCount: data.wordCount,
    linkedNoteIds: data.linkedNoteIds,
    texture: data.texture,
    fontWeight: data.fontWeight,
    accentColor: data.accentColor,
    language: data.language,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function normalizeNote(id: string, data: Record<string, unknown>): Note {
  const normalized = normalizeDocument(data);
  return {
    id,
    userId: (normalized.userId as string) ?? '',
    title: (normalized.title as string) ?? '',
    content: (normalized.content as string) ?? '',
    blocks: (normalized.blocks as Note['blocks']) ?? [],
    mood: (normalized.mood as Note['mood']) ?? null,
    tags: (normalized.tags as string[]) ?? [],
    status: (normalized.status as Note['status']) ?? 'active',
    isPinned: (normalized.isPinned as boolean) ?? false,
    isSecret: (normalized.isSecret as boolean) ?? false,
    isTimeCapsule: (normalized.isTimeCapsule as boolean) ?? false,
    timeCapsuleUnlockAt: (normalized.timeCapsuleUnlockAt as string | null) ?? null,
    isScheduled: (normalized.isScheduled as boolean) ?? false,
    scheduledAt: (normalized.scheduledAt as string | null) ?? null,
    language: (normalized.language as string | null) ?? null,
    texture: (normalized.texture as Note['texture']) ?? 'plain',
    fontWeight: (normalized.fontWeight as Note['fontWeight']) ?? 'regular',
    accentColor: (normalized.accentColor as string | null) ?? null,
    weather: (normalized.weather as Note['weather']) ?? null,
    location: (normalized.location as Note['location']) ?? null,
    reaction: (normalized.reaction as Note['reaction']) ?? null,
    linkedNoteIds: (normalized.linkedNoteIds as string[]) ?? [],
    highlights: (normalized.highlights as Note['highlights']) ?? [],
    wordCount: (normalized.wordCount as number) ?? 0,
    createdAt: normalized.createdAt as string,
    updatedAt: normalized.updatedAt as string,
    trashedAt: (normalized.trashedAt as string | null) ?? null,
    archivedAt: (normalized.archivedAt as string | null) ?? null,
    originalCreatedAt: (normalized.originalCreatedAt as string | null) ?? null,
  };
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function createNote(
  userId: string,
  input: Partial<CreateNoteInput>
): Promise<ApiResult<Note>> {
  try {
    const { wordCount } = analyzeContent(input.content ?? '');
    const now = new Date().toISOString();

    const payload = {
      userId,
      title: input.title ?? '',
      content: input.content ?? '',
      blocks: input.blocks ?? [],
      mood: input.mood ?? null,
      tags: input.tags ?? [],
      status: input.status ?? 'active',
      isPinned: input.isPinned ?? false,
      isSecret: input.isSecret ?? false,
      isTimeCapsule: input.isTimeCapsule ?? false,
      timeCapsuleUnlockAt: input.timeCapsuleUnlockAt ?? null,
      isScheduled: input.isScheduled ?? false,
      scheduledAt: input.scheduledAt ?? null,
      language: input.language ?? null,
      texture: input.texture ?? 'plain',
      fontWeight: input.fontWeight ?? 'regular',
      accentColor: input.accentColor ?? null,
      weather: input.weather ?? null,
      location: input.location ?? null,
      reaction: null,
      linkedNoteIds: input.linkedNoteIds ?? [],
      highlights: [],
      wordCount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      trashedAt: null,
      archivedAt: null,
      originalCreatedAt: input.originalCreatedAt ?? null,
    };

    const ref = await addDoc(collection(db, COLLECTION), payload);
    logger.info('notes.create', { id: ref.id, userId });

    const note: Note = {
      id: ref.id,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    return ok(note);
  } catch (error) {
    logger.error('notes.create.failed', { error });
    return err('notes/create-failed', 'Gagal membuat catatan');
  }
}

export async function getNoteById(
  noteId: string,
  userId: string
): Promise<ApiResult<Note>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return err('notes/not-found', 'Catatan tidak ditemukan');
    }

    const data = snap.data() as Record<string, unknown>;
    if (data.userId !== userId) {
      return err('notes/forbidden', 'Tidak diizinkan mengakses catatan ini');
    }

    return ok(normalizeNote(snap.id, data));
  } catch (error) {
    logger.error('notes.get.failed', { error, noteId });
    return err('notes/get-failed', 'Gagal memuat catatan');
  }
}

export async function getNotes(
  userId: string,
  filters: NoteFilters = {}
): Promise<ApiResult<NoteListItem[]>> {
  try {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('status', '==', filters.status ?? 'active'),
    ];

    if (filters.mood) constraints.push(where('mood', '==', filters.mood));
    if (filters.isPinned !== undefined)
      constraints.push(where('isPinned', '==', filters.isPinned));

    const sortField = filters.sort ?? 'updatedAt';
    const sortDir = filters.sortDirection ?? 'desc';
    constraints.push(orderBy('isPinned', 'desc'));
    constraints.push(orderBy(sortField, sortDir));
    constraints.push(limit(CONFIG.NOTES_PER_PAGE));

    const q = query(collection(db, COLLECTION), ...constraints);
    const snap = await getDocs(q);

    let notes = snap.docs.map((d) =>
      toNoteListItem(normalizeNote(d.id, d.data() as Record<string, unknown>))
    );

    // Client-side search filter (Firestore full-text not supported natively)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.content.toLowerCase().includes(term)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      notes = notes.filter((n) =>
        filters.tags.some((t) => n.tags.includes(t))
      );
    }

    return ok(notes);
  } catch (error) {
    logger.error('notes.list.failed', { error, userId });
    return err('notes/list-failed', 'Gagal memuat daftar catatan');
  }
}

export async function updateNote(
  noteId: string,
  userId: string,
  input: UpdateNoteInput
): Promise<ApiResult<void>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().userId !== userId) {
      return err('notes/not-found', 'Catatan tidak ditemukan');
    }

    // Save version snapshot before update
    const existing = normalizeNote(snap.id, snap.data() as Record<string, unknown>);
    await saveVersion(noteId, existing);

    const updates: Record<string, unknown> = {
      ...input,
      updatedAt: serverTimestamp(),
    };

    if (input.content !== undefined) {
      const { wordCount } = analyzeContent(input.content);
      updates.wordCount = wordCount;
    }

    await updateDoc(ref, updates);
    logger.info('notes.update', { noteId, userId });
    return ok(undefined);
  } catch (error) {
    logger.error('notes.update.failed', { error, noteId });
    return err('notes/update-failed', 'Gagal memperbarui catatan');
  }
}

export async function deleteNote(
  noteId: string,
  userId: string
): Promise<ApiResult<void>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().userId !== userId) {
      return err('notes/not-found', 'Catatan tidak ditemukan');
    }

    await deleteDoc(ref);
    logger.info('notes.delete', { noteId, userId });
    return ok(undefined);
  } catch (error) {
    logger.error('notes.delete.failed', { error, noteId });
    return err('notes/delete-failed', 'Gagal menghapus catatan');
  }
}

export async function trashNote(
  noteId: string,
  userId: string
): Promise<ApiResult<void>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().userId !== userId) {
      return err('notes/not-found', 'Catatan tidak ditemukan');
    }
    await updateDoc(ref, {
      status: 'trashed',
      trashedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('notes.trash', { noteId, userId });
    return ok(undefined);
  } catch (error) {
    logger.error('notes.trash.failed', { error });
    return err('notes/trash-failed', 'Gagal memindahkan ke sampah');
  }
}

export async function restoreNote(
  noteId: string,
  userId: string
): Promise<ApiResult<void>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().userId !== userId) {
      return err('notes/not-found', 'Catatan tidak ditemukan');
    }
    await updateDoc(ref, {
      status: 'active',
      trashedAt: null,
      archivedAt: null,
      updatedAt: serverTimestamp(),
    });
    logger.info('notes.restore', { noteId, userId });
    return ok(undefined);
  } catch (error) {
    logger.error('notes.restore.failed', { error });
    return err('notes/restore-failed', 'Gagal memulihkan catatan');
  }
}

export async function archiveNote(
  noteId: string,
  userId: string
): Promise<ApiResult<void>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().userId !== userId) {
      return err('notes/not-found', 'Catatan tidak ditemukan');
    }
    await updateDoc(ref, {
      status: 'archived',
      archivedAt: serverTimestamp(),
      trashedAt: null,
      updatedAt: serverTimestamp(),
    });
    logger.info('notes.archive', { noteId, userId });
    return ok(undefined);
  } catch (error) {
    logger.error('notes.archive.failed', { error });
    return err('notes/archive-failed', 'Gagal mengarsipkan catatan');
  }
}

export async function duplicateNote(
  noteId: string,
  userId: string
): Promise<ApiResult<Note>> {
  try {
    const ref = doc(db, COLLECTION, noteId);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().userId !== userId) {
      return err('notes/not-found', 'Catatan tidak ditemukan');
    }
    const original = normalizeNote(snap.id, snap.data() as Record<string, unknown>);
    const now = new Date().toISOString();
    const payload = {
      userId,
      title: `${original.title} (Salinan)`,
      content: original.content,
      blocks: original.blocks.map((b) => ({ ...b, id: `${b.id}_copy` })),
      mood: original.mood,
      tags: original.tags,
      status: 'active' as const,
      isPinned: false,
      isSecret: false,
      isTimeCapsule: false,
      timeCapsuleUnlockAt: null,
      isScheduled: false,
      scheduledAt: null,
      language: original.language,
      texture: original.texture,
      fontWeight: original.fontWeight,
      accentColor: original.accentColor,
      weather: null,
      location: null,
      reaction: null,
      linkedNoteIds: [],
      highlights: [],
      wordCount: original.wordCount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      trashedAt: null,
      archivedAt: null,
      originalCreatedAt: null,
    };
    const newRef = await addDoc(collection(db, COLLECTION), payload);
    logger.info('notes.duplicate', { noteId, newId: newRef.id, userId });
    const note: Note = { id: newRef.id, ...payload, createdAt: now, updatedAt: now };
    return ok(note);
  } catch (error) {
    logger.error('notes.duplicate.failed', { error });
    return err('notes/duplicate-failed', 'Gagal menduplikat catatan');
  }
}

export async function mergeNotes(
  targetNoteId: string,
  sourceNoteIds: string[],
  userId: string
): Promise<ApiResult<void>> {
  try {
    // Load target
    const targetRef = doc(db, COLLECTION, targetNoteId);
    const targetSnap = await getDoc(targetRef);
    if (!targetSnap.exists() || targetSnap.data().userId !== userId) {
      return err('notes/not-found', 'Catatan tujuan tidak ditemukan');
    }
    const target = normalizeNote(targetSnap.id, targetSnap.data() as Record<string, unknown>);

    let mergedContent = target.content;
    const mergedBlocks = [...target.blocks];

    for (const srcId of sourceNoteIds) {
      const srcRef = doc(db, COLLECTION, srcId);
      const srcSnap = await getDoc(srcRef);
      if (!srcSnap.exists() || srcSnap.data().userId !== userId) continue;
      const src = normalizeNote(srcSnap.id, srcSnap.data() as Record<string, unknown>);
      mergedContent += `\n\n---\n\n${src.content}`;
      const offsetOrder = mergedBlocks.length;
      src.blocks.forEach((b, i) => {
        mergedBlocks.push({ ...b, id: `${b.id}_merged`, order: offsetOrder + i });
      });
    }

    const { wordCount } = analyzeContent(mergedContent);
    await updateDoc(targetRef, {
      content: mergedContent,
      blocks: mergedBlocks,
      wordCount,
      updatedAt: serverTimestamp(),
    });

    // Trash source notes
    for (const srcId of sourceNoteIds) {
      const srcRef = doc(db, COLLECTION, srcId);
      await updateDoc(srcRef, {
        status: 'trashed',
        trashedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(() => null);
    }

    logger.info('notes.merge', { targetNoteId, sourceNoteIds, userId });
    return ok(undefined);
  } catch (error) {
    logger.error('notes.merge.failed', { error });
    return err('notes/merge-failed', 'Gagal menggabungkan catatan');
  }
}

/** Returns estimated byte size breakdown for a note */
export function getNoteSizeInfo(note: Note): {
  totalBytes: number;
  textBytes: number;
  hasImages: boolean;
  hasAudio: boolean;
  label: 'small' | 'medium' | 'large';
} {
  const textBytes = new TextEncoder().encode(
    note.title + note.content + JSON.stringify(note.blocks)
  ).length;
  const hasImages = note.blocks.some((b) => b.type === 'image');
  const hasAudio = note.blocks.some((b) => b.type === 'audio');
  // Rough estimate — images ~100KB, audio ~500KB each if present
  const mediaEstimate = (hasImages ? 100_000 : 0) + (hasAudio ? 500_000 : 0);
  const totalBytes = textBytes + mediaEstimate;
  const label =
    totalBytes > 200_000 ? 'large' : totalBytes > 20_000 ? 'medium' : 'small';
  return { totalBytes, textBytes, hasImages, hasAudio, label };
}

export async function getRecentNotes(
  userId: string,
  count = 5
): Promise<ApiResult<NoteListItem[]>> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('updatedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    const notes = snap.docs.map((d) =>
      toNoteListItem(normalizeNote(d.id, d.data() as Record<string, unknown>))
    );
    return ok(notes);
  } catch (error) {
    logger.error('notes.recent.failed', { error });
    return err('notes/recent-failed', 'Gagal memuat catatan terbaru');
  }
}

// ─── Version History ─────────────────────────────────────────────────────────

async function saveVersion(noteId: string, note: Note): Promise<void> {
  try {
    const versionsRef = collection(db, COLLECTION, noteId, VERSIONS_SUBCOLLECTION);
    const existing = await getDocs(query(versionsRef, orderBy('createdAt', 'asc')));

    // Remove oldest if over limit
    if (existing.size >= CONFIG.MAX_VERSION_HISTORY) {
      const oldest = existing.docs[0];
      if (oldest) await deleteDoc(oldest.ref);
    }

    await addDoc(versionsRef, {
      noteId,
      snapshot: { title: note.title, content: note.content, blocks: note.blocks },
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Version saving is non-critical
    logger.warn('notes.version.save.failed', { error, noteId });
  }
}

export async function getNoteVersions(
  noteId: string
): Promise<ApiResult<NoteVersion[]>> {
  try {
    const versionsRef = collection(db, COLLECTION, noteId, VERSIONS_SUBCOLLECTION);
    // limit ke MAX_VERSION_HISTORY — jumlah versi tidak akan melebihi ini karena
    // saveVersion() sudah enforcing batas yang sama saat write.
    const q = query(versionsRef, orderBy('createdAt', 'desc'), limit(CONFIG.MAX_VERSION_HISTORY));
    const snap = await getDocs(q);

    const versions: NoteVersion[] = snap.docs.map((d) => {
      const data = d.data();
      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : String(data.createdAt);
      return {
        id: d.id,
        noteId: data.noteId as string,
        snapshot: data.snapshot as NoteVersion['snapshot'],
        createdAt,
      };
    });

    return ok(versions);
  } catch (error) {
    logger.error('notes.versions.failed', { error });
    return err('notes/versions-failed', 'Gagal memuat riwayat versi');
  }
}
