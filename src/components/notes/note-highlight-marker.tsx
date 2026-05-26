'use client';

import { useState, useRef, useCallback } from 'react';
import { Highlighter, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { addHighlight, removeHighlight } from '@/services/highlights.service';
import { useAuthStore } from '@/stores/auth.store';
import { isOk } from '@/lib/normalizer';
import type { NoteHighlight } from '@/types/note.types';

interface NoteHighlightMarkerProps {
  noteId: string;
  content: string;
  highlights: NoteHighlight[];
  onHighlightsChange?: (highlights: NoteHighlight[]) => void;
  className?: string;
}

// Returns segments of text split by highlight ranges, sorted by offset
function buildSegments(
  content: string,
  highlights: NoteHighlight[]
): { text: string; highlight: NoteHighlight | null; index: number }[] {
  if (!highlights.length) {
    return [{ text: content, highlight: null, index: 0 }];
  }

  // Sort highlights by start offset
  const sorted = [...highlights].sort((a, b) => a.startOffset - b.startOffset);

  const segments: { text: string; highlight: NoteHighlight | null; index: number }[] = [];
  let cursor = 0;
  let idx = 0;

  for (const hl of sorted) {
    if (hl.startOffset > cursor) {
      segments.push({ text: content.slice(cursor, hl.startOffset), highlight: null, index: idx++ });
    }
    segments.push({
      text: content.slice(hl.startOffset, hl.endOffset),
      highlight: hl,
      index: idx++,
    });
    cursor = hl.endOffset;
  }

  if (cursor < content.length) {
    segments.push({ text: content.slice(cursor), highlight: null, index: idx++ });
  }

  return segments;
}

export function NoteHighlightMarker({
  noteId,
  content,
  highlights,
  onHighlightsChange,
  className,
}: NoteHighlightMarkerProps) {
  const { user } = useAuthStore();
  const [isPending, setIsPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTextSelect = useCallback(async () => {
    if (!user || isPending) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    // Compute offsets relative to full content string
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) return;

    // Walk text nodes to compute absolute offset
    let startOffset = 0;
    let endOffset = 0;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let charCount = 0;
    let startFound = false;

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const nodeLen = node.textContent?.length ?? 0;

      if (!startFound && node === range.startContainer) {
        startOffset = charCount + range.startOffset;
        startFound = true;
      }
      if (node === range.endContainer) {
        endOffset = charCount + range.endOffset;
        break;
      }
      charCount += nodeLen;
    }

    if (endOffset <= startOffset) return;

    setIsPending(true);
    try {
      const result = await addHighlight(noteId, user.uid, selectedText, startOffset, endOffset);
      if (isOk(result)) {
        onHighlightsChange?.([...highlights, result.data]);
        toast.success('Teks di-highlight');
        selection.removeAllRanges();
      } else {
        toast.error(result.error.message);
      }
    } finally {
      setIsPending(false);
    }
  }, [user, isPending, noteId, highlights, onHighlightsChange]);

  const handleRemoveHighlight = useCallback(
    async (highlightId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user || isPending) return;

      setIsPending(true);
      try {
        const result = await removeHighlight(noteId, user.uid, highlightId);
        if (isOk(result)) {
          onHighlightsChange?.(highlights.filter((h) => h.id !== highlightId));
          toast.success('Highlight dihapus');
        } else {
          toast.error('Gagal menghapus highlight');
        }
      } finally {
        setIsPending(false);
      }
    },
    [user, isPending, noteId, highlights, onHighlightsChange]
  );

  const segments = buildSegments(content, highlights);

  return (
    <div className={cn('relative group', className)}>
      {/* Highlight instruction banner */}
      <div className="mb-2 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
        <Highlighter className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Pilih teks lalu lepas untuk meng-highlight</span>
      </div>

      {/* Rendered text with highlights */}
      <div
        ref={containerRef}
        onMouseUp={handleTextSelect}
        className={cn(
          'text-sm leading-relaxed text-[var(--text-primary)] select-text',
          'rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4',
          isPending && 'opacity-70'
        )}
      >
        {segments.map(({ text, highlight, index }) =>
          highlight ? (
            <mark
              key={index}
              className={cn(
                'relative inline cursor-pointer rounded-sm px-0.5',
                'bg-amber-200/70 dark:bg-amber-400/30 text-[var(--text-primary)]',
                'ring-1 ring-amber-300 dark:ring-amber-500/40',
                'group/mark'
              )}
              title={`Highlight — klik untuk hapus`}
            >
              {text}
              <button
                type="button"
                onClick={(e) => handleRemoveHighlight(highlight.id, e)}
                aria-label="Hapus highlight"
                className={cn(
                  'absolute -top-2.5 -right-2 z-10',
                  'hidden group-hover/mark:inline-flex',
                  'h-4 w-4 items-center justify-center rounded-full',
                  'bg-[var(--surface-base)] border border-[var(--border)]',
                  'text-[var(--text-tertiary)] hover:text-[var(--error)]',
                  'transition-colors duration-100'
                )}
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </mark>
          ) : (
            <span key={index}>{text}</span>
          )
        )}
      </div>

      {highlights.length > 0 && (
        <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
          {highlights.length} highlight aktif
        </p>
      )}
    </div>
  );
}
