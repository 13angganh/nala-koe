/**
 * useExport — Phase 10
 * Fetches all notes for the current user and triggers export.
 */

'use client';

import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { getNotesForExport } from '@/services/notes.service';
import { isOk } from '@/lib/normalizer';
import type { ExportOptions } from '@/types/import-export.types';
import type { Note } from '@/types/note.types';
import {
  exportNotesAsJson,
  exportNotesAsMarkdown,
  exportNotesAsTxt,
  exportNotesAsXlsx,
  exportNotesAsPdf,
  exportNotesAsDocx,
  downloadBlob,
  buildExportFilename,
} from '@/services/export.service';

interface ExportState {
  isExporting: boolean;
  progress: number; // 0–100
}

export function useExport() {
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<ExportState>({ isExporting: false, progress: 0 });

  const exportNotes = useCallback(
    async (opts: ExportOptions) => {
      if (!user) return;

      setState({ isExporting: true, progress: 10 });

      try {
        // Fetch full Note objects (not NoteListItem) — export needs fields like blocks
        const result = await getNotesForExport(user.uid, opts.noteIds);
        const filtered: Note[] = isOk(result) ? result.data : [];

        if (filtered.length === 0) {
          toast.error('Tidak ada catatan untuk diekspor');
          setState({ isExporting: false, progress: 0 });
          return;
        }

        setState({ isExporting: true, progress: 40 });

        // Need full Note objects — getNotes returns NoteListItem
        // For TXT/MD/JSON we can use NoteListItem content field
        // For XLSX/PDF/DOCX we cast (content is available)
        const notes = filtered as unknown as Note[];

        setState({ isExporting: true, progress: 70 });

        let blob: Blob;
        const filename = buildExportFilename(opts.format, notes.length);

        switch (opts.format) {
          case 'txt':
            blob = exportNotesAsTxt(notes, opts);
            break;
          case 'markdown':
            blob = exportNotesAsMarkdown(notes, opts);
            break;
          case 'json':
            blob = exportNotesAsJson(notes);
            break;
          case 'xlsx':
            blob = await exportNotesAsXlsx(notes, opts);
            break;
          case 'pdf':
            blob = await exportNotesAsPdf(notes, opts);
            break;
          case 'docx':
            blob = await exportNotesAsDocx(notes, opts);
            break;
          default:
            throw new Error(`Format tidak dikenal: ${opts.format}`);
        }

        setState({ isExporting: true, progress: 95 });
        downloadBlob(blob, filename);
        toast.success(`${notes.length} catatan diekspor sebagai ${opts.format.toUpperCase()}`);
      } catch {
        toast.error('Export gagal. Coba lagi.');
      } finally {
        setState({ isExporting: false, progress: 0 });
      }
    },
    [user]
  );

  return { exportNotes, ...state };
}
