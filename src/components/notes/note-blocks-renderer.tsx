'use client';

import { memo } from 'react';
import { NoteChecklist, type ChecklistItem } from './note-checklist';
import { NoteTable, deserializeTable } from './note-table';
import { NoteMathBlock } from './note-math-block';
import { NoteUrlPreview, type UrlPreviewData } from './note-url-preview';
import { NoteBlockHeader, NoteHiddenCollapsedRow } from './note-visibility-toggle';
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
 * EVERY block type renders the exact same NoteBlockHeader (label + eye
 * toggle + trash, always visible, always in that order) above its content.
 * This was previously inconsistent — checklist had no delete button at all,
 * url-preview's delete button was a hover-only X buried inside the card
 * with no eye toggle next to it, table/math had a text-link "Hapus X" with
 * the toggle as an afterthought. Block-specific delete UI (the hover-X
 * inside NoteUrlPreview, etc.) is suppressed via the readOnly prop, so
 * there's exactly ONE way to hide and ONE way to delete each block, always
 * in the same place.
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
            <div key={block.id} className="space-y-1.5">
              <NoteBlockHeader
                label={label}
                isHidden={false}
                onToggleVisibility={() => onToggleBlockVisibility(block.id)}
                onDelete={() => onRemoveBlock(block.id)}
              />
              <NoteChecklist items={items} onChange={(updated) => onChecklistChange(block.id, updated)} />
            </div>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={block.id} className="space-y-1.5">
              <NoteBlockHeader
                label={label}
                isHidden={false}
                onToggleVisibility={() => onToggleBlockVisibility(block.id)}
                onDelete={() => onRemoveBlock(block.id)}
              />
              <NoteTable data={deserializeTable(block.content)} onChange={(data) => onTableChange(block.id, data)} />
            </div>
          );
        }

        if (block.type === 'math') {
          return (
            <div key={block.id} className="space-y-1.5">
              <NoteBlockHeader
                label={label}
                isHidden={false}
                onToggleVisibility={() => onToggleBlockVisibility(block.id)}
                onDelete={() => onRemoveBlock(block.id)}
              />
              <NoteMathBlock expression={block.content} onChange={(expr) => onMathChange(block.id, expr)} />
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
            <div key={block.id} className="space-y-1.5">
              <NoteBlockHeader
                label={label}
                isHidden={false}
                onToggleVisibility={() => onToggleBlockVisibility(block.id)}
                onDelete={() => onRemoveBlock(block.id)}
              />
              {/* hideRemoveButton suppresses NoteUrlPreview's own internal
                  hover-X delete buttons — deletion now happens exclusively
                  through the NoteBlockHeader trash icon above, like every
                  other block type. Fetch/retry behavior is unaffected. */}
              <NoteUrlPreview
                previewData={previewData}
                rawUrl={rawUrl}
                onPreviewFetched={(data) => onUrlPreviewFetched(block.id, data)}
                onRemove={() => onRemoveBlock(block.id)}
                hideRemoveButton
              />
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

export const NoteBlocksRenderer = memo(NoteBlocksRendererImpl);
