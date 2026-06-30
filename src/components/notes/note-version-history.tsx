'use client';

import { useState } from 'react';
import { History, RotateCcw, Eye, EyeOff, ChevronRight, Loader2, Clock } from 'lucide-react';
import { cn, stripHtml } from '@/lib/utils';
import { useVersionHistory, formatVersionLabel, diffText } from '@/hooks/use-version-history';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { NoteVersion } from '@/types/note.types';

// ─── Diff viewer ──────────────────────────────────────────────────────────────

function DiffViewer({
  currentContent,
  version,
}: {
  currentContent: string;
  version: NoteVersion;
}) {
  const diff = diffText(stripHtml(version.snapshot.content ?? ''), stripHtml(currentContent));

  const hasChanges = diff.some((l) => l.type !== 'unchanged');

  if (!hasChanges) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] italic px-1">
        Konten identik dengan versi ini.
      </p>
    );
  }

  return (
    <div
      className="rounded-md border border-[var(--border)] overflow-hidden max-h-48 overflow-y-auto font-mono text-xs leading-relaxed"
      role="region"
      aria-label="Perbandingan versi"
    >
      {diff.slice(0, 120).map((line, i) => {
        if (line.type === 'unchanged' && line.text.trim() === '') return null;
        return (
          <div
            key={i}
            className={cn(
              'px-2 py-0.5 whitespace-pre-wrap break-all',
              line.type === 'added' && 'bg-[var(--success)]/10 text-[var(--success)]',
              line.type === 'removed' && 'bg-[var(--error)]/10 text-[var(--error)] line-through',
              line.type === 'unchanged' && 'text-[var(--text-tertiary)]'
            )}
          >
            {line.type === 'added' && '+ '}
            {line.type === 'removed' && '- '}
            {line.text || ' '}
          </div>
        );
      })}
      {diff.length > 120 && (
        <div className="px-2 py-0.5 text-[var(--text-tertiary)]">
          ...{diff.length - 120} baris lagi
        </div>
      )}
    </div>
  );
}

// ─── Single version item ──────────────────────────────────────────────────────

function VersionItem({
  version,
  index,
  total,
  currentContent,
  onRestore,
  isRestoring,
}: {
  version: NoteVersion;
  index: number;
  total: number;
  currentContent: string;
  onRestore: (version: NoteVersion) => void;
  isRestoring: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);

  const label = formatVersionLabel(version);
  const isLatest = index === 0;

  return (
    <div
      className={cn(
        'border border-[var(--border)] rounded-lg overflow-hidden transition-colors',
        expanded && 'border-[var(--accent)]/30'
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-muted)] shrink-0">
          <Clock className="h-2.5 w-2.5 text-[var(--text-tertiary)]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-primary)] truncate">
            {label}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Versi {total - index} dari {total}
            {isLatest && (
              <span className="ml-1.5 text-[var(--accent)]">· terbaru</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
            aria-label={expanded ? 'Sembunyikan diff' : 'Lihat perbandingan'}
            aria-expanded={expanded}
          >
            {expanded ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setConfirmRestore(true)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            aria-label={`Pulihkan ke versi ${label}`}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Diff panel */}
      {expanded && (
        <div className="border-t border-[var(--border)] px-3 pb-3 pt-2 space-y-1.5 bg-[var(--surface-subtle)]">
          <p className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide">
            Perbandingan dengan saat ini
          </p>
          <DiffViewer currentContent={currentContent} version={version} />
        </div>
      )}

      <ConfirmDialog
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title={`Pulihkan versi ini?`}
        description={`Konten catatan akan diganti dengan versi dari ${label}. Versi saat ini akan disimpan sebagai entri baru di riwayat.`}
        confirmLabel="Pulihkan"
        onConfirm={() => {
          setConfirmRestore(false);
          onRestore(version);
        }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface NoteVersionHistoryProps {
  noteId: string;
  currentContent: string;
  className?: string;
}

export function NoteVersionHistory({
  noteId,
  currentContent,
  className,
}: NoteVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { versions, isLoading, isRestoring, restoreVersion } = useVersionHistory(noteId);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
        aria-expanded={isOpen}
        aria-controls="version-history-panel"
      >
        <div className="flex items-center gap-2">
          <History className="h-3.5 w-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
          <span className="font-medium">Riwayat Versi</span>
          {versions.length > 0 && (
            <span className="rounded-full bg-[var(--surface-muted)] px-1.5 py-0.5 text-xs text-[var(--text-tertiary)]">
              {versions.length}
            </span>
          )}
        </div>
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-200',
            isOpen && 'rotate-90'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <div id="version-history-panel" className="space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--text-tertiary)]" aria-label="Memuat riwayat..." />
            </div>
          )}

          {!isLoading && versions.length === 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-6 text-center">
              <History className="h-6 w-6 text-[var(--text-tertiary)] mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-[var(--text-tertiary)]">
                Belum ada riwayat versi.
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                Riwayat tersimpan otomatis setiap kali kamu menyimpan catatan.
              </p>
            </div>
          )}

          {!isLoading && versions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-tertiary)]">
                Maks. 10 versi disimpan. Versi lama dihapus otomatis.
              </p>
              {versions.map((v, i) => (
                <VersionItem
                  key={v.id}
                  version={v}
                  index={i}
                  total={versions.length}
                  currentContent={currentContent}
                  onRestore={restoreVersion}
                  isRestoring={isRestoring}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
