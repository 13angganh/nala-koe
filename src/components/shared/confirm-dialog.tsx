'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  /** Support both `isOpen` (legacy) and `open` */
  isOpen?: boolean;
  open?: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
  /** Tampilkan loading spinner dan disable tombol konfirmasi */
  isLoading?: boolean;
  onConfirm: () => void;
  /** Support both `onCancel` (legacy) and `onOpenChange` */
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDialog({
  isOpen,
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'default',
  icon,
  isLoading = false,
  onConfirm,
  onCancel,
  onOpenChange,
}: ConfirmDialogProps) {
  const isVisible = open ?? isOpen ?? false;

  function handleClose() {
    if (isLoading) return; // jangan tutup dialog saat proses berjalan
    onCancel?.();
    onOpenChange?.(false);
  }

  return (
    <Dialog open={isVisible} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent showClose={false} className="max-w-sm">
        <DialogHeader>
          {icon && <div className="mb-2">{icon}</div>}
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

