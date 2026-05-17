'use client';

import { useState, useCallback } from 'react';

export interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  isOpen: boolean;
  resolve: ((confirmed: boolean) => void) | null;
}

const INITIAL_STATE: ConfirmDialogState = {
  isOpen: false,
  title: '',
  description: undefined,
  confirmLabel: 'Konfirmasi',
  cancelLabel: 'Batal',
  variant: 'default',
  resolve: null,
};

/**
 * Global confirm dialog hook. Use this instead of individual ConfirmDialog
 * implementations per page. Pair with <ConfirmDialog /> in the root layout.
 *
 * @example
 * const { confirm } = useConfirmDialog();
 * const ok = await confirm({ title: 'Hapus catatan?', variant: 'destructive' });
 * if (ok) await deleteNote(id);
 */
export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>(INITIAL_STATE);

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...INITIAL_STATE,
        ...options,
        confirmLabel: options.confirmLabel ?? 'Konfirmasi',
        cancelLabel: options.cancelLabel ?? 'Batal',
        isOpen: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState(INITIAL_STATE);
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState(INITIAL_STATE);
  }, [state]);

  return {
    confirm,
    dialogProps: {
      isOpen: state.isOpen,
      title: state.title,
      description: state.description,
      confirmLabel: state.confirmLabel ?? 'Konfirmasi',
      cancelLabel: state.cancelLabel ?? 'Batal',
      variant: state.variant ?? 'default',
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}
