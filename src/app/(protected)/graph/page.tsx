'use client';

import dynamic from 'next/dynamic';
import { Share2, Loader2 } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';

const GraphView = dynamic(
  () => import('@/components/graph/graph-view').then((m) => ({ default: m.GraphView })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    ),
  }
);

export default function GraphPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center">
            <Share2 size={16} className="text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Graph Catatan
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Visualisasi koneksi antar catatan · Klik node untuk membuka
            </p>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 p-4 overflow-hidden">
        <GraphContent />
      </div>
    </div>
  );
}

function GraphContent() {
  const { data: notes = [], isLoading } = useNotes({ status: 'active' });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  return <GraphView notes={notes} />;
}

