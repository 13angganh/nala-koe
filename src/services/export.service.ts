/**
 * Export Service — Phase 10
 * Supports: TXT, Markdown, PDF, DOCX, XLSX, JSON (backup)
 * Bulk export via ZIP (JSZip)
 */

import type { Note, NoteContentBlock } from '@/types/note.types';
import type { ExportFormat, ExportOptions } from '@/types/import-export.types';
import { logger } from '@/lib/logger';
import { MOOD_MAP } from '@/constants/moods';
import { stripHtml } from '@/lib/utils';
import { htmlToMarkdown } from '@/lib/rich-text';

/** note.content as Markdown — converts our HTML formatting vocabulary, or passes plain text through unchanged. */
function noteBodyAsMarkdown(note: Note): string {
  return note.contentFormat === 'html' ? htmlToMarkdown(note.content) : note.content;
}

/** note.content as plain text — strips formatting entirely (TXT/PDF/DOCX bodies, CSV/XLSX cells). */
function noteBodyAsPlainText(note: Note): string {
  return note.contentFormat === 'html' ? stripHtml(note.content) : note.content;
}

// ─── Text Helpers ────────────────────────────────────────────────────────────

function blocksToPlainText(blocks: NoteContentBlock[]): string {
  return blocks
    .sort((a, b) => a.order - b.order)
    .map((b) => {
      if (b.type === 'paragraph') return b.content;
      if (b.type === 'checklist') {
        try {
          const items = JSON.parse(b.content) as Array<{ text: string; isChecked: boolean }>;
          return items.map((i) => `[${i.isChecked ? 'x' : ' '}] ${i.text}`).join('\n');
        } catch {
          return b.content;
        }
      }
      if (b.type === 'table') {
        try {
          const { rows } = JSON.parse(b.content) as { rows: string[][] };
          return rows.map((r) => r.join('\t')).join('\n');
        } catch {
          return b.content;
        }
      }
      if (b.type === 'math') return `= ${b.content}`;
      if (b.type === 'url-preview') {
        try {
          const { url, title } = JSON.parse(b.content) as { url: string; title?: string };
          return title ? `${title} (${url})` : url;
        } catch {
          return b.content;
        }
      }
      return b.content;
    })
    .join('\n\n');
}

function blocksToMarkdown(blocks: NoteContentBlock[]): string {
  return blocks
    .sort((a, b) => a.order - b.order)
    .map((b) => {
      if (b.type === 'paragraph') return b.content;
      if (b.type === 'checklist') {
        try {
          const items = JSON.parse(b.content) as Array<{ text: string; isChecked: boolean }>;
          return items.map((i) => `- [${i.isChecked ? 'x' : ' '}] ${i.text}`).join('\n');
        } catch {
          return b.content;
        }
      }
      if (b.type === 'table') {
        try {
          const { rows } = JSON.parse(b.content) as { rows: string[][] };
          if (rows.length === 0 || !rows[0]) return '';
          const header = `| ${rows[0].join(' | ')} |`;
          const divider = `| ${rows[0].map(() => '---').join(' | ')} |`;
          const body = rows.slice(1).map((r) => `| ${r.join(' | ')} |`).join('\n');
          return [header, divider, body].filter(Boolean).join('\n');
        } catch {
          return b.content;
        }
      }
      if (b.type === 'math') return `\`= ${b.content}\``;
      if (b.type === 'url-preview') {
        try {
          const { url, title } = JSON.parse(b.content) as { url: string; title?: string };
          return title ? `[${title}](${url})` : url;
        } catch {
          return b.content;
        }
      }
      return b.content;
    })
    .join('\n\n');
}

function noteToMarkdownString(note: Note, opts: ExportOptions): string {
  const lines: string[] = [];
  lines.push(`# ${note.title || 'Tanpa Judul'}`);
  lines.push('');

  if (opts.includeMetadata) {
    lines.push(`> Dibuat: ${new Date(note.createdAt).toLocaleString('id-ID')}`);
    lines.push(`> Diperbarui: ${new Date(note.updatedAt).toLocaleString('id-ID')}`);
    if (note.wordCount) lines.push(`> Kata: ${note.wordCount}`);
  }
  if (opts.includeMood && note.mood) {
    const mood = MOOD_MAP[note.mood];
    lines.push(`> Mood: ${mood?.label ?? note.mood}`);
  }
  if (opts.includeTags && note.tags.length > 0) {
    lines.push(`> Tag: ${note.tags.join(', ')}`);
  }
  if (opts.includeMetadata || opts.includeMood || opts.includeTags) lines.push('');

  lines.push(blocksToMarkdown(note.blocks.length > 0 ? note.blocks : []));
  if (note.blocks.length === 0 && note.content) lines.push(noteBodyAsMarkdown(note));

  return lines.join('\n');
}

function noteToTxtString(note: Note, opts: ExportOptions): string {
  const lines: string[] = [];
  lines.push(note.title || 'Tanpa Judul');
  lines.push('─'.repeat(40));

  if (opts.includeMetadata) {
    lines.push(`Dibuat: ${new Date(note.createdAt).toLocaleString('id-ID')}`);
    lines.push(`Diperbarui: ${new Date(note.updatedAt).toLocaleString('id-ID')}`);
  }
  if (opts.includeMood && note.mood) {
    const mood = MOOD_MAP[note.mood];
    lines.push(`Mood: ${mood?.label ?? note.mood}`);
  }
  if (opts.includeTags && note.tags.length > 0) {
    lines.push(`Tag: ${note.tags.join(', ')}`);
  }
  lines.push('');
  lines.push(blocksToPlainText(note.blocks.length > 0 ? note.blocks : []));
  if (note.blocks.length === 0 && note.content) lines.push(noteBodyAsPlainText(note));

  return lines.join('\n');
}

// ─── Single Note Exporters ───────────────────────────────────────────────────

export function exportNoteAsTxt(note: Note, opts: ExportOptions): Blob {
  const text = noteToTxtString(note, opts);
  return new Blob([text], { type: 'text/plain;charset=utf-8' });
}

export function exportNoteAsMarkdown(note: Note, opts: ExportOptions): Blob {
  const text = noteToMarkdownString(note, opts);
  return new Blob([text], { type: 'text/markdown;charset=utf-8' });
}

export function exportNoteAsJson(note: Note): Blob {
  return new Blob([JSON.stringify(note, null, 2)], { type: 'application/json' });
}

// ─── Bulk Exporters ──────────────────────────────────────────────────────────

export function exportNotesAsJson(notes: Note[]): Blob {
  const backup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    count: notes.length,
    notes,
  };
  return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
}

export function exportNotesAsMarkdown(notes: Note[], opts: ExportOptions): Blob {
  const combined = notes
    .map((n) => noteToMarkdownString(n, opts))
    .join('\n\n---\n\n');
  return new Blob([combined], { type: 'text/markdown;charset=utf-8' });
}

export function exportNotesAsTxt(notes: Note[], opts: ExportOptions): Blob {
  const combined = notes
    .map((n) => noteToTxtString(n, opts))
    .join('\n\n' + '═'.repeat(50) + '\n\n');
  return new Blob([combined], { type: 'text/plain;charset=utf-8' });
}

// ─── XLSX Export ─────────────────────────────────────────────────────────────

export async function exportNotesAsXlsx(notes: Note[], opts: ExportOptions): Promise<Blob> {
  // Dynamic import to avoid SSR issues
  const XLSX = await import('xlsx');

  const rows = notes.map((n) => {
    const row: Record<string, string | number> = {
      ID: n.id,
      Judul: n.title || 'Tanpa Judul',
      Konten: n.blocks.length > 0 ? blocksToPlainText(n.blocks) : noteBodyAsPlainText(n),
    };
    if (opts.includeMood) {
      row['Mood'] = n.mood ? (MOOD_MAP[n.mood]?.label ?? n.mood) : '-';
    }
    if (opts.includeTags) {
      row['Tag'] = n.tags.join(', ') || '-';
    }
    if (opts.includeMetadata) {
      row['Kata'] = n.wordCount ?? 0;
      row['Dibuat'] = new Date(n.createdAt).toLocaleString('id-ID');
      row['Diperbarui'] = new Date(n.updatedAt).toLocaleString('id-ID');
      row['Status'] = n.status;
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'NalaKoe');

  // Auto column widths
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key] ?? '').slice(0, 50).length)),
  }));
  ws['!cols'] = colWidths;

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

export async function exportNotesAsPdf(notes: Note[], opts: ExportOptions): Promise<Blob> {
  const jsPDF = (await import('jspdf')).default;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed = 8) => {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  notes.forEach((note, idx) => {
    if (idx > 0) {
      doc.addPage();
      y = margin;
    }

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(note.title || 'Tanpa Judul', maxW) as string[];
    titleLines.forEach((line: string) => {
      checkPage();
      doc.text(line, margin, y);
      y += 8;
    });

    // Metadata
    if (opts.includeMetadata || opts.includeMood || opts.includeTags) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);

      if (opts.includeMetadata) {
        checkPage();
        doc.text(`Dibuat: ${new Date(note.createdAt).toLocaleString('id-ID')}`, margin, y);
        y += 5;
      }
      if (opts.includeMood && note.mood) {
        checkPage();
        doc.text(`Mood: ${MOOD_MAP[note.mood]?.label ?? note.mood}`, margin, y);
        y += 5;
      }
      if (opts.includeTags && note.tags.length > 0) {
        checkPage();
        doc.text(`Tag: ${note.tags.join(', ')}`, margin, y);
        y += 5;
      }
      doc.setTextColor(30, 30, 30);
      y += 2;
    }

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    // Content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const body = note.blocks.length > 0 ? blocksToPlainText(note.blocks) : noteBodyAsPlainText(note);
    const contentLines = doc.splitTextToSize(body, maxW) as string[];
    contentLines.forEach((line: string) => {
      checkPage();
      doc.text(line, margin, y);
      y += 6;
    });
  });

  return doc.output('blob');
}

// ─── DOCX Export ─────────────────────────────────────────────────────────────

export async function exportNotesAsDocx(notes: Note[], opts: ExportOptions): Promise<Blob> {
  const {
    Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer,
  } = await import('docx');

  const children: InstanceType<typeof Paragraph>[] = [];

  notes.forEach((note, idx) => {
    if (idx > 0) {
      // Page break between notes
      children.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [],
        })
      );
    }

    // Title
    children.push(
      new Paragraph({
        text: note.title || 'Tanpa Judul',
        heading: HeadingLevel.HEADING_1,
      })
    );

    // Metadata
    if (opts.includeMetadata) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Dibuat: ${new Date(note.createdAt).toLocaleString('id-ID')}`,
              color: '888888',
              size: 18,
            }),
          ],
        })
      );
    }
    if (opts.includeMood && note.mood) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Mood: ${MOOD_MAP[note.mood]?.label ?? note.mood}`,
              color: '888888',
              size: 18,
            }),
          ],
        })
      );
    }
    if (opts.includeTags && note.tags.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Tag: ${note.tags.join(', ')}`,
              color: '888888',
              size: 18,
            }),
          ],
        })
      );
    }

    // Spacer
    children.push(new Paragraph({ children: [] }));

    // Content paragraphs
    const body = note.blocks.length > 0 ? blocksToPlainText(note.blocks) : noteBodyAsPlainText(note);
    body.split('\n').forEach((line) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line })],
          alignment: AlignmentType.LEFT,
        })
      );
    });
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22 },
        },
      },
    },
    sections: [{ children }],
  });

  const buf = await Packer.toBlob(doc);
  return buf;
}

// ─── ZIP Bulk Export ─────────────────────────────────────────────────────────

export async function exportNotesAsZip(notes: Note[], opts: ExportOptions): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: folder name is hardcoded string, JSZip.folder() only returns null for empty string
  const folder = zip.folder('nalakoe-export')!;

  for (const note of notes) {
    const safeTitle = (note.title || `note-${note.id}`)
      .replace(/[/\\:*?"<>|]/g, '-')
      .slice(0, 60);

    if (opts.format === 'txt') {
      folder.file(`${safeTitle}.txt`, noteToTxtString(note, opts));
    } else if (opts.format === 'markdown') {
      folder.file(`${safeTitle}.md`, noteToMarkdownString(note, opts));
    } else if (opts.format === 'json') {
      folder.file(`${safeTitle}.json`, JSON.stringify(note, null, 2));
    }
  }

  return zip.generateAsync({ type: 'blob' });
}

// ─── Download Trigger ────────────────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  logger.info('[export] Downloaded', filename);
}

export function buildExportFilename(
  format: ExportFormat,
  count: number,
  title?: string
): string {
  const ext: Record<ExportFormat, string> = {
    txt: 'txt',
    markdown: 'md',
    pdf: 'pdf',
    docx: 'docx',
    xlsx: 'xlsx',
    json: 'json',
  };
  const date = new Date().toISOString().slice(0, 10);
  if (title && count === 1) {
    const safe = title.replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '-').slice(0, 50);
    return `nalakoe-${safe}-${date}.${ext[format]}`;
  }
  return `nalakoe-export-${count}notes-${date}.${ext[format]}`;
}
