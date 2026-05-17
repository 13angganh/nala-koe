'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<void>;
  isCopied: boolean;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const {
    successMessage = 'Disalin ke clipboard',
    errorMessage = 'Gagal menyalin',
    timeout = 2000,
  } = options;

  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        toast.success(successMessage);
        setTimeout(() => setIsCopied(false), timeout);
      } catch {
        toast.error(errorMessage);
      }
    },
    [successMessage, errorMessage, timeout]
  );

  return { copy, isCopied };
}
