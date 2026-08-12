import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateNote } from '@/services/notes.service';

// We deliberately do NOT mock the whole notes.service module here — we want
// to exercise updateNote()'s real implementation, including its getDoc()
// ownership pre-check at the top (removed for non-content saves — see the
// fix comment in notes.service.ts). Only the Firestore SDK primitives it
// calls are mocked, so we can control exactly what getDoc() returns.
const mockGetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDoc = vi.fn(() => ({ id: 'note-1' }));
const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockCollection = vi.fn(() => ({}));
const mockQuery = vi.fn(() => ({}));

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    doc: (...args: unknown[]) => mockDoc(...args),
    getDoc: (...args: unknown[]) => mockGetDoc(...args),
    updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
    getDocs: (...args: unknown[]) => mockGetDocs(...args),
    addDoc: (...args: unknown[]) => mockAddDoc(...args),
    collection: (...args: unknown[]) => mockCollection(...args),
    query: (...args: unknown[]) => mockQuery(...args),
    serverTimestamp: () => 'SERVER_TIMESTAMP',
  };
});

vi.mock('@/lib/firebase', () => ({ db: {} }));

describe('updateNote() — getDoc() ownership pre-check dihapus untuk save non-content (fix untuk bug tag hilang)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDoc.mockResolvedValue(undefined);
    mockGetDocs.mockResolvedValue({ size: 0, docs: [] });
    mockAddDoc.mockResolvedValue({ id: 'version-1' });
  });

  it('kasus NORMAL: getDoc() mengembalikan dokumen LENGKAP dengan userId — updateDoc() harus terpanggil', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'note-1',
      data: () => ({
        userId: 'user-1',
        title: 'Judul',
        content: 'Isi',
        tags: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    });

    // touchesContent case (title present), so getDoc() IS still expected here.
    const result = await updateNote('note-1', 'user-1', { title: 'Judul Baru' });

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(result.error).toBeNull();
  });

  it('FIX: save TAG (non-content field) tidak lagi memanggil getDoc() sama sekali — celah partial-snapshot tertutup', async () => {
    // The actual fix: a tags-only save (touchesContent === false) no
    // longer calls getDoc() at all, so it can no longer be derailed by a
    // partial snapshot from some other in-flight write (the root cause of
    // the "type a tag, navigate away, tag is gone" report — see
    // notes.service.ts for the full writeup). mockGetDoc is intentionally
    // left rejecting to prove this path truly never touches it.
    mockGetDoc.mockRejectedValue(new Error('getDoc() should NOT be called for a tags-only save'));

    const result = await updateNote('note-1', 'user-1', { tags: ['kerja'] });

    expect(mockGetDoc).not.toHaveBeenCalled();
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(result.error).toBeNull();
  });

  it('REGRESSION GUARD: a getDoc() snapshot missing userId (the documented partial-snapshot failure mode) can no longer affect a tag save', async () => {
    // Same partial-snapshot shape as the original bug — proving it's
    // structurally irrelevant now, since getDoc() is never reached on this
    // path. If a future change reintroduces a getDoc() call on this path,
    // this test starts failing (mockGetDoc's data() has no userId field,
    // which is exactly the shape that caused the original bug).
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'note-1',
      data: () => ({ mood: 'senang' }), // userId deliberately absent
    });

    const result = await updateNote('note-1', 'user-1', { tags: ['kerja'] });

    expect(mockGetDoc).not.toHaveBeenCalled();
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(result.error).toBeNull();
  });

  it('REGRESSION GUARD: save CONTENT (title/content/blocks) masih memanggil getDoc() + saveVersion() seperti semula', async () => {
    // Ensures the refactor didn't accidentally break version history for
    // the case it's actually meant for.
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      id: 'note-1',
      data: () => ({
        userId: 'user-1',
        title: 'Judul Lama',
        content: 'Isi Lama',
        contentFormat: 'plain',
        blocks: [],
        tags: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        hiddenSections: [],
        wordCount: 2,
      }),
    });

    const result = await updateNote('note-1', 'user-1', { title: 'Judul Baru' });

    expect(mockGetDoc).toHaveBeenCalledTimes(1);
    expect(mockAddDoc).toHaveBeenCalledTimes(1); // saveVersion() still fires
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(result.error).toBeNull();
  });
});
