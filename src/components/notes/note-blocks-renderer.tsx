'use client';

import { memo } from 'react';
import { NoteChecklist, type ChecklistItem } from './note-checklist';
import { NoteTable, deserializeTable } from './note-table';
import { NoteMathBlock } from './note-math-block';
import { NoteUrlPreview, type UrlPreviewData } from './note-url-preview';
import { NoteVisibilityToggle, NoteHiddenCollapsedRow } from './note-visibility-toggle';
import type { NoteContentBlock } from '@/types/note.types';

const BLOCK_LABEL: Record<string, string> = {
  checklist: 'Checklist',
  table: 'Tabel',
  math: 'Kalkulasi',
  'url-preview': 'Pratinjau tautan',
};

interface NoteBlocksRendererProps {
  blocks: NoteContentBlock[];
  onChecklistChange: (blockId: string, items: ChecklistItem[]) => void;
  onTableChange: (blockId: string, data: ReturnType<typeof deserializeTable>) => void;
  onMathChange: (blockId: string, expression: string) => void;
  onUrlPreviewFetched: (blockId: string, data: UrlPreviewData) => void;
  onRemoveBlock: (blockId: string) => void;
  onToggleBlockVisibility: (blockId: string) => void;
}

/**
 * Renders all non-paragraph content blocks (checklist, table, math,
 * url-preview) for the note. Extracted from NoteEditor to keep that file
 * within the project's line-count target and so this list only re-renders
 * when `blocks` itself changes — not on every title/content keystroke.
 *
 * Each block carries a NoteVisibilityToggle next to its delete action: the
 * user can collapse a block out of the note's visible layout (data stays
 * intact, e.g. table cells, checklist items) without deleting it — useful
 * for shortening a long note. A hidden block collapses to a single dashed
 * placeholder row that restores it on click.
 */
function NoteBlocksRendererImpl({
  blocks,
  onChecklistChange,
  onTableChange,
  onMathChange,
  onUrlPreviewFetched,
  onRemoveBlock,
  onToggleBlockVisibility,
}: NoteBlocksRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        const isHidden = block.isHidden ?? false;
        const label = BLOCK_LABEL[block.type] ?? 'Blok';

        if (isHidden) {
          return (
            <NoteHiddenCollapsedRow
              key={block.id}
              label={label}
              onToggle={() => onToggleBlockVisibility(block.id)}
            />
          );
        }

        if (block.type === 'checklist') {
          let items: ChecklistItem[] = [];
          try { items = JSON.parse(block.content) as ChecklistItem[]; } catch { /* skip */ }
          return (
            <div key={block.id} className="space-y-2">
              <div className="flex items-center justify-end gap-1">
                <NoteVisibilityToggle isHidden={false} onToggle={() => onToggleBlockVisibility(block.id)} label="checklist" />
              </div>
              <NoteChecklist items={items} onChange={(updated) => onChecklistChange(block.id, updated)} />
            </div>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={block.id} className="space-y-1">
              <NoteTable data={deserializeTable(block.content)} onChange={(data) => onTableChange(block.id, data)} />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onRemoveBlock(block.id)}
                  aria-label="Hapus tabel"
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded"
                >
                  Hapus tabel
                </button>
                <NoteVisibilityToggle isHidden={false} onToggle={() => onToggleBlockVisibility(block.id)} label="tabel" />
              </div>
            </div>
          );
        }

        if (block.type === 'math') {
          return (
            <div key={block.id} className="space-y-1">
              <NoteMathBlock expression={block.content} onChange={(expr) => onMathChange(block.id, expr)} />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onRemoveBlock(block.id)}
                  aria-label="Hapus kalkulasi"
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--error)] outline-none focus-visible:ring-1 rounded"
                >
                  Hapus kalkulasi
                </button>
                <NoteVisibilityToggle isHidden={false} onToggle={() => onToggleBlockVisibility(block.id)} label="kalkulasi" />
              </div>
            </div>
          );
        }

        if (block.type === 'url-preview') {
          let previewData: UrlPreviewData | null = null;
          let rawUrl = '';
          try {
            const parsed = JSON.parse(block.content) as { url: string; meta: UrlPreviewData['meta']; cachedAt: string | null };
            rawUrl = parsed.url;
            if (parsed.meta) previewData = { url: parsed.url, meta: parsed.meta, cachedAt: parsed.cachedAt ?? new Date().toISOString() };
          } catch { /* skip */ }
          return (
            <div key={block.id} className="space-y-1">
              <NoteUrlPreview
                previewData={previewData}
                rawUrl={rawUrl}
                onPreviewFetched={(data) => onUrlPreviewFetched(block.id, data)}
                onRemove={() => onRemoveBlock(block.id)}
              />
              <div className="flex justify-end">
                <NoteVisibilityToggle isHidden={false} onToggle={() => onToggleBlockVisibility(block.id)} label="pratinjau tautan" />
              </div>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

export const NoteBlocksRenderer = memo(NoteBlocksRendererImpl);
