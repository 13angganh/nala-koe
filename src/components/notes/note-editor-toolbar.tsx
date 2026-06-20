'use client';

import { memo } from 'react';
import {
  Pin, PinOff, Save, CheckSquare, SlidersHorizontal, Table2,
  Calculator, Link2, Type, Layers, ScanBarcode, Volume2,
  Timer, Lock, History, CalendarClock, Share2, MoreHorizontal,
  Smile, Highlighter, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { NoteWordCount } from './note-word-count';

export interface NoteEditorToolbarProps {
  isPinned: boolean;
  isSaving: boolean;
  isDirty: boolean;
  wordCount: number;
  readingTimeMinutes: number;
  onTogglePin: () => void;
  onSave: () => void;
  onInsertChecklist: () => void;
  onToggleMeta?: () => void;
  isMetaOpen?: boolean;
  onInsertTable?: () => void;
  onInsertMath?: () => void;
  onInsertUrlPreview?: () => void;
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
  isTimeCapsuleActive?: boolean;
  onToggleTimeCapsule?: () => void;
  isTimeCapsuleOpen?: boolean;
  isSecretActive?: boolean;
  onToggleSecret?: () => void;
  isSecretOpen?: boolean;
  onToggleVersionHistory?: () => void;
  isVersionHistoryOpen?: boolean;
  onToggleReaction: () => void;
  isReactionOpen?: boolean;
  isReactionActive?: boolean;
  onToggleHighlight: () => void;
  isHighlightOpen?: boolean;
  onToggleScheduled?: () => void;
  isScheduledOpen?: boolean;
  isScheduledActive?: boolean;
  onShare?: () => void;
  className?: string;
}

function ToolBtn({
  onClick, label, active, children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={label}
          {...(active !== undefined ? { 'aria-pressed': active } : {})}
          className={cn(
            'h-9 w-9 rounded-lg shrink-0',
            active === true && 'text-[var(--accent)] bg-[var(--accent-subtle)]'
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** One row of the "Lainnya" menu: icon + full text label + optional "Aktif" check. */
function MoreItem({
  onClick, icon: Icon, label, active,
}: {
  onClick: () => void;
  icon: typeof Table2;
  label: string;
  active?: boolean;
}) {
  return (
    <DropdownMenuItem onClick={onClick}>
      <Icon className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {active && <Check className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />}
    </DropdownMenuItem>
  );
}

function NoteEditorToolbarImpl({
  isPinned, isSaving, isDirty, wordCount, readingTimeMinutes,
  onTogglePin, onSave, onInsertChecklist,
  onToggleMeta, isMetaOpen = false,
  onInsertTable, onInsertMath, onInsertUrlPreview,
  onToggleFont, isFontOpen = false,
  onToggleTexture, isTextureOpen = false,
  onToggleLinkedNotes, isLinkedNotesOpen = false,
  onToggleBarcode, isBarcodeOpen = false,
  onToggleReadAloud, isReadAloudOpen = false,
  isTimeCapsuleActive, onToggleTimeCapsule, isTimeCapsuleOpen = false,
  isSecretActive, onToggleSecret, isSecretOpen = false,
  onToggleVersionHistory, isVersionHistoryOpen = false,
  onToggleReaction,
  isReactionOpen = false,
  isReactionActive = false,
  onToggleHighlight,
  isHighlightOpen = false,
  onToggleScheduled, isScheduledOpen = false, isScheduledActive,
  onShare, className,
}: NoteEditorToolbarProps) {
  const anyMoreItemOpen = [
    isFontOpen, isTextureOpen, isLinkedNotesOpen, isBarcodeOpen, isReadAloudOpen,
    isTimeCapsuleOpen, isSecretOpen, isVersionHistoryOpen, isReactionOpen,
    isHighlightOpen, isScheduledOpen,
  ].some(Boolean);

  return (
    <div
      className={cn(
        'flex flex-col border-b border-[var(--border)] bg-[var(--surface-subtle)]',
        className
      )}
      role="toolbar"
      aria-label="Toolbar editor"
    >
      {/* ── Baris utama: aksi yang sering dipakai + status simpan ───────── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border)]/50 overflow-x-auto">
        <ToolBtn onClick={onTogglePin} label={isPinned ? 'Lepas sematan' : 'Sematkan'} active={isPinned}>
          {isPinned
            ? <PinOff className="h-4.5 w-4.5 text-[var(--accent)]" />
            : <Pin className="h-4.5 w-4.5" />}
        </ToolBtn>

        <div className="w-px h-5 bg-[var(--border)] mx-1 shrink-0" />

        <ToolBtn onClick={onInsertChecklist} label="Tambah checklist">
          <CheckSquare className="h-4.5 w-4.5" />
        </ToolBtn>

        {onToggleMeta && (
          <ToolBtn onClick={onToggleMeta} label="Mood & tag" active={isMetaOpen}>
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </ToolBtn>
        )}

        {/* ── "Lainnya" — semua aksi sekunder, berlabel teks penuh ──────── */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Lainnya"
                  aria-pressed={anyMoreItemOpen}
                  className={cn(
                    'h-9 w-9 rounded-lg shrink-0',
                    anyMoreItemOpen && 'text-[var(--accent)] bg-[var(--accent-subtle)]'
                  )}
                >
                  <MoreHorizontal className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Lainnya</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start" className="w-64 p-0">
            <div className="max-h-[60vh] overflow-y-auto p-1">
              {(onInsertTable || onInsertMath || onInsertUrlPreview) && (
                <>
                  <DropdownMenuLabel>Sisipkan</DropdownMenuLabel>
                  {onInsertTable && <MoreItem onClick={onInsertTable} icon={Table2} label="Tabel" />}
                  {onInsertMath && <MoreItem onClick={onInsertMath} icon={Calculator} label="Kalkulasi" />}
                  {onInsertUrlPreview && <MoreItem onClick={onInsertUrlPreview} icon={Link2} label="Link preview" />}
                  <DropdownMenuSeparator />
                </>
              )}

              {(onToggleFont || onToggleTexture) && (
                <>
                  <DropdownMenuLabel>Tampilan</DropdownMenuLabel>
                  {onToggleFont && <MoreItem onClick={onToggleFont} icon={Type} label="Gaya font" active={isFontOpen} />}
                  {onToggleTexture && <MoreItem onClick={onToggleTexture} icon={Layers} label="Tekstur" active={isTextureOpen} />}
                  <DropdownMenuSeparator />
                </>
              )}

              {(onToggleLinkedNotes || onToggleBarcode || onToggleReadAloud) && (
                <>
                  <DropdownMenuLabel>Catatan</DropdownMenuLabel>
                  {onToggleLinkedNotes && <MoreItem onClick={onToggleLinkedNotes} icon={Link2} label="Catatan terhubung" active={isLinkedNotesOpen} />}
                  {onToggleBarcode && <MoreItem onClick={onToggleBarcode} icon={ScanBarcode} label="Pindai barcode" active={isBarcodeOpen} />}
                  {onToggleReadAloud && <MoreItem onClick={onToggleReadAloud} icon={Volume2} label="Baca keras" active={isReadAloudOpen} />}
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuLabel>Interaksi</DropdownMenuLabel>
              <MoreItem onClick={onToggleReaction} icon={Smile} label="Reaksi" active={isReactionOpen || isReactionActive} />
              <MoreItem onClick={onToggleHighlight} icon={Highlighter} label="Highlight" active={isHighlightOpen} />

              {(onToggleTimeCapsule || onToggleSecret || onToggleVersionHistory || onToggleScheduled) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Lanjutan</DropdownMenuLabel>
                  {onToggleTimeCapsule && (
                    <MoreItem
                      onClick={onToggleTimeCapsule}
                      icon={Timer}
                      label={isTimeCapsuleActive ? 'Kapsul waktu aktif' : 'Kapsul waktu'}
                      active={Boolean(isTimeCapsuleOpen || isTimeCapsuleActive)}
                    />
                  )}
                  {onToggleSecret && (
                    <MoreItem
                      onClick={onToggleSecret}
                      icon={Lock}
                      label={isSecretActive ? 'Terkunci (rahasia)' : 'Catatan rahasia'}
                      active={Boolean(isSecretOpen || isSecretActive)}
                    />
                  )}
                  {onToggleVersionHistory && (
                    <MoreItem onClick={onToggleVersionHistory} icon={History} label="Riwayat versi" active={isVersionHistoryOpen} />
                  )}
                  {onToggleScheduled && (
                    <MoreItem
                      onClick={onToggleScheduled}
                      icon={CalendarClock}
                      label={isScheduledActive ? 'Terjadwal aktif' : 'Jadwalkan catatan'}
                      active={Boolean(isScheduledOpen || isScheduledActive)}
                    />
                  )}
                </>
              )}

              {onShare && (
                <>
                  <DropdownMenuSeparator />
                  <MoreItem onClick={onShare} icon={Share2} label="Bagikan sebagai kartu" />
                </>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer + save status */}
        <div className="flex-1" />

        <NoteWordCount
          wordCount={wordCount}
          readingTimeMinutes={readingTimeMinutes}
          className="mr-1 shrink-0 hidden sm:flex"
        />

        <div
          className="text-sm text-[var(--text-tertiary)] min-w-[72px] text-right shrink-0 px-1"
          aria-live="polite"
        >
          {isSaving ? (
            <span className="flex items-center gap-1 justify-end">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden />
              Menyimpan…
            </span>
          ) : isDirty ? 'Belum tersimpan' : 'Tersimpan'}
        </div>

        <ToolBtn onClick={onSave} label="Simpan (⌘S)">
          <Save className={cn('h-4.5 w-4.5', isDirty && 'text-[var(--accent)]')} />
        </ToolBtn>
      </div>
    </div>
  );
}

/**
 * Memoized: this toolbar re-renders on every NoteEditor render otherwise
 * (every keystroke in title/content), even though most of its props are
 * stable panel-toggle callbacks. Pairs with note-editor.tsx's togglePanel
 * refactor, which made those callbacks stable across renders so memo here
 * actually has an effect.
 */
export const NoteEditorToolbar = memo(NoteEditorToolbarImpl);
