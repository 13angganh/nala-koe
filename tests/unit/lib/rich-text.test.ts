import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  plainTextToHtml,
  plainTextToHtmlWithMark,
  plainTextToHtmlWithAlign,
  htmlToMarkdown,
  appendPlainLine,
} from '@/lib/rich-text';

describe('escapeHtml', () => {
  it('escapes &, <, and >', () => {
    expect(escapeHtml('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('hello dunia')).toBe('hello dunia');
  });
});

describe('plainTextToHtml', () => {
  it('wraps each line in a paragraph', () => {
    expect(plainTextToHtml('baris satu\nbaris dua')).toBe('<p>baris satu</p><p>baris dua</p>');
  });

  it('preserves blank lines as <p><br></p>', () => {
    expect(plainTextToHtml('atas\n\nbawah')).toBe('<p>atas</p><p><br></p><p>bawah</p>');
  });

  it('escapes special characters per line', () => {
    expect(plainTextToHtml('5 < 10 & 3 > 1')).toBe('<p>5 &lt; 10 &amp; 3 &gt; 1</p>');
  });
});

describe('plainTextToHtmlWithMark', () => {
  it('wraps only the selected character range in the given mark', () => {
    const html = plainTextToHtmlWithMark('halo dunia', 5, 10, 'strong');
    expect(html).toBe('<p>halo <strong>dunia</strong></p>');
  });

  it('only marks the line that intersects the selection in multi-line text', () => {
    const html = plainTextToHtmlWithMark('baris satu\nbaris dua', 11, 16, 'em');
    expect(html).toBe('<p>baris satu</p><p><em>baris</em> dua</p>');
  });

  it('falls back to a plain conversion when the range is empty', () => {
    expect(plainTextToHtmlWithMark('halo', 2, 2, 'u')).toBe('<p>halo</p>');
  });
});

describe('plainTextToHtmlWithAlign', () => {
  it('applies text-align only to the paragraph containing the cursor', () => {
    const html = plainTextToHtmlWithAlign('baris satu\nbaris dua', 15, 'center');
    expect(html).toBe('<p>baris satu</p><p style="text-align:center">baris dua</p>');
  });

  it('omits the style attribute for left alignment (the default)', () => {
    expect(plainTextToHtmlWithAlign('halo', 0, 'left')).toBe('<p>halo</p>');
  });
});

describe('htmlToMarkdown', () => {
  it('converts strong/em to markdown syntax and paragraphs to newlines', () => {
    const md = htmlToMarkdown('<p>halo <strong>dunia</strong> dan <em>semesta</em></p><p>baris dua</p>');
    expect(md).toBe('halo **dunia** dan *semesta*\nbaris dua');
  });

  it('keeps <u> as raw HTML passthrough since Markdown has no underline syntax', () => {
    expect(htmlToMarkdown('<p><u>garis bawah</u></p>')).toBe('<u>garis bawah</u>');
  });
});

describe('appendPlainLine', () => {
  it('appends with a newline for plain-format content', () => {
    expect(appendPlainLine('halo', 'plain', 'dunia')).toBe('halo\ndunia');
  });

  it('appends as an escaped paragraph for html-format content', () => {
    expect(appendPlainLine('<p>halo</p>', 'html', 'a < b')).toBe('<p>halo</p><p>a &lt; b</p>');
  });

  it('does not prepend a newline when plain content is empty', () => {
    expect(appendPlainLine('', 'plain', 'dunia')).toBe('dunia');
  });
});
