'use client';

import { useState } from 'react';
import { GitMerge, Search, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { NoteListItem } from '@/types/note.types';

interface NoteMergeDialogProps {
  open: boolean;
  onClose: () => void;
  targetNote: NoteListItem;
  allNotes: NoteListItem[];
  onMerge: (targetId: string, sourceIds: string[]) => void;
  isMerging?: boolean;
}

export function NoteMergeDialog({
  open,
  onClose,
  targetNote,
  allNotes,
  onMerge,
  isMerging = false,
}: NoteMergeDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const candidates = allNotes.filter(
    (n) =>
      n.id !== targetNote.id &&
      n.status === 'active' &&
      (n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()))
  );

  function toggleNote(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleMergeClick() {
    if (selectedIds.length === 0) return;
    setShowConfirm(true);
  }

  function handleConfirmMerge() {
    onMerge(targetNote.id, selectedIds);
    setShowConfirm(false);
    setSelectedIds([]);
    onClose();
  }

  function handleClose() {
    setSelectedIds([]);
    setSearch('');
    onClose();
  }

  const selectedNotes = allNotes.filter((n) => selectedIds.includes(n.id));

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-[var(--accent)]" />
              Gabung Catatan
            </DialogTitle>
            <DialogDescription>
              Pilih catatan yang akan digabungkan ke{' '}
              <strong className="text-[var(--text-primary)]">
                &ldquo;{targetNote.title || 'Tanpa judul'}&rdquo;
              </strong>
              . Catatan sumber akan dipindahkan ke sampah.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            <Input
              placeholder="Cari catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm"
              autoFocus
            />
          </div>

          {/* Note list */}
          <div className="max-h-56 overflow-y-auto space-y-1 rounded-lg border border-[var(--border)] p-1">
            {candidates.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">
                Tidak ada catatan ditemukan
              </p>
            ) : (
              candidates.map((note) => {
                const isSelected = selectedIds.includes(note.id);
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => toggleNote(note.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm',
                      'transition-colors duration-[var(--duration-fast)]',
                      'hover:bg-[var(--surface-subtle)]',
                      isSelected && 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                    )}
                    aria-pressed={isSelected}
                  >
                    <CheckCircle2
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isSelected ? 'text-[var(--accent)]' : 'text-[var(--border)]'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {note.title || 'Tanpa judul'}
                      </p>
                      <p className="truncate text-[11px] text-[var(--text-tertiary)]">
                        {note.wordCount} kata
                        {note.tags.length > 0 && ` · ${note.tags.slice(0, 2).join(', ')}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected summary */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedNotes.map((n) => (
                <Badge
                  key={n.id}
                  variant="secondary"
                  className="gap-1 text-xs cursor-pointer"
                  onClick={() => toggleNote(n.id)}
                >
                  {n.title || 'Tanpa judul'}
                  <X className="h-2.5 w-2.5" />
                </Badge>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={handleClose} disabled={isMerging}>
              Batal
            </Button>
            <Button
              onClick={handleMergeClick}
              disabled={selectedIds.length === 0 || isMerging}
              isLoading={isMerging}
              className="gap-2"
            >
              <GitMerge className="h-4 w-4" />
              Gabungkan ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Konfirmasi Gabung Catatan"
        description={`Konten dari ${selectedIds.length} catatan akan ditambahkan ke "${targetNote.title || 'Tanpa judul'}". Catatan sumber akan dipindahkan ke sampah. Tindakan ini tidak bisa dibatalkan langsung.`}
        confirmLabel="Gabungkan"
        variant="destructive"
        onConfirm={handleConfirmMerge}
      />
    </>
  );
}
