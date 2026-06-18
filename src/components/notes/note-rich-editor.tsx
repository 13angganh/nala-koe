'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeRichHtml } from '@/lib/rich-text';

interface NoteRichEditorProps {
  content: string;
  onChange: (html: string) => void;
  editableRef: RefObject<HTMLDivElement | null>;
  placeholder?: string;
  className?: string;
}

/**
 * contentEditable surface for notes already upgraded to contentFormat 'html'.
 * Deliberately does NOT use document.execCommand for formatting — all format
 * actions live in NoteFormatToolbar / lib/rich-text.ts and mutate the DOM
 * directly via the Selection/Range API. execCommand('insertText', ...) is
 * still used for paste only, a distinct, well-supported, non-deprecated part
 * of that API used purely to keep the native undo stack intact.
 */
export function NoteRichEditor({ content, onChange, editableRef, placeholder, className }: NoteRichEditorProps) {
  const lastEmitted = useRef(content);
  const [initialHtml] = useState(() => (typeof window !== 'undefined' ? sanitizeRichHtml(content) : content));

  // If the note is swapped out from under us (navigating between notes) or an
  // external update lands (e.g. version restore), resync the DOM from props
  // without clobbering the user's own typing.
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (content !== lastEmitted.current && content !== el.innerHTML) {
      el.innerHTML = sanitizeRichHtml(content);
      lastEmitted.current = content;
    }
  }, [content, editableRef]);

  function handleInput() {
    const el = editableRef.current;
    if (!el) return;
    const html = sanitizeRichHtml(el.innerHTML);
    lastEmitted.current = html;
    onChange(html);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    // Insert as plain text only — never let externally-sourced markup into the note.
    if (document.queryCommandSupported?.('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
    }
    handleInput();
  }

  return (
    <div
      ref={editableRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onPaste={handlePaste}
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: initialHtml }}
      className={cn(
        'w-full min-h-[240px] outline-none border-none',
        'text-sm text-[var(--text-primary)] leading-relaxed',
        '[&_p]:min-h-[1.5em]',
        'empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--text-tertiary)]',
        className
      )}
    />
  );
}
