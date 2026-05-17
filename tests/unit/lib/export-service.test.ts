import { describe, it, expect } from 'vitest';
import { buildExportFilename } from '@/services/export.service';

describe('buildExportFilename', () => {
  it('builds filename for single note with title', () => {
    const filename = buildExportFilename('markdown', 1, 'My Note');
    expect(filename).toMatch(/^nalakoe-My-Note-\d{4}-\d{2}-\d{2}\.md$/);
  });

  it('builds filename for bulk export', () => {
    const filename = buildExportFilename('xlsx', 42);
    expect(filename).toMatch(/^nalakoe-export-42notes-\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  it('uses correct extension for each format', () => {
    const formats = ['txt', 'markdown', 'pdf', 'docx', 'xlsx', 'json'] as const;
    const exts = ['txt', 'md', 'pdf', 'docx', 'xlsx', 'json'];
    formats.forEach((fmt, i) => {
      const fn = buildExportFilename(fmt, 1);
      expect(fn).toMatch(new RegExp(`\\.${exts[i]}$`));
    });
  });

  it('sanitizes title — removes forbidden chars', () => {
    const filename = buildExportFilename('txt', 1, 'Note: My/Test?');
    expect(filename).not.toMatch(/[/\\:*?"<>|]/);
  });

  it('truncates very long title to 50 chars + rest of filename', () => {
    const longTitle = 'a'.repeat(100);
    const filename = buildExportFilename('json', 1, longTitle);
    // Safe title part is 50 chars max
    const parts = filename.split('-');
    // nalakoe + title-part + date + ext — title part should be max 50 chars
    expect(parts[1].length).toBeLessThanOrEqual(50);
  });
});
