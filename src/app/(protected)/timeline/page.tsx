'use client';

import { Suspense } from 'react';
import { Calendar } from 'lucide-react';
import { TimelineView } from '@/components/timeline/timeline-view';
import { PageLoader } from '@/components/shared/loading-spinner';
import { useNotes } from '@/hooks/use-notes';

export default function TimelinePage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] flex items-center justify-center">
            <Calendar size={16} className="text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Perjalanan Catatan
            </h1>
            <p className="text-xs text-[var(--text-tertiary)]">
              Semua catatanmu tersusun berdasarkan waktu
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <Suspense fallback={<PageLoader />}>
          <TimelineContent />
        </Suspense>
      </div>
    </div>
  );
}

function TimelineContent() {
  const { data: notes = [], isLoading } = useNotes({ status: 'active' });

  if (isLoading) return <PageLoader />;

  return <TimelineView notes={notes} />;
}

