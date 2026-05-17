'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useClipboard } from './use-clipboard';

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

export function useShare() {
  const { copy } = useClipboard({ successMessage: 'Link disalin ke clipboard' });
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const share = useCallback(
    async (data: ShareData) => {
      if (canShare) {
        try {
          await navigator.share(data);
        } catch (err) {
          // User cancelled — not an error
          if (err instanceof Error && err.name !== 'AbortError') {
            toast.error('Gagal berbagi');
          }
        }
      } else if (data.url) {
        await copy(data.url);
      } else if (data.text) {
        await copy(data.text);
      }
    },
    [canShare, copy]
  );

  return { share, canShare };
}
