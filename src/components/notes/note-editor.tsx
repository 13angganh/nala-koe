'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, CloudSun, Loader2, X } from 'lucide-react';
import { useKeyboard } from '@/hooks/use-keyboard';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useWeather } from '@/hooks/use-weather';
import { useNotes } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { generateId, stripHtml } from '@/lib/utils';
import { NoteEditorToolbar } from './note-editor-toolbar';
import { NoteChecklist } from './note-checklist';
import { NoteChecklistProgress } from './note-checklist-progress';
import { NoteMoodPicker } from './note-mood-picker';
import { NoteWeatherBadge } from './note-weather-badge';
import { NoteTable, deserializeTable, serializeTable } from './note-table';
import { NoteMathBlock } from './note-math-block';
import { NoteUrlPreview } from './note-url-preview';
import { NoteFontPicker, fontWeightClass } from './note-font-picker';
import { NoteTexturePicker, textureClass } from './note-texture-picker';
import { NoteLinkedNotes } from './note-linked-notes';
import { NoteBarcodeScanner } from './note-barcode-scanner';
import { NoteReadAloud } from './note-read-aloud';
import { NoteTimeCapsuleLock } from './note-time-capsule-lock';
import { NoteSecretLock } from './note-secret-lock';
import { NoteVersionHistory } from './note-version-history';
import { NoteSizeIndicator } from './note-size-indicator';
import { NoteReactionBar } from './note-reaction-bar';
import { NoteHighlightMarker } from './note-highlight-marker';
import { NoteScheduled } from './note-scheduled';
import { NoteShareCard } from './note-share-card';
import { TagInput } from '@/components/tags/tag-input';
import { Button } from '@/components/ui/button';
import { useTags } from '@/hooks/use-tags';
import type { ChecklistItem } from './note-checklist';
import type { NoteContentBlock, NoteLocation, NoteReaction, NoteHighlight } from '@/types/note.types';
import type { MoodId } from '@/types/mood.types';
import type { WeatherSnapshot } from '@/types/api.types';
import type { NoteFontWeight, NoteTexture } from '@/types/settings.types';
import type { UrlPreviewData } from './note-url-preview';

// ─── Props ────────────────────────────────────────────────────────────────────

interface NoteEditorProps {
  noteId: string;
  title: string;
  content: string;
  blocks: NoteContentBlock[];
  isPinned: boolean;
  isSaving: boolean;
  isDirty: boolean;
  wordCount: number;
  readingTimeMinutes: number;
  mood: MoodId | null;
  tags: string[];
  language: string | null;
  weather: WeatherSnapshot | null;
  location: NoteLocation | null;
  fontWeight: NoteFontWeight;
  texture: NoteTexture;
  linkedNoteIds: string[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onBlocksChange: (blocks: NoteContentBlock[]) => void;
  onTogglePin: () => void;
  onSave: () => void;
  onMoodChange: (mood: MoodId | null) => void;
  onTagsChange: (tags: string[]) => void;
  onWeatherChange: (weather: WeatherSnapshot | null) => void;
  onLocationChange: (location: NoteLocation | null) => void;
  onFontChange: (fontWeight: NoteFontWeight) => void;
  onTextureChange: (texture: NoteTexture) => void;
  onLinkedNotesChange: (linkedNoteIds: string[]) => void;
  onInsertTable: () => void;
  onInsertMath: () => void;
  onInsertUrlPreview: (url: string) => void;
  // Phase 6
  isSecret: boolean;
  isTimeCapsule: boolean;
  timeCapsuleUnlockAt: string | null;
  onTimeCapsuleChange: (isTimeCapsule: boolean, unlockAt: string | null) => void;
  onSecretChange: (isSecret: boolean) => void;
  // Phase 7
  sizeInfo?: { totalBytes: number; textBytes: number; hasImages: boolean; hasAudio: boolean; label: 'small' | 'medium' | 'large' };
  // Phase 8
  reaction?: NoteReaction | null;
  highlights?: NoteHighlight[];
  onReactionChange?: (reaction: NoteReaction | null) => void;
  onHighlightsChange?: (highlights: NoteHighlight[]) => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  // Phase 9
  isScheduled?: boolean;
  scheduledAt?: string | null;
  onScheduledChange?: (isScheduled: boolean, scheduledAt: string | null) => void;
  className?: string;
}

// ─── URL prompt helper ────────────────────────────────────────────────────────

function UrlPromptBar({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
      <input
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); if (value.trim()) onSubmit(value.trim()); }
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="https://contoh.com"
        aria-label="Masukkan URL"
        autoFocus
        className={cn(
          'flex-1 bg-transparent text-sm text-[var(--text-primary)]',
          'placeholder:text-[var(--text-tertiary)]',
          'outline-none border-none'
        )}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { if (value.trim()) onSubmit(value.trim()); }}
        disabled={!value.trim()}
        className="h-7 text-xs"
      >
        Tambah
      </Button>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Batal"
        className="text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none rounded p-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteEditor({
  noteId,
  title,
  content,
  blocks,
  isPinned,
  isSaving,
  isDirty,
  wordCount,
  readingTimeMinutes,
  mood,
  tags,
  language,
  weather,
  location,
  fontWeight,
  texture,
  linkedNoteIds,
  onTitleChange,
  onContentChange,
  onBlocksChange,
  onTogglePin,
  onSave,
  onMoodChange,
  onTagsChange,
  onWeatherChange,
  onLocationChange,
  onFontChange,
  onTextureChange,
  onLinkedNotesChange,
  onInsertTable,
  onInsertMath,
  onInsertUrlPreview,
  isSecret,
  isTimeCapsule,
  timeCapsuleUnlockAt,
  onTimeCapsuleChange,
  onSecretChange,
  sizeInfo,
  onDuplicate: _onDuplicate,
  onArchive: _onArchive,
  reaction,
  highlights = [],
  onReactionChange,
  onHighlightsChange,
  isScheduled = false,
  scheduledAt = null,
  onScheduledChange,
  className,
}: NoteEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Panel visibility
  const [isMetaOpen, setIsMetaOpen] = useState(false);
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isTextureOpen, setIsTextureOpen] = useState(false);
  const [isLinkedNotesOpen, setIsLinkedNotesOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isReadAloudOpen, setIsReadAloudOpen] = useState(false);
  const [showUrlPrompt, setShowUrlPrompt] = useState(false);
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const [isSecretOpen, setIsSecretOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(!isSecret);
  const [isReactionOpen, setIsReactionOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);
  const [isScheduledOpen, setIsScheduledOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { suggestions, searchSuggestions } = useTags();
  const { requestLocation, isRequesting: isRequestingLocation } = useGeolocation();
  const { fetchWeather, isFetching: isFetchingWeather } = useWeather();
  const { data: allNotes = [], isLoading: isLoadingNotes } = useNotes({ status: 'active' });

  // ── Auto-resize textareas ─────────────────────────────────────────────────

  function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => { autoResize(titleRef.current); }, [title]);
  useEffect(() => { autoResize(contentRef.current); }, [content]);
  useKeyboard([{ key: 's', modifiers: ['meta'], onKeyDown: onSave }]);
  useEffect(() => { if (!title && titleRef.current) titleRef.current.focus(); }, [title]);

  useEffect(() => {
    if (mood || tags.length > 0 || weather || location) setIsMetaOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Checklist ─────────────────────────────────────────────────────────────

  const handleInsertChecklist = useCallback(() => {
    const newBlock: NoteContentBlock = {
      id: generateId(),
      type: 'checklist',
      content: JSON.stringify([{ id: generateId(), text: '', isChecked: false }]),
      order: blocks.length,
    };
    onBlocksChange([...blocks, newBlock]);
  }, [blocks, onBlocksChange]);

  const handleChecklistChange = useCallback(
    (blockId: string, items: ChecklistItem[]) => {
      onBlocksChange(blocks.map((b) => b.id === blockId ? { ...b, content: JSON.stringify(items) } : b));
    },
    [blocks, onBlocksChange]
  );

  // ── Table ─────────────────────────────────────────────────────────────────

  const handleTableChange = useCallback(
    (blockId: string, data: ReturnType<typeof deserializeTable>) => {
      onBlocksChange(blocks.map((b) => b.id === blockId ? { ...b, content: serializeTable(data) } : b));
    },
    [blocks, onBlocksChange]
  );

  // ── Math ──────────────────────────────────────────────────────────────────

  const handleMathChange = useCallback(
    (blockId: string, expression: string) => {
      onBlocksChange(blocks.map((b) => b.id === blockId ? { ...b, content: expression } : b));
    },
    [blocks, onBlocksChange]
  );

  // ── URL Preview ───────────────────────────────────────────────────────────

  const handleUrlPreviewFetched = useCallback(
    (blockId: string, previewData: UrlPreviewData) => {
      onBlocksChange(blocks.map((b) => b.id === blockId ? { ...b, content: JSON.stringify(previewData) } : b));
    },
    [blocks, onBlocksChange]
  );

  const handleRemoveBlock = useCallback(
    (blockId: string) => { onBlocksChange(blocks.filter((b) => b.id !== blockId)); },
    [blocks, onBlocksChange]
  );

  // ── Location + Weather ────────────────────────────────────────────────────

  async function handleRequestLocation() {
    const loc = await requestLocation();
    if (loc) {
      onLocationChange(loc);
      if (!weather) {
        const snap = await fetchWeather(loc.latitude, loc.longitude);
        if (snap) onWeatherChange(snap);
      }
    }
  }

  // ── Barcode ───────────────────────────────────────────────────────────────

  const handleBarcodeScanned = useCallback(
    (value: string, format: string) => {
      const insert = `[Barcode ${format.replace(/_/g, ' ')}: ${value}]`;
      onContentChange(content ? `${content}\n${insert}` : insert);
      setIsBarcodeOpen(false);
    },
    [content, onContentChange]
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  const checklistBlocks = blocks.filter((b) => b.type === 'checklist');
  const allChecklistItems = checklistBlocks.flatMap((b) => {
    try { return JSON.parse(b.content) as ChecklistItem[]; } catch { return []; }
  });
  const plainText = stripHtml(content);
  const textureCls = textureClass(texture);
  const fontCls = fontWeightClass(fontWeight);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <NoteEditorToolbar
        isPinned={isPinned}
        isSaving={isSaving}
        isDirty={isDirty}
        wordCount={wordCount}
        readingTimeMinutes={readingTimeMinutes}
        onTogglePin={onTogglePin}
        onSave={onSave}
        onInsertChecklist={handleInsertChecklist}
        onInsertTable={onInsertTable}
        onInsertMath={onInsertMath}
        onInsertUrlPreview={() => setShowUrlPrompt(true)}
        onToggleMeta={() => setIsMetaOpen((v) => !v)}
        isMetaOpen={isMetaOpen ?? false}
        onToggleFont={() => setIsFontOpen((v) => !v)}
        isFontOpen={isFontOpen ?? false}
        onToggleTexture={() => setIsTextureOpen((v) => !v)}
        isTextureOpen={isTextureOpen ?? false}
        onToggleLinkedNotes={() => setIsLinkedNotesOpen((v) => !v)}
        isLinkedNotesOpen={isLinkedNotesOpen ?? false}
        onToggleBarcode={() => setIsBarcodeOpen((v) => !v)}
        isBarcodeOpen={isBarcodeOpen ?? false}
        onToggleReadAloud={() => setIsReadAloudOpen((v) => !v)}
        isReadAloudOpen={isReadAloudOpen ?? false}
        onToggleTimeCapsule={() => setIsTimeCapsuleOpen((v) => !v)}
        isTimeCapsuleOpen={isTimeCapsuleOpen ?? false}
        isTimeCapsuleActive={isTimeCapsule}
        onToggleSecret={() => setIsSecretOpen((v) => !v)}
        isSecretOpen={isSecretOpen ?? false}
        isSecretActive={isSecret}
        onToggleVersionHistory={() => setIsVersionHistoryOpen((v) => !v)}
        isVersionHistoryOpen={isVersionHistoryOpen ?? false}
        // Phase 8
        onToggleReaction={() => setIsReactionOpen((v) => !v)}
        isReactionOpen={isReactionOpen ?? false}
        isReactionActive={!!reaction}
        onToggleHighlight={() => setIsHighlightOpen((v) => !v)}
        isHighlightOpen={isHighlightOpen ?? false}
        // Phase 9
        {...(onScheduledChange ? { onToggleScheduled: () => setIsScheduledOpen((v) => !v) } : {})}
        isScheduledOpen={isScheduledOpen ?? false}
        isScheduledActive={isScheduled}
        onShare={() => setIsShareOpen(true)}
      />

      {/* Scrollable editor body */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn('mx-auto max-w-2xl px-6 py-8 space-y-5', textureCls)}>

          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => { onTitleChange(e.target.value); autoResize(e.target); }}
            placeholder="Judul catatan…"
            aria-label="Judul catatan"
            rows={1}
            className={cn(
              'w-full resize-none overflow-hidden bg-transparent',
              'text-2xl font-semibold text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              'outline-none border-none focus:ring-0 leading-snug'
            )}
          />

          {/* Font panel */}
          {isFontOpen && (
            <section aria-label="Gaya font" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Gaya Font</p>
              <NoteFontPicker value={fontWeight} onChange={onFontChange} />
            </section>
          )}

          {/* Texture panel */}
          {isTextureOpen && (
            <section aria-label="Tekstur catatan" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Tekstur Catatan</p>
              <NoteTexturePicker value={texture} onChange={onTextureChange} />
            </section>
          )}

          {/* Meta panel */}
          {isMetaOpen && (
            <section aria-label="Metadata catatan" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-secondary)]">Mood</p>
                <NoteMoodPicker value={mood} onChange={onMoodChange} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-secondary)]">Tag</p>
                <TagInput value={tags} onChange={onTagsChange} suggestions={suggestions} onSearchChange={(q) => void searchSuggestions(q)} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {location ? (
                  <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-base)] px-2.5 py-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)] shrink-0" />
                    <span className="text-xs text-[var(--text-secondary)] max-w-[160px] truncate">
                      {location.placeName ?? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`}
                    </span>
                    <button type="button" onClick={() => { onLocationChange(null); onWeatherChange(null); }} aria-label="Hapus lokasi" className="ml-1 text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => void handleRequestLocation()} disabled={isRequestingLocation || isFetchingWeather} className="h-7 text-xs gap-1.5">
                    {isRequestingLocation || isFetchingWeather ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                    {isRequestingLocation ? 'Mencari lokasi…' : isFetchingWeather ? 'Mengambil cuaca…' : 'Tambah lokasi'}
                  </Button>
                )}
                {weather && (
                  <div className="flex items-center gap-1.5">
                    <NoteWeatherBadge weather={weather} compact />
                    <button type="button" onClick={() => onWeatherChange(null)} aria-label="Hapus cuaca" className="text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {!weather && location && (
                  <Button variant="ghost" size="sm" onClick={async () => { const snap = await fetchWeather(location.latitude, location.longitude); if (snap) onWeatherChange(snap); }} disabled={isFetchingWeather} className="h-7 text-xs gap-1.5">
                    {isFetchingWeather ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CloudSun className="h-3.5 w-3.5" />}
                    Tambah cuaca
                  </Button>
                )}
              </div>
              {language && (
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  Bahasa terdeteksi: <span className="font-medium">{language.toUpperCase()}</span>
                </p>
              )}
            </section>
          )}

          {/* Linked notes panel */}
          {isLinkedNotesOpen && (
            <section aria-label="Catatan terhubung" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteLinkedNotes
                linkedNoteIds={linkedNoteIds}
                currentNoteId={noteId}
                availableNotes={allNotes}
                isLoadingNotes={isLoadingNotes}
                onChange={onLinkedNotesChange}
              />
            </section>
          )}

          {/* Barcode scanner panel */}
          {isBarcodeOpen && (
            <section aria-label="Pemindai barcode">
              <NoteBarcodeScanner onScanned={handleBarcodeScanned} variant="inline" />
            </section>
          )}

          {/* Read aloud panel */}
          {isReadAloudOpen && (
            <section aria-label="Baca keras">
              <NoteReadAloud text={plainText} title={title} />
            </section>
          )}

          {/* ── Phase 6 panels ───────────────────────────────────────── */}

          {/* Time Capsule panel */}
          {isTimeCapsuleOpen && (
            <section aria-label="Kapsul waktu" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteTimeCapsuleLock
                isTimeCapsule={isTimeCapsule}
                timeCapsuleUnlockAt={timeCapsuleUnlockAt}
                onTimeCapsuleChange={onTimeCapsuleChange ?? (() => {})}
              />
            </section>
          )}

          {/* Secret Note panel */}
          {isSecretOpen && (
            <section aria-label="Catatan rahasia" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteSecretLock
                noteId={noteId}
                isSecret={isSecret}
                isUnlocked={isSecretUnlocked}
                onSecretChange={onSecretChange ?? (() => {})}
                onUnlock={() => setIsSecretUnlocked(true)}
                onLock={() => setIsSecretUnlocked(false)}
              />
            </section>
          )}

          {/* Version History panel */}
          {isVersionHistoryOpen && (
            <section aria-label="Riwayat versi" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteVersionHistory
                noteId={noteId}
                currentContent={content}
              />
            </section>
          )}

          {/* ── Phase 7: Note Size Indicator ─────────────────────────── */}
          {sizeInfo && sizeInfo.label !== 'small' && (
            <div className="flex justify-end px-1">
              <NoteSizeIndicator
                totalBytes={sizeInfo.totalBytes}
                hasImages={sizeInfo.hasImages}
                hasAudio={sizeInfo.hasAudio}
                label={sizeInfo.label}
              />
            </div>
          )}

          {/* ── Phase 8: Reaction Bar ────────────────────────────── */}
          {isReactionOpen && (
            <section aria-label="Reaksi catatan">
              <NoteReactionBar
                noteId={noteId}
                reaction={reaction ?? null}
                {...(onReactionChange ? { onReactionChange } : {})}
              />
            </section>
          )}

          {/* ── Phase 8: Highlight Marker ────────────────────────── */}
          {isHighlightOpen && content.trim() && (
            <section aria-label="Highlight catatan">
              <NoteHighlightMarker
                noteId={noteId}
                content={content}
                highlights={highlights}
                {...(onHighlightsChange ? { onHighlightsChange } : {})}
              />
            </section>
          )}

          {/* ── Phase 9: Scheduled Note ───────────────────────── */}
          {isScheduledOpen && onScheduledChange && (
            <section aria-label="Jadwal catatan">
              <NoteScheduled
                isScheduled={isScheduled}
                scheduledAt={scheduledAt ?? null}
                onChange={onScheduledChange}
              />
            </section>
          )}

          {/* Checklist progress */}
          {allChecklistItems.length > 0 && <NoteChecklistProgress items={allChecklistItems} />}

          {/* All blocks */}
          {blocks.map((block) => {
            if (block.type === 'checklist') {
              let items: ChecklistItem[] = [];
              try { items = JSON.parse(block.content) as ChecklistItem[]; } catch { /* skip */ }
              return (
                <div key={block.id} className="space-y-2">
                  <NoteChecklist items={items} onChange={(updated) => handleChecklistChange(block.id, updated)} />
                </div>
              );
            }

            if (block.type === 'table') {
              return (
                <div key={block.id} className="space-y-1">
                  <NoteTable data={deserializeTable(block.content)} onChange={(data) => handleTableChange(block.id, data)} />
                  <button type="button" onClick={() => handleRemoveBlock(block.id)} aria-label="Hapus tabel" className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded">
                    Hapus tabel
                  </button>
                </div>
              );
            }

            if (block.type === 'math') {
              return (
                <div key={block.id} className="space-y-1">
                  <NoteMathBlock expression={block.content} onChange={(expr) => handleMathChange(block.id, expr)} />
                  <button type="button" onClick={() => handleRemoveBlock(block.id)} aria-label="Hapus kalkulasi" className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded">
                    Hapus kalkulasi
                  </button>
                </div>
              );
            }

            if (block.type === 'url-preview') {
              let previewData: UrlPreviewData | null = null;
              let rawUrl = '';
              try {
                const parsed = JSON.parse(block.content) as { url: string; meta: UrlPreviewData['meta']; cachedAt: string | null };
                rawUrl = parsed.url;
                if (parsed.meta) previewData = { url: parsed.url, meta: parsed.meta, cachedAt: parsed.cachedAt ?? new Date().toISOString() };
              } catch { /* skip */ }
              return (
                <NoteUrlPreview
                  key={block.id}
                  previewData={previewData}
                  rawUrl={rawUrl}
                  onPreviewFetched={(data) => handleUrlPreviewFetched(block.id, data)}
                  onRemove={() => handleRemoveBlock(block.id)}
                />
              );
            }

            return null;
          })}

          {/* URL prompt */}
          {showUrlPrompt && (
            <UrlPromptBar
              onSubmit={(url) => { onInsertUrlPreview(url); setShowUrlPrompt(false); }}
              onCancel={() => setShowUrlPrompt(false)}
            />
          )}

          {/* Main content textarea */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => { onContentChange(e.target.value); autoResize(e.target); }}
            placeholder="Tulis pikiranmu di sini…"
            aria-label="Konten catatan"
            rows={10}
            className={cn(
              'w-full min-h-[240px] resize-none overflow-hidden bg-transparent',
              'text-sm text-[var(--text-primary)] leading-relaxed',
              'placeholder:text-[var(--text-tertiary)]',
              'outline-none border-none focus:ring-0',
              fontCls
            )}
          />
        </div>
      </div>

      {/* ── Phase 11: Share Card Dialog ───────────────────────────────── */}
      <NoteShareCard
        note={{
          id: noteId,
          userId: '',
          title,
          content,
          blocks,
          mood,
          tags,
          status: 'active',
          isPinned: false,
          isSecret,
          isTimeCapsule: false,
          timeCapsuleUnlockAt: null,
          isScheduled: false,
          scheduledAt: null,
          language: null,
          texture: 'plain',
          fontWeight,
          accentColor: null,
          weather: null,
          location: null,
          reaction: null,
          linkedNoteIds: [],
          highlights: [],
          wordCount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          trashedAt: null,
          archivedAt: null,
          originalCreatedAt: null,
        }}
        open={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
