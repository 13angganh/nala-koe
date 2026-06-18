'use client';

import { useState, useCallback, useEffect, type RefObject } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  toggleInlineMark,
  setBlockAlign,
  isMarkActive,
  getActiveAlign,
  plainTextToHtmlWithMark,
  plainTextToHtmlWithAlign,
  sanitizeRichHtml,
  type InlineMark,
  type BlockAlign,
} from '@/lib/rich-text';

interface NoteFormatToolbarProps {
  contentFormat: 'plain' | 'html';
  content: string;
  /** Ref to the live editable element — a <textarea> in 'plain' mode, a contentEditable <div> in 'html' mode. */
  editableRef: RefObject<HTMLTextAreaElement | HTMLDivElement | null>;
  onContentChange: (content: string, contentFormat: 'plain' | 'html') => void;
  className?: string;
}

const MARK_BUTTONS: { mark: InlineMark; icon: typeof Bold; label: string }[] = [
  { mark: 'strong', icon: Bold, label: 'Tebal' },
  { mark: 'em', icon: Italic, label: 'Miring' },
  { mark: 'u', icon: Underline, label: 'Garis bawah' },
];

const ALIGN_BUTTONS: { align: BlockAlign; icon: typeof AlignLeft; label: string }[] = [
  { align: 'left', icon: AlignLeft, label: 'Rata kiri' },
  { align: 'center', icon: AlignCenter, label: 'Rata tengah' },
  { align: 'right', icon: AlignRight, label: 'Rata kanan' },
  { align: 'justify', icon: AlignJustify, label: 'Rata kiri-kanan' },
];

const EMPTY_ACTIVE: Record<InlineMark, boolean> = { strong: false, em: false, u: false };

export function NoteFormatToolbar({
  contentFormat,
  content,
  editableRef,
  onContentChange,
  className,
}: NoteFormatToolbarProps) {
  const [activeMarks, setActiveMarks] = useState<Record<InlineMark, boolean>>(EMPTY_ACTIVE);
  const [activeAlign, setActiveAlign] = useState<BlockAlign>('left');

  const recomputeActiveState = useCallback(() => {
    if (contentFormat !== 'html') return;
    const root = editableRef.current;
    if (!root || !(root instanceof HTMLDivElement)) return;
    setActiveMarks({
      strong: isMarkActive(root, 'strong'),
      em: isMarkActive(root, 'em'),
      u: isMarkActive(root, 'u'),
    });
    setActiveAlign(getActiveAlign(root));
  }, [contentFormat, editableRef]);

  // Keep toolbar highlighting in sync with the caret/selection while editing.
  useEffect(() => {
    if (contentFormat !== 'html') return;
    document.addEventListener('selectionchange', recomputeActiveState);
    return () => document.removeEventListener('selectionchange', recomputeActiveState);
  }, [contentFormat, recomputeActiveState]);

  const getTextareaSelection = useCallback((): { start: number; end: number } | null => {
    const el = editableRef.current;
    if (!el || !(el instanceof HTMLTextAreaElement)) return null;
    return { start: el.selectionStart, end: el.selectionEnd };
  }, [editableRef]);

  const applyMark = useCallback(
    (mark: InlineMark) => {
      if (contentFormat === 'plain') {
        const sel = getTextareaSelection();
        if (!sel || sel.start === sel.end) return; // butuh seleksi teks dulu
        const html = sanitizeRichHtml(plainTextToHtmlWithMark(content, sel.start, sel.end, mark));
        onContentChange(html, 'html');
        return;
      }
      const root = editableRef.current;
      if (!root || !(root instanceof HTMLDivElement)) return;
      const changed = toggleInlineMark(root, mark);
      if (changed) {
        onContentChange(sanitizeRichHtml(root.innerHTML), 'html');
        recomputeActiveState();
      }
    },
    [contentFormat, content, editableRef, getTextareaSelection, onContentChange, recomputeActiveState]
  );

  const applyAlign = useCallback(
    (align: BlockAlign) => {
      if (contentFormat === 'plain') {
        const sel = getTextareaSelection();
        const cursor = sel?.start ?? content.length;
        const html = sanitizeRichHtml(plainTextToHtmlWithAlign(content, cursor, align));
        onContentChange(html, 'html');
        return;
      }
      const root = editableRef.current;
      if (!root || !(root instanceof HTMLDivElement)) return;
      const changed = setBlockAlign(root, align);
      if (changed) {
        onContentChange(sanitizeRichHtml(root.innerHTML), 'html');
        recomputeActiveState();
      }
    },
    [contentFormat, content, editableRef, getTextareaSelection, onContentChange, recomputeActiveState]
  );

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-1',
        className
      )}
      role="toolbar"
      aria-label="Format teks"
    >
      {MARK_BUTTONS.map(({ mark, icon: Icon, label }) => (
        <button
          key={mark}
          type="button"
          aria-label={label}
          aria-pressed={activeMarks[mark]}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyMark(mark)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
            activeMarks[mark] && 'bg-[var(--surface-emphasis)] text-[var(--text-primary)]'
          )}
        >
          <Icon size={14} aria-hidden="true" />
        </button>
      ))}
      <div className="mx-1 h-4 w-px bg-[var(--border)]" aria-hidden="true" />
      {ALIGN_BUTTONS.map(({ align, icon: Icon, label }) => (
        <button
          key={align}
          type="button"
          aria-label={label}
          aria-pressed={activeAlign === align}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => applyAlign(align)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
            activeAlign === align && 'bg-[var(--surface-emphasis)] text-[var(--text-primary)]'
          )}
        >
          <Icon size={14} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
