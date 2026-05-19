'use client';

import {
  useState,
  useRef,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { X, GripVertical, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import {
  CANVAS_STICKY_COLORS,
  CANVAS_STICKY_LIGHT_COLOR,
  CANVAS_STICKY_SELECTED_BORDER,
} from '@/constants/canvas';
import type { CanvasSticky as CanvasStickyType } from '@/types/canvas.types';

interface CanvasStickyProps {
  sticky: CanvasStickyType;
  zoom: number;
  onMove: (id: string, x: number, y: number) => void;
  onContentChange: (id: string, content: string) => void;
  onColorChange: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

export function CanvasSticky({
  sticky,
  zoom,
  onMove,
  onContentChange,
  onColorChange,
  onDelete,
  onBringToFront,
}: CanvasStickyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (isEditing) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: sticky.x,
        origY: sticky.y,
      };
      onBringToFront(sticky.id);
    },
    [isEditing, sticky.x, sticky.y, sticky.id, onBringToFront]
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const dx = (e.clientX - dragState.current.startX) / zoom;
      const dy = (e.clientY - dragState.current.startY) / zoom;
      onMove(sticky.id, dragState.current.origX + dx, dragState.current.origY + dy);
    },
    [zoom, sticky.id, onMove]
  );

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  // reason: Canvas API tidak bisa pakai CSS vars. Teks gelap untuk sticky "Abu"
  // yang warnanya mendekati surface-muted (terang), teks default untuk warna lain.
  const textColor = sticky.color === CANVAS_STICKY_LIGHT_COLOR ? 'var(--text-primary)' : '#1e293b';

  return (
    <div
      ref={stickyRef}
      className="absolute select-none group"
      style={{
        left: sticky.x,
        top: sticky.y,
        width: sticky.width,
        height: isEditing ? 'auto' : sticky.height,
        zIndex: sticky.zIndex,
        transform: `rotate(${sticky.rotation}deg)`,
        minHeight: sticky.height,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Sticky body */}
      <div
        className="w-full h-full rounded-lg shadow-md border border-black/10 flex flex-col overflow-hidden"
        style={{ backgroundColor: sticky.color }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-1">
            <GripVertical size={12} style={{ color: textColor, opacity: 0.5 }} />
            {/* Color swatches */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorPicker((v) => !v);
                }}
                className="w-3 h-3 rounded-full border border-black/20 transition-transform hover:scale-125"
                style={{ backgroundColor: sticky.color }}
                aria-label="Ubah warna"
              />
              {showColorPicker && (
                <div
                  className="absolute top-5 left-0 z-50 flex gap-1 p-1.5 rounded-lg shadow-lg border border-[var(--border)] bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  {CANVAS_STICKY_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        onColorChange(sticky.id, c.value);
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-125"
                      style={{
                        backgroundColor: c.value,
                        borderColor: sticky.color === c.value ? CANVAS_STICKY_SELECTED_BORDER : 'transparent',
                      }}
                      aria-label={c.label}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {sticky.noteId && (
              <a
                href={ROUTES.NOTE(sticky.noteId)}
                onClick={(e) => e.stopPropagation()}
                className="p-0.5 rounded transition-colors hover:bg-black/10"
                aria-label="Buka catatan terhubung"
              >
                <ExternalLink size={11} style={{ color: textColor }} />
              </a>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(sticky.id);
              }}
              className="p-0.5 rounded transition-colors hover:bg-black/10"
              aria-label="Hapus sticky"
            >
              <X size={11} style={{ color: textColor }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-2.5" onDoubleClick={() => setIsEditing(true)}>
          {isEditing ? (
            <textarea
              autoFocus
              value={sticky.content}
              onChange={(e) => onContentChange(sticky.id, e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setIsEditing(false);
                e.stopPropagation();
              }}
              className="w-full h-full resize-none bg-transparent outline-none text-sm leading-relaxed"
              style={{ color: textColor, minHeight: 100 }}
              placeholder="Tulis sesuatu..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap break-words"
              style={{ color: textColor }}
            >
              {sticky.content || (
                <span style={{ opacity: 0.4 }}>Tulis sesuatu…</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { CANVAS_STICKY_COLORS };
