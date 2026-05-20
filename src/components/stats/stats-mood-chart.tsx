'use client';

import { MOOD_MAP } from '@/constants/moods';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { Smile } from 'lucide-react';
import type { MoodInsight } from '@/types/stats.types';

interface StatsMoodChartProps {
  insights: MoodInsight[];
  isLoading: boolean;
}

export function StatsMoodChart({ insights, isLoading }: StatsMoodChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <EmptyState
        icon={Smile}
        title="Belum ada data mood"
        description="Tambahkan mood saat membuat catatan untuk melihat insight di sini."
      />
    );
  }

  const max = insights[0]?.count ?? 1;

  return (
    <div className="space-y-2.5">
      {insights.map(({ mood, count, percentage }) => {
        const meta = MOOD_MAP[mood];
        if (!meta) return null;
        const barWidth = max > 0 ? Math.round((count / max) * 100) : 0;

        return (
          <div key={mood} className="flex items-center gap-3">
            {/* Label */}
            <span className="w-20 shrink-0 text-right text-sm text-[var(--text-secondary)]">
              {meta.label}
            </span>

            {/* Bar */}
            <div className="relative flex-1 overflow-hidden rounded-full bg-[var(--surface-muted)] h-5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: meta.color,
                  opacity: 0.85,
                }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${meta.label}: ${percentage}%`}
              />
            </div>

            {/* Count + % */}
            <div className="w-20 shrink-0 text-right text-xs tabular-nums text-[var(--text-tertiary)]">
              {count}× · {percentage}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
