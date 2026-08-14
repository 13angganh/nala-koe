'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { Plus, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { CanvasSticky } from './canvas-sticky';
import { Button } from '@/components/ui/button';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import type { CanvasBoard as CanvasBoardType, CanvasSticky as CanvasStickyType } from '@/types/canvas.types';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.15;

interface CanvasBoardProps {
  board: CanvasBoardType;
  onAddSticky: (x: number, y: number) => void;
  onUpdateSticky: (id: string, updates: Partial<CanvasStickyType>) => void;
  onDeleteSticky: (id: string) => void;
  onViewportChange: (viewportX: number, viewportY: number, zoom: number) => void;
}

export function CanvasBoard({
  board,
  onAddSticky,
  onUpdateSticky,
  onDeleteSticky,
  onViewportChange,
}: CanvasBoardProps) {
  const [viewport, setViewport] = useState({
    x: board.viewportX,
    y: board.viewportY,
    zoom: board.zoom,
  });
  const [stickies, setStickies] = useState<CanvasStickyType[]>(board.stickies);
  const panState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  // Declared here (not down near handleStickyMove, where it's actually
  // used) because the unmount-cleanup effect further down reads it —
  // React Compiler's react-hooks/immutability rule requires a ref to be
  // fully declared before any effect that reads it, and rejects
  // modifying it later in a handler defined after that effect. See that
  // effect below for the full explanation of what this is for.
  const moveDebounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const { confirm } = useConfirmDialog();

  // Root cause of the reported canvas issues, second part: handlePointerMove
  // in canvas-sticky.tsx calls onMove() — which reaches this function —
  // directly on every pointermove event during a drag, with zero
  // debouncing anywhere in the chain. That's potentially dozens of
  // Firestore writes per second for a single drag gesture (a real
  // performance problem, and a real Firestore quota/cost concern, not
  // just a UI smoothness one). Position updates are debounced here at
  // 150ms — short enough that the saved position still feels immediate
  // once dragging stops, long enough to collapse a fast drag's pointermove
  // stream into a handful of writes instead of one per pixel. Local
  // `stickies` state (the optimistic in-memory position used for
  // rendering) is NOT debounced — that still updates every frame so the
  // drag itself stays visually smooth; only the network write is delayed.
  //
  // Defined here (before the effects below, rather than grouped with the
  // other sticky handlers further down) for the same react-hooks/immutability
  // reason moveDebounceRef is declared up here — this is the one place
  // that mutates it, and it must appear before the unmount-cleanup effect
  // that reads it.
  function handleStickyMove(id: string, x: number, y: number) {
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s))
    );
    const existing = moveDebounceRef.current[id];
    if (existing) clearTimeout(existing);
    moveDebounceRef.current[id] = setTimeout(() => {
      onUpdateSticky(id, { x, y });
      delete moveDebounceRef.current[id];
    }, 150);
  }

  // Sync stickies when board prop changes. This is the
  // "Subscribe for updates from some external system, calling setState in
  // a callback function when external state changes" case the rule's own
  // description names as valid — `board` is a snapshot of Firestore state
  // from the parent's onSnapshot subscription (see notes.service.ts /
  // canvas.service.ts), an external system relative to this component.
  // `stickies` can't be fully derived from `board.stickies` during render
  // because it also carries local-only mutations from drag/add/delete
  // below (setStickies at lines ~130-165) that happen optimistically
  // before the corresponding server write resolves — collapsing it back
  // to a pure derived value would mean every drag frame waits on a
  // Firestore round-trip to be visible.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reason: see comment above; this is the rule's own documented "external system" exception
    setStickies(board.stickies);
  }, [board.stickies]);

  // Persist viewport with debounce
  useEffect(() => {
    const t = setTimeout(() => {
      onViewportChange(viewport.x, viewport.y, viewport.zoom);
    }, 800);
    return () => clearTimeout(t);
  }, [viewport, onViewportChange]);

  // Flush any still-pending sticky-position debounce timers on unmount
  // (e.g. user navigates away right after finishing a drag, before the
  // 150ms debounce above fired) — without this, a position from the very
  // end of a drag gesture could be silently lost instead of saved, the
  // same class of "last edit before navigating away doesn't make it to
  // the server" bug already fixed for notes (see use-note-editor.ts's
  // unmount cleanup and its cited README changelog entries).
  //
  // stickiesRef/onUpdateStickyRef exist so the unmount cleanup below
  // (registered once, via the empty dependency array) reads the CURRENT
  // stickies/onUpdateSticky at the moment it actually runs — not whatever
  // they were on first render. An empty-deps effect's closure only ever
  // sees its first render's values otherwise (the same stale-closure
  // class of bug already fixed once in this codebase for TagInput's
  // addTag/removeTag — see tag-input.tsx and its cited tests).
  //
  // Synced via useEffect, NOT by writing ref.current directly in the
  // render body — React's own eslint-plugin-react-hooks `refs` rule (and
  // this project's React Compiler config) rejects reading OR writing
  // ref.current during render outright, no exceptions
  // (https://react.dev/reference/eslint-plugin-react-hooks/lints/refs).
  // useEffect's dependency array is what correctly limits the sync to
  // "after this render's commit", which is what the rule requires.
  const stickiesRef = useRef(stickies);
  useEffect(() => {
    stickiesRef.current = stickies;
  }, [stickies]);
  const onUpdateStickyRef = useRef(onUpdateSticky);
  useEffect(() => {
    onUpdateStickyRef.current = onUpdateSticky;
  }, [onUpdateSticky]);

  useEffect(() => {
    return () => {
      const pending = moveDebounceRef.current;
      for (const id of Object.keys(pending)) {
        clearTimeout(pending[id]);
        const sticky = stickiesRef.current.find((s) => s.id === id);
        if (sticky) onUpdateStickyRef.current(id, { x: sticky.x, y: sticky.y });
      }
      moveDebounceRef.current = {};
    };
  }, []);

  // ─── Pan ──────────────────────────────────────────────────────────────────

  const handleBoardPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    // Izinkan pan dari mana saja di canvas surface, kecuali dari elemen interaktif (sticky, button, dll)
    const target = e.target as HTMLElement;
    if (target.closest('button, textarea, a, [data-sticky]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    panState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: viewport.x,
      origY: viewport.y,
    };
  }, [viewport.x, viewport.y]);

  const handleBoardPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!panState.current) return;
    const dx = e.clientX - panState.current.startX;
    const dy = e.clientY - panState.current.startY;
    setViewport((v) => ({
      ...v,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: this callback only runs inside pointermove which is active only when panState is set in pointerdown
      x: panState.current!.origX + dx,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: same as above
      y: panState.current!.origY + dy,
    }));
  }, []);

  const handleBoardPointerUp = useCallback(() => {
    panState.current = null;
  }, []);

  // ─── Zoom ─────────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setViewport((v) => ({
      ...v,
      zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.zoom + delta)),
    }));
  }, []);

  function zoomIn() {
    setViewport((v) => ({ ...v, zoom: Math.min(ZOOM_MAX, v.zoom + ZOOM_STEP) }));
  }

  function zoomOut() {
    setViewport((v) => ({ ...v, zoom: Math.max(ZOOM_MIN, v.zoom - ZOOM_STEP) }));
  }

  function resetView() {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }

  // ─── Add sticky at center of current view ────────────────────────────────

  function handleAddSticky() {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const centerX = (rect.width / 2 - viewport.x) / viewport.zoom;
    const centerY = (rect.height / 2 - viewport.y) / viewport.zoom;
    // Slight random offset so new stickies don't stack perfectly
    const jitter = () => (Math.random() - 0.5) * 40;
    onAddSticky(centerX + jitter(), centerY + jitter());
  }

  // ─── Sticky handlers ─────────────────────────────────────────────────────
  // (handleStickyMove is defined near the top of this component, alongside
  // moveDebounceRef — see the comment there for why, and for its own
  // documentation of the debounce fix it implements.)

  function handleStickyContent(id: string, content: string) {
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s))
    );
    onUpdateSticky(id, { content });
  }

  function handleStickyColor(id: string, color: string) {
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, color } : s))
    );
    onUpdateSticky(id, { color });
  }

  function handleBringToFront(id: string) {
    const maxZ = stickies.reduce((m, s) => Math.max(m, s.zIndex), 0);
    setStickies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, zIndex: maxZ + 1 } : s))
    );
    onUpdateSticky(id, { zIndex: maxZ + 1 });
  }

  async function handleDeleteSticky(id: string) {
    const confirmed = await confirm({
      title: 'Hapus sticky?',
      description: 'Sticky ini akan dihapus permanen dari canvas.',
      confirmLabel: 'Hapus',
      variant: 'destructive',
    });
    if (confirmed) {
      setStickies((prev) => prev.filter((s) => s.id !== id));
      onDeleteSticky(id);
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[var(--surface-subtle)] rounded-lg border border-[var(--border)]">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
          backgroundSize: `${28 * viewport.zoom}px ${28 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x % (28 * viewport.zoom)}px ${viewport.y % (28 * viewport.zoom)}px`,
        }}
      />

      {/* Canvas surface */}
      <div
        ref={boardRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none', WebkitUserSelect: 'none' }}
        onPointerDown={handleBoardPointerDown}
        onPointerMove={handleBoardPointerMove}
        onPointerUp={handleBoardPointerUp}
        onWheel={handleWheel}
      >
        {/* Transformed sticky container */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {stickies.map((sticky) => (
            <CanvasSticky
              key={sticky.id}
              sticky={sticky}
              zoom={viewport.zoom}
              onMove={handleStickyMove}
              onContentChange={handleStickyContent}
              onColorChange={handleStickyColor}
              onDelete={handleDeleteSticky}
              onBringToFront={handleBringToFront}
            />
          ))}
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[var(--z-overlay)]">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSticky}
          className="shadow-sm bg-[var(--surface-card)]"
          aria-label="Tambah sticky baru"
        >
          <Plus size={14} className="mr-1" />
          Sticky
        </Button>
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            className="w-8 h-8 shadow-sm bg-[var(--surface-card)]"
            aria-label="Zoom in"
            disabled={viewport.zoom >= ZOOM_MAX}
          >
            <ZoomIn size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            className="w-8 h-8 shadow-sm bg-[var(--surface-card)]"
            aria-label="Zoom out"
            disabled={viewport.zoom <= ZOOM_MIN}
          >
            <ZoomOut size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetView}
            className="w-8 h-8 shadow-sm bg-[var(--surface-card)]"
            aria-label="Reset tampilan"
          >
            <Maximize2 size={14} />
          </Button>
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 z-[var(--z-overlay)]">
        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--surface-card)] border border-[var(--border)] px-2 py-1 rounded">
          {Math.round(viewport.zoom * 100)}%
        </span>
      </div>

      {/* Empty hint */}
      {stickies.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[var(--z-overlay)]">
          <div className="text-center">
            <p className="text-sm text-[var(--text-muted)] mb-1">Canvas kosong</p>
            <p className="text-xs text-[var(--text-muted)]">
              Klik tombol <span className="font-medium">+ Sticky</span> untuk mulai
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
