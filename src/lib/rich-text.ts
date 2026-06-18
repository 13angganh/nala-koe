import DOMPurify from 'dompurify';

/**
 * Rich text core helpers.
 *
 * Design constraints (see readme-nala-koe.md Sesi 15):
 * - We deliberately avoid `document.execCommand` for formatting actions (it's
 *   deprecated and produces inconsistent/unpredictable nested markup across
 *   browsers). All inline-mark toggling below is done by hand with the
 *   Selection/Range API instead, against a tightly constrained vocabulary of
 *   tags (p, br, strong, em, u) so the resulting DOM stays predictable.
 * - `content` for a note upgraded to contentFormat 'html' is always sanitized
 *   via sanitizeRichHtml() before it's persisted.
 */

export type InlineMark = 'strong' | 'em' | 'u';
export type BlockAlign = 'left' | 'center' | 'right' | 'justify';

const ALLOWED_TAGS = ['p', 'div', 'br', 'strong', 'em', 'u'];
const ALIGN_VALUES: ReadonlySet<string> = new Set(['left', 'center', 'right', 'justify']);

let hookRegistered = false;

/** Strict allowlist sanitizer for rich note content. Browser-only (no-op server-side). */
export function sanitizeRichHtml(html: string): string {
  if (typeof window === 'undefined') return html;

  if (!hookRegistered) {
    // Only ever allow a bare `text-align` declaration through the style attribute —
    // strips anything else (position, url(), behavior, etc.) for defense in depth.
    DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
      if (data.attrName !== 'style') return;
      const match = /text-align\s*:\s*(left|center|right|justify)/i.exec(data.attrValue);
      const value = match?.[1];
      data.attrValue = value ? `text-align:${value.toLowerCase()}` : '';
    });
    hookRegistered = true;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['style'],
    ALLOW_DATA_ATTR: false,
  });
}

/** Escape text for safe insertion into an HTML string (not for attributes). */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Convert legacy plain-text content into paragraph HTML, one <p> per line. */
export function plainTextToHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
    .join('');
}

/**
 * Convert plain text into paragraph HTML while wrapping a character range
 * (e.g. the user's current textarea selection) in an inline mark — used the
 * moment a 'plain' note is upgraded to 'html' by clicking a format button
 * with text already selected, so the format applies immediately with no
 * extra click.
 */
export function plainTextToHtmlWithMark(
  text: string,
  startOffset: number,
  endOffset: number,
  mark: InlineMark
): string {
  if (startOffset >= endOffset) return plainTextToHtml(text);
  let consumed = 0;
  return text
    .split('\n')
    .map((line) => {
      const lineStart = consumed;
      const lineEnd = consumed + line.length;
      consumed = lineEnd + 1; // account for the '\n'
      const markStart = Math.max(startOffset, lineStart);
      const markEnd = Math.min(endOffset, lineEnd);
      if (markStart >= markEnd) return `<p>${escapeHtml(line) || '<br>'}</p>`;
      const before = escapeHtml(line.slice(0, markStart - lineStart));
      const marked = escapeHtml(line.slice(markStart - lineStart, markEnd - lineStart));
      const after = escapeHtml(line.slice(markEnd - lineStart));
      return `<p>${before}<${mark}>${marked}</${mark}>${after}</p>`;
    })
    .join('');
}

/** Same upgrade path as above, but for an alignment action (applies to one paragraph). */
export function plainTextToHtmlWithAlign(
  text: string,
  cursorOffset: number,
  align: BlockAlign
): string {
  let consumed = 0;
  return text
    .split('\n')
    .map((line) => {
      const lineStart = consumed;
      const lineEnd = consumed + line.length;
      consumed = lineEnd + 1;
      const isTarget = cursorOffset >= lineStart && cursorOffset <= lineEnd;
      const style = isTarget && align !== 'left' ? ` style="text-align:${align}"` : '';
      return `<p${style}>${escapeHtml(line) || '<br>'}</p>`;
    })
    .join('');
}

/**
 * Convert our constrained rich-text HTML vocabulary (p/br/strong/em/u) into
 * Markdown. Underline has no native Markdown syntax, so raw <u> tags are left
 * as-is — valid inline HTML passthrough per CommonMark, rendered correctly by
 * GitHub/most viewers, and far better than silently dropping the formatting.
 */
export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .trim();
}

/** Append a plain line of text to note content regardless of its current format (used for e.g. inserting a barcode-scan result). */
export function appendPlainLine(content: string, format: 'plain' | 'html', line: string): string {
  if (format === 'html') return `${content}<p>${escapeHtml(line)}</p>`;
  return content ? `${content}\n${line}` : line;
}

// ─── Selection helpers (browser-only; called from event handlers) ─────────────

function closestWithin(node: Node | null, root: HTMLElement, predicate: (el: HTMLElement) => boolean): HTMLElement | null {
  let el: HTMLElement | null = node && node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement | null);
  while (el && el !== root) {
    if (predicate(el)) return el;
    el = el.parentElement;
  }
  return null;
}

/** The root's direct child block (e.g. a <p>) that contains `node`, if any. */
export function getBlockAncestor(node: Node | null, root: HTMLElement): HTMLElement | null {
  let el: Node | null = node;
  if (!el) return null;
  if (el.nodeType === Node.TEXT_NODE) el = el.parentElement;
  while (el && el !== root) {
    if ((el as HTMLElement).parentElement === root) return el as HTMLElement;
    el = (el as HTMLElement).parentElement;
  }
  return null;
}

/** Is the given inline mark active for the current selection (used to highlight toolbar buttons and decide wrap vs unwrap)? */
export function isMarkActive(root: HTMLElement, mark: InlineMark): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;
  const probeNode = range.collapsed ? range.startContainer : range.commonAncestorContainer;
  return closestWithin(probeNode, root, (el) => el.tagName.toLowerCase() === mark) !== null;
}

/** Current text-align of the block containing the selection anchor ('left' if unset). */
export function getActiveAlign(root: HTMLElement): BlockAlign {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 'left';
  const block = getBlockAncestor(selection.anchorNode, root);
  const value = block?.style.textAlign;
  return value && ALIGN_VALUES.has(value) ? (value as BlockAlign) : 'left';
}

/** Remove every instance of `tagName` found inside a fragment, keeping its children in place. */
function unwrapTagInFragment(frag: DocumentFragment, tagName: string): void {
  const matches = frag.querySelectorAll(tagName);
  matches.forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });
}

function wrapSubRangeInMark(range: Range, mark: InlineMark): void {
  if (range.collapsed) return;
  const frag = range.extractContents();
  const wrapper = document.createElement(mark);
  wrapper.appendChild(frag);
  range.insertNode(wrapper);
}

function unwrapSubRange(range: Range, mark: InlineMark): void {
  if (range.collapsed) return;
  const frag = range.extractContents();
  unwrapTagInFragment(frag, mark);
  range.insertNode(frag);
}

/**
 * Toggle an inline mark (bold/italic/underline) on the current selection.
 * Splits the operation per top-level block when the selection spans more
 * than one paragraph, so we never end up with an inline tag wrapping a
 * block-level element.
 * Returns true if a change was applied.
 */
export function toggleInlineMark(root: HTMLElement, mark: InlineMark): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;

  const active = isMarkActive(root, mark);
  const startBlock = getBlockAncestor(range.startContainer, root);
  const endBlock = getBlockAncestor(range.endContainer, root);

  const apply = active ? unwrapSubRange : wrapSubRangeInMark;

  if (!startBlock || !endBlock || startBlock === endBlock) {
    apply(range, mark);
  } else {
    // Multi-paragraph selection: process one block at a time, start to end.
    const blocks: HTMLElement[] = [];
    let cur: HTMLElement | null = startBlock;
    while (cur) {
      blocks.push(cur);
      if (cur === endBlock) break;
      cur = cur.nextElementSibling as HTMLElement | null;
    }
    const startOffset = range.startOffset;
    const startContainer = range.startContainer;
    const endOffset = range.endOffset;
    const endContainer = range.endContainer;
    blocks.forEach((block) => {
      const subRange = document.createRange();
      subRange.setStart(block === startBlock ? startContainer : block, block === startBlock ? startOffset : 0);
      subRange.setEnd(block === endBlock ? endContainer : block, block === endBlock ? endOffset : block.childNodes.length);
      apply(subRange, mark);
    });
  }

  selection.removeAllRanges();
  return true;
}

/** Apply text-align to every paragraph the selection touches. */
export function setBlockAlign(root: HTMLElement, align: BlockAlign): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return false;

  const startBlock = getBlockAncestor(range.startContainer, root);
  const endBlock = getBlockAncestor(range.endContainer, root) ?? startBlock;
  if (!startBlock) return false;

  let cur: HTMLElement | null = startBlock;
  while (cur) {
    if (align === 'left') cur.style.removeProperty('text-align');
    else cur.style.textAlign = align;
    if (cur === endBlock) break;
    cur = cur.nextElementSibling as HTMLElement | null;
  }
  return true;
}
