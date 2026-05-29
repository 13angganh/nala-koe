'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useAuthStore } from '@/stores/auth.store';
import { isOk } from '@/lib/normalizer';
import { toast } from 'sonner';
import {
  getOrCreateDefaultBoard,
  createSticky,
  updateSticky,
  deleteSticky,
  updateBoardViewport,
} from '@/services/canvas.service';
import type { CanvasBoard as CanvasBoardType, CanvasSticky } from '@/types/canvas.types';

const CanvasBoard = dynamic(
  () => import('@/components/canvas/canvas-board').then((m) => ({ default: m.CanvasBoard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    ),
  }
);

export default function CanvasPage() {
  const { user } = useAuthStore();
  const { dialogProps } = useConfirmDialog();
  const [board, setBoard] = useState<CanvasBoardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getOrCreateDefaultBoard(user.uid).then((result) => {
      if (isOk(result)) setBoard(result.data);
      else toast.error(result.error.message);
      setIsLoading(false);
    });
  }, [user]);

  const handleAddSticky = useCallback(
    async (x: number, y: number) => {
      if (!user || !board) return;
      const result = await createSticky(board.id, user.uid, { x, y });
      if (isOk(result)) {
        setBoard((prev) =>
          prev ? { ...prev, stickies: [...prev.stickies, result.data] } : prev
        );
      } else {
        toast.error(result.error.message);
      }
    },
    [user, board]
  );

  const handleUpdateSticky = useCallback(
    async (id: string, updates: Partial<CanvasSticky>) => {
      const result = await updateSticky(id, updates);
      if (!isOk(result)) toast.error(result.error.message);
    },
    []
  );

  const handleDeleteSticky = useCallback(
    async (id: string) => {
      if (!board) return;
      const result = await deleteSticky(id);
      if (isOk(result)) {
        setBoard((prev) =>
          prev ? { ...prev, stickies: prev.stickies.filter((s) => s.id !== id) } : prev
        );
      } else {
        toast.error(result.error.message);
      }
    },
    [board]
  );

  const handleViewportChange = useCallback(
    async (viewportX: number, viewportY: number, zoom: number) => {
      if (!board || !user) return;
      await updateBoardViewport(board.id, user.uid, { viewportX, viewportY, zoom });
    },
    [board, user]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center">
            <LayoutDashboard size={16} className="text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {board?.name ?? 'Canvas'}
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Papan sticky note bebas · Scroll untuk zoom · Drag untuk pan
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : board ? (
          <CanvasBoard
            board={board}
            onAddSticky={handleAddSticky}
            onUpdateSticky={handleUpdateSticky}
            onDeleteSticky={handleDeleteSticky}
            onViewportChange={handleViewportChange}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
            <LayoutDashboard size={32} className="opacity-30" aria-hidden />
            <p className="text-sm">Gagal memuat canvas. Coba muat ulang halaman.</p>
          </div>
        )}
      </div>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

