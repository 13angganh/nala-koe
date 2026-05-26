'use client';

import {
  Pin, PinOff, Save, CheckSquare, SlidersHorizontal, Table2,
  Calculator, Link2, Type, Layers, ScanBarcode, Volume2,
  Timer, Lock, History, CalendarClock, Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

export function NoteEditorToolbar({
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
  onToggleReaction: _onToggleReaction,
  isReactionOpen: _isReactionOpen = false,
  isReactionActive: _isReactionActive = false,
  onToggleHighlight: _onToggleHighlight,
  isHighlightOpen: _isHighlightOpen = false,
  onToggleScheduled, isScheduledOpen = false, isScheduledActive,
  onShare, className,
}: NoteEditorToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col border-b border-[var(--border)] bg-[var(--surface-subtle)]',
        className
      )}
      role="toolbar"
      aria-label="Toolbar editor"
    >
      {/* ── Baris 1: Aksi utama & status ─────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[var(--border)]/50 overflow-x-auto">
        {/* Pin */}
        <ToolBtn onClick={onTogglePin} label={isPinned ? 'Lepas sematan' : 'Sematkan'} active={isPinned}>
          {isPinned
            ? <PinOff className="h-4.5 w-4.5 text-[var(--accent)]" />
            : <Pin className="h-4.5 w-4.5" />}
        </ToolBtn>

        <div className="w-px h-5 bg-[var(--border)] mx-1 shrink-0" />

        {/* Insert blocks */}
        <ToolBtn onClick={onInsertChecklist} label="Tambah checklist">
          <CheckSquare className="h-4.5 w-4.5" />
        </ToolBtn>

        {onInsertTable && (
          <ToolBtn onClick={onInsertTable ?? (() => {})} label="Tambah tabel">
            <Table2 className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onInsertMath && (
          <ToolBtn onClick={onInsertMath ?? (() => {})} label="Kalkulasi">
            <Calculator className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onInsertUrlPreview && (
          <ToolBtn onClick={onInsertUrlPreview ?? (() => {})} label="Link preview">
            <Link2 className="h-4.5 w-4.5" />
          </ToolBtn>
        )}

        <div className="w-px h-5 bg-[var(--border)] mx-1 shrink-0" />

        {/* Meta toggle */}
        {onToggleMeta && (
          <ToolBtn onClick={onToggleMeta ?? (() => {})} label="Mood & tag" active={isMetaOpen}>
            <SlidersHorizontal className="h-4.5 w-4.5" />
          </ToolBtn>
        )}

        {/* Spacer + save status */}
        <div className="flex-1" />

        <NoteWordCount
          wordCount={wordCount}
          readingTimeMinutes={readingTimeMinutes}
          className="mr-1 shrink-0 hidden sm:flex"
        />

        <div
          className="text-xs text-[var(--text-tertiary)] min-w-[64px] text-right shrink-0 px-1"
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

      {/* ── Baris 2: Fitur lanjutan ────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-1 overflow-x-auto">
        {onToggleFont && (
          <ToolBtn onClick={onToggleFont ?? (() => {})} label="Gaya font" active={isFontOpen}>
            <Type className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onToggleTexture && (
          <ToolBtn onClick={onToggleTexture ?? (() => {})} label="Tekstur" active={isTextureOpen}>
            <Layers className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onToggleLinkedNotes && (
          <ToolBtn onClick={onToggleLinkedNotes ?? (() => {})} label="Catatan terhubung" active={isLinkedNotesOpen}>
            <Link2 className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onToggleBarcode && (
          <ToolBtn onClick={onToggleBarcode ?? (() => {})} label="Pindai barcode" active={isBarcodeOpen}>
            <ScanBarcode className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onToggleReadAloud && (
          <ToolBtn onClick={onToggleReadAloud ?? (() => {})} label="Baca keras" active={isReadAloudOpen}>
            <Volume2 className="h-4.5 w-4.5" />
          </ToolBtn>
        )}

        {(onToggleTimeCapsule || onToggleSecret || onToggleVersionHistory) && (
          <div className="w-px h-5 bg-[var(--border)] mx-1 shrink-0" />
        )}

        {onToggleTimeCapsule && (
          <ToolBtn
            onClick={onToggleTimeCapsule ?? (() => {})}
            label={isTimeCapsuleActive ? 'Kapsul waktu aktif' : 'Kapsul waktu'}
            active={(isTimeCapsuleOpen || isTimeCapsuleActive) ?? false}
          >
            <Timer className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onToggleSecret && (
          <ToolBtn
            onClick={onToggleSecret ?? (() => {})}
            label={isSecretActive ? 'Terkunci (rahasia)' : 'Catatan rahasia'}
            active={(isSecretOpen || isSecretActive) ?? false}
          >
            <Lock className="h-4.5 w-4.5" />
          </ToolBtn>
        )}
        {onToggleVersionHistory && (
          <ToolBtn onClick={onToggleVersionHistory ?? (() => {})} label="Riwayat versi" active={isVersionHistoryOpen}>
            <History className="h-4.5 w-4.5" />
          </ToolBtn>
        )}

        {onToggleScheduled && (
          <>
            <div className="w-px h-5 bg-[var(--border)] mx-1 shrink-0" />
            <ToolBtn
              onClick={onToggleScheduled ?? (() => {})}
              label={isScheduledActive ? 'Terjadwal aktif' : 'Jadwalkan catatan'}
              active={(isScheduledOpen || isScheduledActive) ?? false}
            >
              <CalendarClock className="h-4.5 w-4.5" />
            </ToolBtn>
          </>
        )}

        {onShare && (
          <>
            <div className="flex-1" />
            <ToolBtn onClick={onShare ?? (() => {})} label="Bagikan sebagai kartu">
              <Share2 className="h-4.5 w-4.5" />
            </ToolBtn>
          </>
        )}
      </div>
    </div>
  );
}
