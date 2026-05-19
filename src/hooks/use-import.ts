/**
 * useImport — Phase 10
 * Parses uploaded JSON file and imports to Firestore.
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { importNotesToFirestore } from '@/services/import.service';
import { parseKeepJson } from '@/lib/importer/keep-importer';
import { parseColorNoteJson } from '@/lib/importer/colornote-importer';
import { parseNalakoeJson } from '@/lib/importer/nalakoe-importer';
import type { ImportSource, ImportResult } from '@/types/import-export.types';

interface ImportState {
  isImporting: boolean;
  result: ImportResult | null;
}

export function useImport() {
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<ImportState>({ isImporting: false, result: null });

  const importFile = useCallback(
    async (file: File, source: ImportSource): Promise<ImportResult | null> => {
      if (!user) return null;

      setState({ isImporting: true, result: null });

      try {
        const text = await file.text();
        let rawJson: unknown;
        try {
          rawJson = JSON.parse(text);
        } catch {
          toast.error('File tidak valid. Pastikan file berformat JSON.');
          setState({ isImporting: false, result: null });
          return null;
        }

        let parsed: ReturnType<typeof parseKeepJson>;

        if (source === 'google-keep') {
          parsed = parseKeepJson(rawJson, user.uid);
        } else if (source === 'colornote') {
          parsed = parseColorNoteJson(rawJson, user.uid);
        } else {
          parsed = parseNalakoeJson(rawJson, user.uid);
        }

        if (parsed.notes.length === 0) {
          toast.error(`Tidak ada catatan valid ditemukan di file ini`);
          setState({ isImporting: false, result: parsed.result });
          return parsed.result;
        }

        const finalResult = await importNotesToFirestore(parsed.notes, user.uid);

        setState({ isImporting: false, result: finalResult });

        if (finalResult.imported > 0) {
          toast.success(`${finalResult.imported} catatan berhasil diimpor`);
        }
        if (finalResult.skipped > 0) {
          toast.warning(`${finalResult.skipped} catatan dilewati`);
        }

        return finalResult;
      } catch {
        toast.error('Import gagal. Coba lagi.');
        setState({ isImporting: false, result: null });
        return null;
      }
    },
    [user]
  );

  const reset = useCallback(() => {
    setState({ isImporting: false, result: null });
  }, []);

  return { importFile, reset, ...state };
}
