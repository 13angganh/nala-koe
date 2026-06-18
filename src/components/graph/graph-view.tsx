'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Info, X } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { EmptyState } from '@/components/shared/empty-state';
import { colors } from '@/tokens/colors';
import type { NoteListItem } from '@/types/note.types';

// ─── Canvas color constants ───────────────────────────────────────────────────
// reason: Canvas API tidak bisa membaca CSS variables. Nilai harus hardcoded.
// Sumber warna: tokens/colors.ts surfaceDark.base dan brand.500
const CANVAS_BG_DARK = colors.surfaceDark?.base ?? '#0f172a';
const CANVAS_BG_LIGHT = colors.surface?.subtle ?? '#f8fafc';
const CANVAS_NODE_DEFAULT = colors.brand[500] ?? '#0ea5e9';
const CANVAS_NODE_HOVER = colors.brand[400] ?? '#38bdf8';

interface GraphNode {
  id: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphViewProps {
  notes: Array<NoteListItem & { linkedNoteIds?: string[] }>;
}

// ─── Simple force simulation (no d3 dependency) ──────────────────────────────

const REPULSION = 3000;
const ATTRACTION = 0.04;
const DAMPING = 0.88;
const CENTERING = 0.015;
const SIM_STEPS = 120;

function buildGraph(notes: GraphViewProps['notes'], width: number, height: number): GraphData {
  const centerX = width / 2;
  const centerY = height / 2;
  const nodeMap = new Map<string, GraphNode>();

  for (const note of notes) {
    const angle = Math.random() * Math.PI * 2;
    const r = 80 + Math.random() * 120;
    nodeMap.set(note.id, {
      id: note.id,
      title: note.title || 'Tanpa judul',
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r,
      vx: 0,
      vy: 0,
      radius: note.wordCount ? Math.min(36, 10 + Math.sqrt(note.wordCount) * 1.2) : 12,
      color: CANVAS_NODE_DEFAULT,
    });
  }

  const edges: GraphEdge[] = [];
  for (const note of notes) {
    for (const linkedId of note.linkedNoteIds ?? []) {
      if (nodeMap.has(linkedId)) {
        edges.push({ source: note.id, target: linkedId });
      }
    }
  }

  // Run force simulation
  const nodes = Array.from(nodeMap.values());
  for (let step = 0; step < SIM_STEPS; step++) {
    // Repulsion between all node pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = REPULSION / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      a.vx += dx * ATTRACTION;
      a.vy += dy * ATTRACTION;
      b.vx -= dx * ATTRACTION;
      b.vy -= dy * ATTRACTION;
    }

    // Centering + damping
    for (const n of nodes) {
      n.vx += (centerX - n.x) * CENTERING;
      n.vy += (centerY - n.y) * CENTERING;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx;
      n.y += n.vy;
    }
  }

  return { nodes, edges };
}

export function GraphView({ notes }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const graphRef = useRef<GraphData | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; title: string } | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const viewportRef = useRef({ x: 0, y: 0, zoom: 1 });
  const panState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const notesWithLinks = notes.filter(
    (n) => (n as { linkedNoteIds?: string[] }).linkedNoteIds
  );
  const totalLinks = notesWithLinks.reduce(
    (sum, n) => sum + ((n as { linkedNoteIds?: string[] }).linkedNoteIds?.length ?? 0),
    0
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const graph = graphRef.current;
    if (!canvas || !graph) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x: vx, y: vy, zoom } = viewportRef.current;
    const isDark = document.documentElement.classList.contains('dark');
    const bg = isDark ? CANVAS_BG_DARK : CANVAS_BG_LIGHT;
    const edgeColor = isDark ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.2)';
    const labelColor = isDark
      ? (colors.textDark?.secondary ?? '#cbd5e1')
      : (colors.text?.secondary ?? '#64748b');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(vx, vy);
    ctx.scale(zoom, zoom);

    // Draw edges
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 1.5 / zoom;
    for (const edge of graph.edges) {
      const a = graph.nodes.find((n) => n.id === edge.source);
      const b = graph.nodes.find((n) => n.id === edge.target);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const node of graph.nodes) {
      const isHovered = hoveredId === node.id;
      const r = node.radius * (isHovered ? 1.25 : 1);

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? CANVAS_NODE_HOVER : CANVAS_NODE_DEFAULT;
      ctx.globalAlpha = isHovered ? 1 : 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1 / zoom;
      ctx.stroke();

      // Label
      const fontSize = Math.max(10, Math.min(13, r * 0.9)) / zoom;
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = labelColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const maxLen = 18;
      const label =
        node.title.length > maxLen ? node.title.slice(0, maxLen) + '…' : node.title;
      ctx.fillText(label, node.x, node.y + r + 4 / zoom);
    }

    ctx.restore();
  }, [hoveredId]);

  // Build graph on mount / notes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    graphRef.current = buildGraph(notes, canvas.width, canvas.height);
    draw();
  }, [notes, draw]);

  // Redraw on hovered change
  useEffect(() => {
    draw();
  }, [hoveredId, draw]);

  // Canvas resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      if (!graphRef.current) {
        graphRef.current = buildGraph(notes, canvas.width, canvas.height);
      }
      draw();
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: canvas is mounted in DOM at this point in useEffect
    observer.observe(canvas.parentElement!);
    return () => observer.disconnect();
  }, [notes, draw]);

  function getNodeAtPoint(cx: number, cy: number): GraphNode | null {
    const graph = graphRef.current;
    if (!graph) return null;
    const { x: vx, y: vy, zoom } = viewportRef.current;
    const wx = (cx - vx) / zoom;
    const wy = (cy - vy) / zoom;
    for (const node of graph.nodes) {
      const dx = node.x - wx;
      const dy = node.y - wy;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 4) return node;
    }
    return null;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: callback only fires when canvas is mounted
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    if (panState.current) {
      const dx = cx - panState.current.startX;
      const dy = cy - panState.current.startY;
      viewportRef.current = {
        ...viewportRef.current,
        x: panState.current.origX + dx,
        y: panState.current.origY + dy,
      };
      draw();
      return;
    }

    const node = getNodeAtPoint(cx, cy);
    if (node) {
      setHoveredId(node.id);
      setTooltip({ x: e.clientX - rect.left + 10, y: e.clientY - rect.top - 10, title: node.title });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: callback only fires when canvas is mounted
    canvasRef.current!.style.cursor = 'pointer';
    } else {
      setHoveredId(null);
      setTooltip(null);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: callback only fires when canvas is mounted
    canvasRef.current!.style.cursor = 'grab';
    }
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: callback only fires when canvas is mounted
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const node = getNodeAtPoint(cx, cy);
    if (node) return; // don't pan when clicking node
    panState.current = {
      startX: cx,
      startY: cy,
      origX: viewportRef.current.x,
      origY: viewportRef.current.y,
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: callback only fires when canvas is mounted
    canvasRef.current!.style.cursor = 'grabbing';
  }

  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    const wasPanning = panState.current !== null;
    panState.current = null;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: callback only fires when canvas is mounted
    canvasRef.current!.style.cursor = 'grab';

    if (!wasPanning) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: callback only fires when canvas is mounted
    const rect = canvasRef.current!.getBoundingClientRect();
      const node = getNodeAtPoint(e.clientX - rect.left, e.clientY - rect.top);
      if (node) router.push(ROUTES.NOTE(node.id));
    }
  }

  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    viewportRef.current = {
      ...viewportRef.current,
      zoom: Math.min(3, Math.max(0.2, viewportRef.current.zoom + delta)),
    };
    draw();
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title="Belum ada catatan"
        description="Buat catatan dan hubungkan dengan [[judul]] untuk melihat graph di sini."
        icon={Share2}
      />
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg border border-[var(--border)] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab"
        style={{ touchAction: 'none' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
        onWheel={handleWheel}
        onTouchStart={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          const canvas = canvasRef.current;
          if (!t || !canvas) return;
          const rect = canvas.getBoundingClientRect();
          const cx = t.clientX - rect.left;
          const cy = t.clientY - rect.top;
          const node = getNodeAtPoint(cx, cy);
          if (node) return;
          panState.current = { startX: cx, startY: cy, origX: viewportRef.current.x, origY: viewportRef.current.y };
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          const canvas = canvasRef.current;
          if (!t || !panState.current || !canvas) return;
          const rect = canvas.getBoundingClientRect();
          const cx = t.clientX - rect.left;
          const cy = t.clientY - rect.top;
          viewportRef.current = { ...viewportRef.current, x: panState.current.origX + (cx - panState.current.startX), y: panState.current.origY + (cy - panState.current.startY) };
          draw();
        }}
        onTouchEnd={(e) => {
          const wasPanning = panState.current !== null;
          panState.current = null;
          if (!wasPanning) {
            const t = e.changedTouches[0];
            const canvas = canvasRef.current;
            if (!t || !canvas) return;
            const rect = canvas.getBoundingClientRect();
            const node = getNodeAtPoint(t.clientX - rect.left, t.clientY - rect.top);
            if (node) router.push(ROUTES.NOTE(node.id));
          }
        }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-[var(--z-overlay)] px-2 py-1 rounded text-xs bg-[var(--surface-card)] border border-[var(--border)] text-[var(--text-primary)] shadow-md max-w-[200px] truncate"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.title}
        </div>
      )}

      {/* Stats badge */}
      <div className="absolute bottom-4 left-4 text-xs text-[var(--text-muted)] bg-[var(--surface-card)] border border-[var(--border)] px-2 py-1 rounded pointer-events-none">
        {notes.length} catatan · {totalLinks} koneksi
      </div>

      {/* Legend — toggle button, tidak menghalangi canvas */}
      <div className="absolute top-3 right-3 z-[var(--z-overlay)] flex flex-col items-end gap-1">
        <button
          onClick={() => setLegendOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--surface-card)] border border-[var(--border)] px-2.5 py-1 rounded shadow-sm hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={legendOpen ? 'Tutup info graph' : 'Lihat info graph'}
        >
          {legendOpen ? <X size={12} /> : <Info size={12} />}
          {legendOpen ? 'Tutup' : 'Info'}
        </button>
        {legendOpen && (
          <div className="text-xs text-[var(--text-muted)] bg-[var(--surface-card)] border border-[var(--border)] px-3 py-2 rounded shadow-md space-y-1 min-w-[180px]">
            <p className="font-medium text-[var(--text-primary)]">Cara pakai Graph</p>
            <p>Klik node untuk buka catatan</p>
            <p>Drag untuk pan · Scroll untuk zoom</p>
            <p>Ukuran node = jumlah kata</p>
          </div>
        )}
      </div>
    </div>
  );
}
