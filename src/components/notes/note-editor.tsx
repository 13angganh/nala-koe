'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { X } from 'lucide-react';
import { useKeyboard } from '@/hooks/use-keyboard';
import { useGeolocation } from '@/hooks/use-geolocation';
import { useWeather } from '@/hooks/use-weather';
import { useNotes } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { generateId, stripHtml } from '@/lib/utils';
import { appendPlainLine } from '@/lib/rich-text';
import { NoteFormatToolbar } from './note-format-toolbar';
import { NoteRichEditor } from './note-rich-editor';
import { NoteEditorToolbar } from './note-editor-toolbar';
import { AnimatedPanel } from '@/components/shared/animated-panel';
import { NoteChecklistProgress } from './note-checklist-progress';
import { NoteMetaPanel } from './note-meta-panel';
import { serializeTable } from './note-table';
import type { deserializeTable } from './note-table';
import { NoteBlocksRenderer } from './note-blocks-renderer';
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
import { Button } from '@/components/ui/button';
import { useTags } from '@/hooks/use-tags';
import type { ChecklistItem } from './note-checklist';
import type { NoteContentBlock, NoteLocation, NoteReaction, NoteHighlight, NoteSectionKey } from '@/types/note.types';
import type { MoodId } from '@/types/mood.types';
import type { WeatherSnapshot } from '@/types/api.types';
import type { NoteFontWeight, NoteTexture } from '@/types/settings.types';
import type { UrlPreviewData } from './note-url-preview';

// ─── Props ────────────────────────────────────────────────────────────────────

interface NoteEditorProps {
  noteId: string;
  title: string;
  content: string;
  contentFormat: 'plain' | 'html';
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
  onContentChange: (content: string, contentFormat?: 'plain' | 'html') => void;
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
  // Phase 16: hide/unhide
  hiddenSections?: NoteSectionKey[];
  onToggleSectionVisibility?: (section: NoteSectionKey) => void;
  onToggleBlockVisibility?: (blockId: string) => void;
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

// Stable module-level no-op so optional toggle-handler props always have a
// consistent function identity, even when the caller doesn't pass one —
// avoids defeating memoization on the panels that receive these as props.
const noop = () => {};

export function NoteEditor({
  noteId,
  title,
  content,
  contentFormat,
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
  hiddenSections = [],
  onToggleSectionVisibility,
  onToggleBlockVisibility,
  className,
}: NoteEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement | HTMLDivElement>(null);

  // Panel visibility
  // Single state object + one stable toggle callback for all simple
  // open/closed editor panels, instead of 12 separate useState calls each
  // paired with its own inline `() => setX(v => !v)` passed straight into
  // NoteEditorToolbar. Inline arrow functions are a new identity on every
  // render, which defeats any memoization on the toolbar (it always sees
  // "changed" props and re-renders). togglePanel below is stable across
  // renders via useCallback, so the toolbar can be memoized effectively.
  const [isMetaOpen, setIsMetaOpen] = useState(() => Boolean(mood || tags.length > 0 || weather || location));
  const [panels, setPanels] = useState({
    font: false,
    texture: false,
    linkedNotes: false,
    barcode: false,
    readAloud: false,
    timeCapsule: false,
    secret: false,
    versionHistory: false,
    reaction: false,
    highlight: false,
    scheduled: false,
  });
  const togglePanel = useCallback((key: keyof typeof panels) => {
    setPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);
  const isFontOpen = panels.font;
  const isTextureOpen = panels.texture;
  const isLinkedNotesOpen = panels.linkedNotes;
  const isBarcodeOpen = panels.barcode;
  const isReadAloudOpen = panels.readAloud;
  const isTimeCapsuleOpen = panels.timeCapsule;
  const isSecretOpen = panels.secret;
  const isVersionHistoryOpen = panels.versionHistory;
  const isReactionOpen = panels.reaction;
  const isHighlightOpen = panels.highlight;
  const isScheduledOpen = panels.scheduled;

  const [showUrlPrompt, setShowUrlPrompt] = useState(false);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(!isSecret);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Stable toggle/open callbacks — declared after their corresponding
  // useState calls so the setters they close over are already initialized.
  const toggleMeta = useCallback(() => setIsMetaOpen((v) => !v), []);
  const toggleFontPanel = useCallback(() => togglePanel('font'), [togglePanel]);
  const toggleTexturePanel = useCallback(() => togglePanel('texture'), [togglePanel]);
  const toggleLinkedNotesPanel = useCallback(() => togglePanel('linkedNotes'), [togglePanel]);
  const toggleBarcodePanel = useCallback(() => togglePanel('barcode'), [togglePanel]);
  const toggleReadAloudPanel = useCallback(() => togglePanel('readAloud'), [togglePanel]);
  const toggleTimeCapsulePanel = useCallback(() => togglePanel('timeCapsule'), [togglePanel]);
  const toggleSecretPanel = useCallback(() => togglePanel('secret'), [togglePanel]);
  const toggleVersionHistoryPanel = useCallback(() => togglePanel('versionHistory'), [togglePanel]);
  const toggleReactionPanel = useCallback(() => togglePanel('reaction'), [togglePanel]);
  const toggleHighlightPanel = useCallback(() => togglePanel('highlight'), [togglePanel]);
  const toggleScheduledPanel = useCallback(() => togglePanel('scheduled'), [togglePanel]);
  const openUrlPrompt = useCallback(() => setShowUrlPrompt(true), []);
  const openSharePanel = useCallback(() => setIsShareOpen(true), []);

  const { suggestions, searchSuggestions } = useTags();
  const { requestLocation, isRequesting: isRequestingLocation } = useGeolocation();
  const { fetchWeather, isFetching: isFetchingWeather } = useWeather();
  // Lazy-loaded: only fetched once the user actually opens the "Catatan
  // terhubung" panel — opening a note for editing shouldn't pay the cost of
  // fetching the entire active-notes list every time. `syncToStore: false`
  // keeps this local to the picker so it doesn't clobber the dashboard's
  // notes-list store as a side effect of editing an unrelated note.
  const activeNotesFilter = useMemo(() => ({ status: 'active' as const }), []);
  const { data: allNotes = [], isLoading: isLoadingNotes } = useNotes(activeNotesFilter, {
    enabled: isLinkedNotesOpen ?? false,
    syncToStore: false,
  });

  // ── Auto-resize textareas ─────────────────────────────────────────────────

  function autoResize(el: HTMLTextAreaElement | null) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => { autoResize(titleRef.current); }, [title]);
  useEffect(() => {
    if (contentFormat === 'plain' && contentRef.current instanceof HTMLTextAreaElement) {
      autoResize(contentRef.current);
    }
  }, [content, contentFormat]);
  useKeyboard([{ key: 's', modifiers: ['meta'], onKeyDown: onSave }]);
  useEffect(() => { if (!title && titleRef.current) titleRef.current.focus(); }, [title]);

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
      if (items.length === 0) {
        // Hapus seluruh block checklist jika semua item dihapus
        onBlocksChange(blocks.filter((b) => b.id !== blockId));
      } else {
        onBlocksChange(blocks.map((b) => b.id === blockId ? { ...b, content: JSON.stringify(items) } : b));
      }
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

  const handleRequestLocation = useCallback(async () => {
    const loc = await requestLocation();
    if (loc) {
      onLocationChange(loc);
      if (!weather) {
        const snap = await fetchWeather(loc.latitude, loc.longitude);
        if (snap) onWeatherChange(snap);
      }
    }
  }, [requestLocation, onLocationChange, weather, fetchWeather, onWeatherChange]);

  const handleFetchWeatherForLocation = useCallback(async () => {
    if (!location) return;
    const snap = await fetchWeather(location.latitude, location.longitude);
    if (snap) onWeatherChange(snap);
  }, [location, fetchWeather, onWeatherChange]);

  // void-wrapped, stable: NoteMetaPanel expects sync () => void callbacks.
  const onRequestLocationClick = useCallback(() => { void handleRequestLocation(); }, [handleRequestLocation]);
  const onFetchWeatherClick = useCallback(() => { void handleFetchWeatherForLocation(); }, [handleFetchWeatherForLocation]);

  // ── Barcode ───────────────────────────────────────────────────────────────

  const handleBarcodeScanned = useCallback(
    (value: string, format: string) => {
      const insert = `[Barcode ${format.replace(/_/g, ' ')}: ${value}]`;
      onContentChange(appendPlainLine(content, contentFormat, insert), contentFormat);
      setPanels((prev) => ({ ...prev, barcode: false }));
    },
    [content, contentFormat, onContentChange]
  );

  // ── Derived ───────────────────────────────────────────────────────────────
  // Memoized: blocks.flatMap + JSON.parse and stripHtml(content) are both
  // non-trivial passes that were previously re-run on every single render
  // (i.e. every keystroke, since content updates on every keystroke). Now
  // they only recompute when their actual source data changes.

  // Hidden checklist blocks must be excluded here too — otherwise the
  // progress bar at the bottom of the editor would still count items from a
  // checklist the user just hid, making the "hide" action look broken (the
  // block itself disappears from view, but its item count keeps showing
  // elsewhere). isHidden defaults to false for legacy blocks with no flag.
  const allChecklistItems = useMemo(() => {
    return blocks
      .filter((b) => b.type === 'checklist' && !(b.isHidden ?? false))
      .flatMap((b) => {
        try { return JSON.parse(b.content) as ChecklistItem[]; } catch { return []; }
      });
  }, [blocks]);

  // plainText feeds NoteReadAloud, which is only rendered inside its own
  // collapsed AnimatedPanel — but we still avoid recomputing it on every
  // keystroke by memoizing on content.
  const plainText = useMemo(() => stripHtml(content), [content]);

  const textureCls = useMemo(() => textureClass(texture), [texture]);
  const fontCls = useMemo(() => fontWeightClass(fontWeight), [fontWeight]);

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
        onInsertUrlPreview={openUrlPrompt}
        onToggleMeta={toggleMeta}
        isMetaOpen={isMetaOpen ?? false}
        onToggleFont={toggleFontPanel}
        isFontOpen={isFontOpen ?? false}
        onToggleTexture={toggleTexturePanel}
        isTextureOpen={isTextureOpen ?? false}
        onToggleLinkedNotes={toggleLinkedNotesPanel}
        isLinkedNotesOpen={isLinkedNotesOpen ?? false}
        onToggleBarcode={toggleBarcodePanel}
        isBarcodeOpen={isBarcodeOpen ?? false}
        onToggleReadAloud={toggleReadAloudPanel}
        isReadAloudOpen={isReadAloudOpen ?? false}
        onToggleTimeCapsule={toggleTimeCapsulePanel}
        isTimeCapsuleOpen={isTimeCapsuleOpen ?? false}
        isTimeCapsuleActive={isTimeCapsule}
        onToggleSecret={toggleSecretPanel}
        isSecretOpen={isSecretOpen ?? false}
        isSecretActive={isSecret}
        onToggleVersionHistory={toggleVersionHistoryPanel}
        isVersionHistoryOpen={isVersionHistoryOpen ?? false}
        // Phase 8
        onToggleReaction={toggleReactionPanel}
        isReactionOpen={isReactionOpen ?? false}
        isReactionActive={!!reaction}
        onToggleHighlight={toggleHighlightPanel}
        isHighlightOpen={isHighlightOpen ?? false}
        // Phase 9
        {...(onScheduledChange ? { onToggleScheduled: toggleScheduledPanel } : {})}
        isScheduledOpen={isScheduledOpen ?? false}
        isScheduledActive={isScheduled}
        onShare={openSharePanel}
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
          <AnimatedPanel show={isFontOpen ?? false}>
            <section aria-label="Gaya font" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Gaya Font</p>
              <NoteFontPicker value={fontWeight} onChange={onFontChange} />
            </section>
          </AnimatedPanel>

          {/* Texture panel */}
          <AnimatedPanel show={isTextureOpen ?? false}>
            <section aria-label="Tekstur catatan" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 space-y-2">
              <p className="text-xs font-medium text-[var(--text-secondary)]">Tekstur Catatan</p>
              <NoteTexturePicker value={texture} onChange={onTextureChange} />
            </section>
          </AnimatedPanel>

          {/* Meta panel */}
          <AnimatedPanel show={isMetaOpen ?? false}>
            <NoteMetaPanel
              mood={mood}
              onMoodChange={onMoodChange}
              tags={tags}
              onTagsChange={onTagsChange}
              tagSuggestions={suggestions}
              onTagSearchChange={(q) => void searchSuggestions(q)}
              weather={weather}
              onWeatherChange={onWeatherChange}
              location={location}
              onLocationChange={onLocationChange}
              onRequestLocation={onRequestLocationClick}
              isRequestingLocation={isRequestingLocation}
              isFetchingWeather={isFetchingWeather}
              onFetchWeatherForLocation={onFetchWeatherClick}
              language={language}
              hiddenSections={hiddenSections}
              onToggleSection={onToggleSectionVisibility ?? noop}
            />
          </AnimatedPanel>

          {/* Linked notes panel */}
          <AnimatedPanel show={isLinkedNotesOpen ?? false}>
            <section aria-label="Catatan terhubung" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteLinkedNotes
                linkedNoteIds={linkedNoteIds}
                currentNoteId={noteId}
                availableNotes={allNotes}
                isLoadingNotes={isLoadingNotes}
                onChange={onLinkedNotesChange}
              />
            </section>
          </AnimatedPanel>

          {/* Barcode scanner panel */}
          <AnimatedPanel show={isBarcodeOpen ?? false}>
            <section aria-label="Pemindai barcode">
              <NoteBarcodeScanner onScanned={handleBarcodeScanned} variant="inline" />
            </section>
          </AnimatedPanel>

          {/* Read aloud panel */}
          <AnimatedPanel show={isReadAloudOpen ?? false}>
            <section aria-label="Baca keras">
              <NoteReadAloud text={plainText} title={title} />
            </section>
          </AnimatedPanel>

          {/* ── Phase 6 panels ───────────────────────────────────────── */}

          {/* Time Capsule panel */}
          <AnimatedPanel show={isTimeCapsuleOpen ?? false}>
            <section aria-label="Kapsul waktu" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteTimeCapsuleLock
                isTimeCapsule={isTimeCapsule}
                timeCapsuleUnlockAt={timeCapsuleUnlockAt}
                onTimeCapsuleChange={onTimeCapsuleChange ?? noop}
              />
            </section>
          </AnimatedPanel>

          {/* Secret Note panel */}
          <AnimatedPanel show={isSecretOpen ?? false}>
            <section aria-label="Catatan rahasia" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteSecretLock
                noteId={noteId}
                isSecret={isSecret}
                isUnlocked={isSecretUnlocked}
                onSecretChange={onSecretChange ?? noop}
                onUnlock={() => setIsSecretUnlocked(true)}
                onLock={() => setIsSecretUnlocked(false)}
              />
            </section>
          </AnimatedPanel>

          {/* Version History panel */}
          <AnimatedPanel show={isVersionHistoryOpen ?? false}>
            <section aria-label="Riwayat versi" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <NoteVersionHistory
                noteId={noteId}
                currentContent={content}
              />
            </section>
          </AnimatedPanel>

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
          <AnimatedPanel show={isReactionOpen ?? false}>
            <section aria-label="Reaksi catatan">
              <NoteReactionBar
                noteId={noteId}
                reaction={reaction ?? null}
                {...(onReactionChange ? { onReactionChange } : {})}
              />
            </section>
          </AnimatedPanel>

          {/* ── Phase 8: Highlight Marker ────────────────────────── */}
          <AnimatedPanel show={Boolean(isHighlightOpen && content.trim())}>
            <section aria-label="Highlight catatan">
              <NoteHighlightMarker
                noteId={noteId}
                content={contentFormat === 'html' ? stripHtml(content) : content}
                highlights={highlights}
                {...(onHighlightsChange ? { onHighlightsChange } : {})}
              />
            </section>
          </AnimatedPanel>

          {/* ── Phase 9: Scheduled Note ───────────────────────── */}
          <AnimatedPanel show={Boolean(isScheduledOpen && onScheduledChange)}>
            <section aria-label="Jadwal catatan">
              <NoteScheduled
                isScheduled={isScheduled}
                scheduledAt={scheduledAt ?? null}
                onChange={onScheduledChange ?? noop}
              />
            </section>
          </AnimatedPanel>

          {/* Checklist progress */}
          {allChecklistItems.length > 0 && <NoteChecklistProgress items={allChecklistItems} />}

          {/* All blocks */}
          <NoteBlocksRenderer
            blocks={blocks}
            onChecklistChange={handleChecklistChange}
            onTableChange={handleTableChange}
            onMathChange={handleMathChange}
            onUrlPreviewFetched={handleUrlPreviewFetched}
            onRemoveBlock={handleRemoveBlock}
            onToggleBlockVisibility={onToggleBlockVisibility ?? noop}
          />


          {/* URL prompt */}
          <AnimatedPanel show={showUrlPrompt}>
            <UrlPromptBar
              onSubmit={(url) => { onInsertUrlPreview(url); setShowUrlPrompt(false); }}
              onCancel={() => setShowUrlPrompt(false)}
            />
          </AnimatedPanel>

          {/* Format toolbar — selalu terlihat; pada catatan 'plain' klik pertama akan upgrade ke mode kaya */}
          <NoteFormatToolbar
            contentFormat={contentFormat}
            content={content}
            editableRef={contentRef}
            onContentChange={onContentChange}
            className="mb-2"
          />

          {/* Main content */}
          {contentFormat === 'html' ? (
            <NoteRichEditor
              content={content}
              onChange={(html) => onContentChange(html, 'html')}
              editableRef={contentRef as RefObject<HTMLDivElement | null>}
              placeholder="Tulis pikiranmu di sini…"
              className={fontCls}
            />
          ) : (
            <textarea
              ref={contentRef as RefObject<HTMLTextAreaElement | null>}
              value={content}
              onChange={(e) => { onContentChange(e.target.value, 'plain'); autoResize(e.target); }}
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
          )}
        </div>
      </div>

      {/* ── Phase 11: Share Card Dialog ───────────────────────────────── */}
      <NoteShareCard
        note={{
          id: noteId,
          userId: '',
          title,
          content,
          contentFormat,
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
          hiddenSections,
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
