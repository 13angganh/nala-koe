'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Copy, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteEditor } from '@/components/notes/note-editor';
import { useNoteEditor } from '@/hooks/use-note-editor';
import { useArchiveNote, useDuplicateNote } from '@/hooks/use-notes';
import { getNoteSizeInfo } from '@/services/notes.service';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export default function NotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const noteId = params.id;

  const {
    note,
    isLoading,
    isError,
    isSaving,
    isDirty,
    wordCount,
    readingTimeMinutes,
    // Phase 3
    handleTitleChange,
    handleContentChange,
    handleBlocksChange,
    handleManualSave,
    handleTogglePin,
    handleMoodChange,
    handleTagsChange,
    handleWeatherChange,
    handleLocationChange,
    // Phase 4
    handleFontChange,
    handleTextureChange,
    handleLinkedNotesChange,
    handleInsertTable,
    handleInsertMath,
    handleInsertUrlPreview,
    // Phase 6
    handleTimeCapsuleChange,
    handleSecretChange,
    // Phase 8
    handleReactionChange,
    handleHighlightsChange,
    handleToggleSectionVisibility,
    handleToggleBlockVisibility,
    // Phase 9
    handleScheduledChange,
  } = useNoteEditor(noteId);

  const archiveMutation = useArchiveNote();
  const duplicateMutation = useDuplicateNote();
  const sizeInfo = note ? getNoteSizeInfo(note) : undefined;

  // Tampilkan skeleton saat pertama kali load — menghindari flash kosong
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100dvh-3.5rem)] animate-pulse">
        <div className="h-10 border-b border-[var(--border)] bg-[var(--surface-subtle)]" />
        <div className="flex-1 mx-auto w-full max-w-2xl px-6 py-8 space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-[var(--surface-muted)]" />
          <div className="h-4 w-full rounded bg-[var(--surface-muted)]" />
          <div className="h-4 w-5/6 rounded bg-[var(--surface-muted)]" />
          <div className="h-4 w-4/6 rounded bg-[var(--surface-muted)]" />
        </div>
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--error-subtle)]">
          <AlertCircle className="h-6 w-6 text-[var(--error)]" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-[var(--text-primary)]">Catatan tidak ditemukan</p>
          <p className="text-sm text-[var(--text-tertiary)]">
            Catatan ini tidak ada atau kamu tidak memiliki akses.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.NOTES)}>
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Kembali ke catatan
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', 'h-[calc(100dvh-3.5rem)]')}>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--surface-base)] shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.NOTES)}
          className="gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Catatan
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => note && duplicateMutation.mutate(note.id)}
          aria-label="Duplikat catatan"
          isLoading={duplicateMutation.isPending}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => note && archiveMutation.mutate(note.id)}
          aria-label="Arsipkan catatan"
          isLoading={archiveMutation.isPending}
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Editor — Phase 7 props */}
      <NoteEditor
        key={note.id}
        noteId={note.id}
        title={note.title}
        content={note.content}
        contentFormat={note.contentFormat}
        blocks={note.blocks}
        isPinned={note.isPinned}
        isSaving={isSaving}
        isDirty={isDirty}
        wordCount={wordCount}
        readingTimeMinutes={readingTimeMinutes}
        mood={note.mood}
        tags={note.tags}
        language={note.language}
        fontWeight={note.fontWeight}
        texture={note.texture}
        linkedNoteIds={note.linkedNoteIds}
        onTitleChange={handleTitleChange}
        onContentChange={handleContentChange}
        onBlocksChange={handleBlocksChange}
        onTogglePin={handleTogglePin}
        onSave={handleManualSave}
        onMoodChange={handleMoodChange}
        onTagsChange={handleTagsChange}
        onFontChange={handleFontChange}
        onTextureChange={handleTextureChange}
        onLinkedNotesChange={handleLinkedNotesChange}
        onInsertTable={handleInsertTable}
        onInsertMath={handleInsertMath}
        onInsertUrlPreview={handleInsertUrlPreview}
        onWeatherChange={handleWeatherChange}
        onLocationChange={handleLocationChange}
        weather={note.weather}
        location={note.location}
        isSecret={note.isSecret}
        isTimeCapsule={note.isTimeCapsule}
        timeCapsuleUnlockAt={note.timeCapsuleUnlockAt}
        onTimeCapsuleChange={handleTimeCapsuleChange}
        onSecretChange={handleSecretChange}
        onDuplicate={() => duplicateMutation.mutate(note.id)}
        onArchive={() => archiveMutation.mutate(note.id)}
        onReactionChange={handleReactionChange}
        onHighlightsChange={handleHighlightsChange}
        onScheduledChange={handleScheduledChange}
        isScheduled={note.isScheduled}
        scheduledAt={note.scheduledAt}
        reaction={note.reaction}
        hiddenSections={note.hiddenSections}
        onToggleSectionVisibility={handleToggleSectionVisibility}
        onToggleBlockVisibility={handleToggleBlockVisibility}
        className="flex-1 min-h-0"
        {...(note.highlights != null ? { highlights: note.highlights } : {})}
        {...(sizeInfo != null ? { sizeInfo } : {})}
      />
    </div>
  );
}
