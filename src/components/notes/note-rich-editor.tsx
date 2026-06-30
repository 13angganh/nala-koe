'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeRichHtml } from '@/lib/rich-text';

interface NoteRichEditorProps {
  content: string;
  onChange: (html: string) => void;
  editableRef: RefObject<HTMLDivElement | null>;
  placeholder?: string;
  className?: string;
}

/** Returns true when the editor div contains no visible text. */
function isEditorEmpty(el: HTMLDivElement): boolean {
  return el.textContent?.trim() === '';
}

/**
 * contentEditable surface for notes already upgraded to contentFormat 'html'.
 *
 * Key design decisions:
 * - No dangerouslySetInnerHTML: we set innerHTML imperatively via useLayoutEffect
 *   on mount and only when a genuinely-new external content change arrives.
 *   This prevents React from clobbering the user's live DOM edits on every re-render.
 * - lastEmitted tracks what we most recently called onChange with (what we told
 *   the parent the content is). When the parent hands the same content back to us,
 *   we know it's our own output echoing back — no DOM reset needed.
 * - We compare sanitized versions when deciding if an external update landed, so
 *   harmless whitespace differences don't trigger a spurious DOM reset + cursor jump.
 * - Placeholder is driven by a data-empty attribute updated on every input, so it
 *   works correctly even when the DOM contains an empty <p><br></p>.
 */
export function NoteRichEditor({ content, onChange, editableRef, placeholder, className }: NoteRichEditorProps) {
  const lastEmitted = useRef<string | null>(null);

  // ── Initial mount: set innerHTML synchronously before first paint ─────────
  useLayoutEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    const sanitized = sanitizeRichHtml(content);
    el.innerHTML = sanitized;
    lastEmitted.current = sanitized;
    el.dataset.empty = isEditorEmpty(el) ? 'true' : 'false';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs only on mount

  // ── External content updates (version restore, note swap via key) ─────────
  // Runs only when content prop changes; skips our own emitted-echo updates.
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;

    const sanitized = sanitizeRichHtml(content);

    // Our own output echoing back — skip.
    if (sanitized === lastEmitted.current) return;

    // Format toolbar already applied this content directly to the DOM.
    // Just sync lastEmitted so future comparisons are correct.
    if (sanitized === sanitizeRichHtml(el.innerHTML)) {
      lastEmitted.current = sanitized;
      return;
    }

    // Genuinely new content from an external source — overwrite the DOM.
    el.innerHTML = sanitized;
    lastEmitted.current = sanitized;
    el.dataset.empty = isEditorEmpty(el) ? 'true' : 'false';
  }, [content, editableRef]);

  function handleInput() {
    const el = editableRef.current;
    if (!el) return;
    const html = sanitizeRichHtml(el.innerHTML);
    lastEmitted.current = html;
    el.dataset.empty = isEditorEmpty(el) ? 'true' : 'false';
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
      data-empty="false"
      className={cn(
        'w-full min-h-[240px] outline-none border-none',
        'text-sm text-[var(--text-primary)] leading-relaxed',
        '[&_p]:min-h-[1.5em]',
        // Placeholder: shown when data-empty="true" attribute is set.
        // Uses attr() so the text comes from the data-placeholder prop.
        'data-[empty=true]:before:content-[attr(data-placeholder)]',
        'before:text-[var(--text-tertiary)] before:pointer-events-none',
        className
      )}
    />
  );
}
