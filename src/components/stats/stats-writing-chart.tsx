'use client';

import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { EmptyState } from '@/components/shared/empty-state';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MonthlyStats, WeeklyActivity } from '@/types/stats.types';

// ─── Monthly Bar Chart ────────────────────────────────────────────────────────

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

interface StatsMonthlyChartProps {
  data: MonthlyStats[];
  isLoading: boolean;
  /** 'notes' | 'words' */
  mode?: 'notes' | 'words';
}

export function StatsMonthlyChart({
  data,
  isLoading,
  mode = 'notes',
}: StatsMonthlyChartProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Belum ada data"
        description="Data akan muncul setelah kamu membuat catatan selama beberapa bulan."
      />
    );
  }

  const values = data.map((d) => (mode === 'notes' ? d.noteCount : d.wordCount));
  const max = Math.max(...values, 1);

  return (
    <div className="space-y-3">
      {/* Bars */}
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d, i) => {
          const val = values[i];
          const heightPct = Math.max((val / max) * 100, val > 0 ? 4 : 0);
          const isCurrentMonth =
            d.year === new Date().getFullYear() && d.month === new Date().getMonth() + 1;

          return (
            <div
              key={`${d.year}-${d.month}`}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              {/* Tooltip */}
              <div className="relative">
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--surface-emphasis)] px-2 py-1 text-[10px] text-[var(--text-primary)] shadow group-hover:block z-10">
                  {MONTH_LABELS[d.month - 1]} {d.year}
                  <br />
                  {val.toLocaleString('id-ID')} {mode === 'notes' ? 'catatan' : 'kata'}
                </div>
                <div
                  className={cn(
                    'w-full min-h-[4px] rounded-t-sm transition-all duration-300',
                    isCurrentMonth
                      ? 'bg-[var(--accent)]'
                      : 'bg-[var(--surface-emphasis)] group-hover:bg-[var(--accent-subtle)]'
                  )}
                  style={{ height: `${heightPct}%`, minHeight: val > 0 ? '4px' : '2px' }}
                  role="img"
                  aria-label={`${MONTH_LABELS[d.month - 1]}: ${val}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X labels */}
      <div className="flex gap-1.5">
        {data.map((d) => (
          <div
            key={`${d.year}-${d.month}-lbl`}
            className="flex-1 text-center text-[10px] text-[var(--text-tertiary)]"
          >
            {MONTH_LABELS[d.month - 1]}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Daily Activity Heatmap (last 30 days) ───────────────────────────────────

interface StatsActivityHeatmapProps {
  data: WeeklyActivity[];
  isLoading: boolean;
}

export function StatsActivityHeatmap({ data, isLoading }: StatsActivityHeatmapProps) {
  if (isLoading) {
    return (
      <div className="flex h-24 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Belum ada aktivitas"
        description="Mulai menulis untuk melihat pola aktivitasmu."
      />
    );
  }

  const max = Math.max(...data.map((d) => d.noteCount), 1);

  // Build last-30-day scaffold so empty days show as empty cells
  const today = new Date();
  const days: { date: string; noteCount: number; wordCount: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const found = data.find((x) => x.date === dateStr);
    days.push({ date: dateStr, noteCount: found?.noteCount ?? 0, wordCount: found?.wordCount ?? 0 });
  }

  function intensityClass(count: number): string {
    if (count === 0) return 'bg-[var(--surface-muted)]';
    const pct = count / max;
    if (pct < 0.25) return 'bg-[var(--accent)] opacity-25';
    if (pct < 0.5) return 'bg-[var(--accent)] opacity-50';
    if (pct < 0.75) return 'bg-[var(--accent)] opacity-75';
    return 'bg-[var(--accent)]';
  }

  const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {days.map(({ date, noteCount, wordCount }) => (
          <div
            key={date}
            className={cn(
              'group relative h-5 w-5 rounded-sm transition-opacity',
              intensityClass(noteCount)
            )}
            title={`${new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}: ${noteCount} catatan, ${wordCount.toLocaleString('id-ID')} kata`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
        <span>Sedikit</span>
        {[0.25, 0.5, 0.75, 1].map((op) => (
          <div
            key={op}
            className="h-3 w-3 rounded-sm bg-[var(--accent)]"
            style={{ opacity: op }}
          />
        ))}
        <span>Banyak</span>
      </div>
    </div>
  );
}
