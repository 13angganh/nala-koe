'use client';

import {
  Pin,
  PinOff,
  Save,
  CheckSquare,
  SlidersHorizontal,
  Table2,
  Calculator,
  Link2,
  Type,
  Layers,
  ScanBarcode,
  Volume2,
  Timer,
  Lock,
  History,
  ThumbsUp,
  Highlighter,
  CalendarClock,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NoteWordCount } from './note-word-count';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NoteEditorToolbarProps {
  isPinned: boolean;
  isSaving: boolean;
  isDirty: boolean;
  wordCount: number;
  readingTimeMinutes: number;
  onTogglePin: () => void;
  onSave: () => void;
  onInsertChecklist: () => void;
  /** Phase 3 */
  onToggleMeta?: () => void;
  isMetaOpen?: boolean;
  /** Phase 4 – insert block callbacks */
  onInsertTable?: () => void;
  onInsertMath?: () => void;
  onInsertUrlPreview?: () => void;
  /** Phase 4 – panel toggles */
  onToggleFont?: () => void;
  isFontOpen?: boolean;
  onToggleTexture?: () => void;
  isTextureOpen?: boolean;
  onToggleLinkedNotes?: () => void;
  isLinkedNotesOpen?: boolean;
  onToggleBarcode?: () => void;
  isBarcodeOpen?: boolean;
  onToggleReadAloud?: () => void;
  isReadAloudOpen?: boolean;
  /** Phase 6 – panel toggles */
  onToggleTimeCapsule?: () => void;
  isTimeCapsuleOpen?: boolean;
  isTimeCapsuleActive?: boolean;
  onToggleSecret?: () => void;
  isSecretOpen?: boolean;
  isSecretActive?: boolean;
  onToggleVersionHistory?: () => void;
  isVersionHistoryOpen?: boolean;
  /** Phase 8 */
  onToggleReaction?: () => void;
  isReactionOpen?: boolean;
  isReactionActive?: boolean;
  onToggleHighlight?: () => void;
  isHighlightOpen?: boolean;
  /** Phase 9 */
  onToggleScheduled?: () => void;
  isScheduledOpen?: boolean;
  isScheduledActive?: boolean;
  /** Phase 11 */
  onShare?: () => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteEditorToolbar({
  isPinned,
  isSaving,
  isDirty,
  wordCount,
  readingTimeMinutes,
  onTogglePin,
  onSave,
  onInsertChecklist,
  onToggleMeta,
  isMetaOpen = false,
  onInsertTable,
  onInsertMath,
  onInsertUrlPreview,
  onToggleFont,
  isFontOpen = false,
  onToggleTexture,
  isTextureOpen = false,
  onToggleLinkedNotes,
  isLinkedNotesOpen = false,
  onToggleBarcode,
  isBarcodeOpen = false,
  onToggleReadAloud,
  isReadAloudOpen = false,
  onToggleTimeCapsule,
  isTimeCapsuleOpen = false,
  isTimeCapsuleActive = false,
  onToggleSecret,
  isSecretOpen = false,
  isSecretActive = false,
  onToggleVersionHistory,
  isVersionHistoryOpen = false,
  onToggleReaction,
  isReactionOpen = false,
  isReactionActive = false,
  onToggleHighlight,
  isHighlightOpen = false,
  onToggleScheduled,
  isScheduledOpen = false,
  isScheduledActive = false,
  onShare,
  className,
}: NoteEditorToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-3 py-2 border-b border-[var(--border)]',
        'bg-[var(--surface-subtle)] overflow-x-auto',
        className
      )}
      role="toolbar"
      aria-label="Toolbar editor"
    >
      {/* ── Pin ──────────────────────────────────────────────────────── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onTogglePin}
            aria-label={isPinned ? 'Lepas sematan' : 'Sematkan catatan'}
            aria-pressed={isPinned}
          >
            {isPinned ? (
              <PinOff className="h-4 w-4 text-[var(--accent)]" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isPinned ? 'Lepas sematan' : 'Sematkan'}</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 shrink-0" />

      {/* ── Insert blocks group ───────────────────────────────────────── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onInsertChecklist}
            aria-label="Tambah checklist"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Tambah checklist</TooltipContent>
      </Tooltip>

      {onInsertTable && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onInsertTable}
              aria-label="Tambah tabel"
            >
              <Table2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tambah tabel</TooltipContent>
        </Tooltip>
      )}

      {onInsertMath && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onInsertMath}
              aria-label="Tambah blok kalkulasi"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tambah kalkulasi</TooltipContent>
        </Tooltip>
      )}

      {onInsertUrlPreview && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onInsertUrlPreview}
              aria-label="Tambah pratinjau URL"
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tambah link preview</TooltipContent>
        </Tooltip>
      )}

      <Separator orientation="vertical" className="h-5 shrink-0" />

      {/* ── Appearance group ──────────────────────────────────────────── */}
      {onToggleFont && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleFont}
              aria-label="Gaya font"
              aria-pressed={isFontOpen}
              className={cn(isFontOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]')}
            >
              <Type className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Gaya font</TooltipContent>
        </Tooltip>
      )}

      {onToggleTexture && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleTexture}
              aria-label="Tekstur catatan"
              aria-pressed={isTextureOpen}
              className={cn(isTextureOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]')}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Tekstur catatan</TooltipContent>
        </Tooltip>
      )}

      <Separator orientation="vertical" className="h-5 shrink-0" />

      {/* ── Feature panels group ──────────────────────────────────────── */}
      {onToggleMeta && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleMeta}
              aria-label="Mood, tag & metadata"
              aria-pressed={isMetaOpen}
              className={cn(isMetaOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]')}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mood, tag & metadata</TooltipContent>
        </Tooltip>
      )}

      {onToggleLinkedNotes && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleLinkedNotes}
              aria-label="Catatan terhubung"
              aria-pressed={isLinkedNotesOpen}
              className={cn(isLinkedNotesOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]')}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Catatan terhubung</TooltipContent>
        </Tooltip>
      )}

      {onToggleBarcode && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleBarcode}
              aria-label="Pindai barcode"
              aria-pressed={isBarcodeOpen}
              className={cn(isBarcodeOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]')}
            >
              <ScanBarcode className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pindai barcode</TooltipContent>
        </Tooltip>
      )}

      {onToggleReadAloud && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleReadAloud}
              aria-label="Baca keras"
              aria-pressed={isReadAloudOpen}
              className={cn(isReadAloudOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]')}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Baca keras</TooltipContent>
        </Tooltip>
      )}

      {/* ── Phase 6 group ─────────────────────────────────────────────── */}
      {(onToggleTimeCapsule || onToggleSecret || onToggleVersionHistory) && (
        <Separator orientation="vertical" className="h-5 shrink-0" />
      )}

      {onToggleTimeCapsule && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleTimeCapsule}
              aria-label="Kapsul waktu"
              aria-pressed={isTimeCapsuleOpen}
              className={cn(
                (isTimeCapsuleOpen || isTimeCapsuleActive) &&
                  'text-[var(--accent)] bg-[var(--accent-subtle)]'
              )}
            >
              <Timer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isTimeCapsuleActive ? 'Kapsul waktu aktif' : 'Kapsul waktu'}
          </TooltipContent>
        </Tooltip>
      )}

      {onToggleSecret && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleSecret}
              aria-label="Catatan rahasia"
              aria-pressed={isSecretOpen}
              className={cn(
                (isSecretOpen || isSecretActive) &&
                  'text-[var(--accent)] bg-[var(--accent-subtle)]'
              )}
            >
              <Lock className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isSecretActive ? 'Terkunci (rahasia)' : 'Catatan rahasia'}
          </TooltipContent>
        </Tooltip>
      )}

      {onToggleVersionHistory && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleVersionHistory}
              aria-label="Riwayat versi"
              aria-pressed={isVersionHistoryOpen}
              className={cn(
                isVersionHistoryOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]'
              )}
            >
              <History className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Riwayat versi</TooltipContent>
        </Tooltip>
      )}

      {/* ── Phase 9 group ─────────────────────────────────────────────── */}
      {onToggleScheduled && (
        <Separator orientation="vertical" className="h-5 shrink-0" />
      )}

      {onToggleScheduled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleScheduled}
              aria-label="Jadwalkan catatan"
              aria-pressed={isScheduledOpen}
              className={cn(
                (isScheduledOpen || isScheduledActive) &&
                  'text-[var(--accent)] bg-[var(--accent-subtle)]'
              )}
            >
              <CalendarClock className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isScheduledActive ? 'Terjadwal aktif' : 'Jadwalkan catatan'}
          </TooltipContent>
        </Tooltip>
      )}

      {/* ── Phase 11: Share ───────────────────────────────────────── */}
      {onShare && (
        <>
          <Separator orientation="vertical" className="h-5 shrink-0" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onShare}
                aria-label="Bagikan catatan sebagai kartu"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bagikan sebagai kartu</TooltipContent>
          </Tooltip>
        </>
      )}

      {/* ── Spacer + status + save ───────────────────────────────────── */}
      <div className="flex-1 min-w-0" />

      <NoteWordCount
        wordCount={wordCount}
        readingTimeMinutes={readingTimeMinutes}
        className="mr-1 shrink-0 hidden sm:flex"
      />

      <div
        className="text-[10px] text-[var(--text-tertiary)] min-w-[60px] text-right shrink-0"
        aria-live="polite"
      >
        {isSaving ? (
          <span className="flex items-center gap-1 justify-end">
            <span
              className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse"
              aria-hidden="true"
            />
            Menyimpan…
          </span>
        ) : isDirty ? (
          'Belum tersimpan'
        ) : (
          'Tersimpan'
        )}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSave}
            isLoading={isSaving}
            disabled={!isDirty}
            aria-label="Simpan catatan"
          >
            <Save className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Simpan (⌘S)</TooltipContent>
      </Tooltip>
    </div>
  );
}
