'use client';

import { useState, useCallback, useEffect } from 'react';
import { Link2, Search, X, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { truncate } from '@/lib/utils';
import type { NoteListItem } from '@/types/note.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteLinkedNotesProps {
  /** IDs of linked notes for the current note */
  linkedNoteIds: string[];
  /** Current note ID — exclude from search results */
  currentNoteId: string;
  /** All notes available for linking (pre-filtered active/non-secret) */
  availableNotes: NoteListItem[];
  /** Whether the note list is loading */
  isLoadingNotes: boolean;
  onChange: (linkedNoteIds: string[]) => void;
  readOnly?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteLinkedNotes({
  linkedNoteIds,
  currentNoteId,
  availableNotes,
  isLoadingNotes,
  onChange,
  readOnly = false,
  className,
}: NoteLinkedNotesProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close picker on Escape
  useEffect(() => {
    if (!isPickerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsPickerOpen(false);
        setSearchQuery('');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPickerOpen]);

  const linkedNotes = availableNotes.filter((n) => linkedNoteIds.includes(n.id));

  const unlinkedNotes = availableNotes.filter(
    (n) =>
      n.id !== currentNoteId &&
      !linkedNoteIds.includes(n.id) &&
      (searchQuery === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLink = useCallback(
    (noteId: string) => {
      if (linkedNoteIds.includes(noteId)) return;
      onChange([...linkedNoteIds, noteId]);
    },
    [linkedNoteIds, onChange]
  );

  const handleUnlink = useCallback(
    (noteId: string) => {
      onChange(linkedNoteIds.filter((id) => id !== noteId));
    },
    [linkedNoteIds, onChange]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Catatan Terhubung
            {linkedNoteIds.length > 0 && (
              <span className="ml-1.5 text-[var(--text-tertiary)]">({linkedNoteIds.length})</span>
            )}
          </span>
        </div>
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPickerOpen((v) => !v)}
            className="h-6 text-xs gap-1"
            aria-expanded={isPickerOpen}
            aria-label="Tambah tautan catatan"
          >
            <Plus className="h-3 w-3" />
            Tautkan
          </Button>
        )}
      </div>

      {/* Linked note chips */}
      {linkedNotes.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Catatan terhubung">
          {linkedNotes.map((note) => (
            <div
              key={note.id}
              role="listitem"
              className={cn(
                'flex items-center gap-1.5 rounded-lg',
                'border border-[var(--border)] bg-[var(--surface-subtle)]',
                'px-2.5 py-1 text-xs text-[var(--text-primary)]',
                'max-w-[220px]'
              )}
            >
              <Link2 className="h-3 w-3 text-[var(--accent)] shrink-0" aria-hidden="true" />
              <span className="truncate flex-1 min-w-0">
                {truncate(note.title || 'Tanpa judul', 30)}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleUnlink(note.id)}
                  aria-label={`Hapus tautan ke ${note.title}`}
                  className={cn(
                    'shrink-0 text-[var(--text-tertiary)] hover:text-[var(--error)]',
                    'outline-none focus-visible:ring-1 focus-visible:ring-[var(--error)] rounded'
                  )}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {linkedNoteIds.length === 0 && !isPickerOpen && (
        <p className="text-[10px] text-[var(--text-tertiary)]">
          Belum ada catatan terhubung.
          {!readOnly && ' Klik "Tautkan" untuk menghubungkan catatan.'}
        </p>
      )}

      {/* Picker dropdown */}
      {isPickerOpen && !readOnly && (
        <div
          className={cn(
            'rounded-xl border border-[var(--border)] bg-[var(--surface-base)]',
            'shadow-lg overflow-hidden'
          )}
          role="dialog"
          aria-label="Pilih catatan untuk ditautkan"
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
            <Search className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari catatan…"
              aria-label="Cari catatan untuk ditautkan"
              autoFocus
              className={cn(
                'flex-1 bg-transparent text-sm text-[var(--text-primary)]',
                'placeholder:text-[var(--text-tertiary)]',
                'outline-none border-none focus:ring-0'
              )}
            />
            <button
              type="button"
              onClick={() => { setIsPickerOpen(false); setSearchQuery(''); }}
              aria-label="Tutup pencarian"
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] outline-none focus-visible:ring-1 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-48 overflow-y-auto" role="listbox" aria-label="Hasil pencarian catatan">
            {isLoadingNotes ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-[var(--text-tertiary)]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Memuat catatan…
              </div>
            ) : unlinkedNotes.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--text-tertiary)]">
                {searchQuery ? 'Tidak ada catatan cocok' : 'Semua catatan sudah terhubung'}
              </div>
            ) : (
              unlinkedNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    handleLink(note.id);
                    setSearchQuery('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5',
                    'text-left text-sm hover:bg-[var(--surface-subtle)]',
                    'transition-colors outline-none focus-visible:bg-[var(--surface-subtle)]',
                    'border-b border-[var(--border)] last:border-0'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary)] truncate font-medium text-xs">
                      {note.title || 'Tanpa judul'}
                    </p>
                    {note.content && (
                      <p className="text-[var(--text-tertiary)] truncate text-[10px] mt-0.5">
                        {truncate(note.content, 60)}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" aria-hidden="true" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
