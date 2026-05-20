'use client';

import { useState } from 'react';
import { BarChart2, TrendingUp, Smile, Tag, CalendarClock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useWritingStats,
  useMoodInsights,
  useMonthlyStats,
  useWeeklyActivity,
  useTagFrequency,
  useScheduledNotes,
} from '@/hooks/use-stats';
import {
  StatsOverview,
  StatsMoodChart,
  StatsMonthlyChart,
  StatsActivityHeatmap,
  StatsStreakCard,
  TagCloudVisual,
  ScheduledNotesPanel,
} from '@/components/stats';

type TabId = 'overview' | 'mood' | 'activity' | 'streak' | 'tags' | 'scheduled';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Ringkasan', icon: BarChart2 },
  { id: 'activity', label: 'Aktivitas', icon: TrendingUp },
  { id: 'streak', label: 'Streak', icon: Flame },
  { id: 'mood', label: 'Mood', icon: Smile },
  { id: 'tags', label: 'Tag Cloud', icon: Tag },
  { id: 'scheduled', label: 'Terjadwal', icon: CalendarClock },
];

type WritingMode = 'notes' | 'words';

export default function StatsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [writingMode, setWritingMode] = useState<WritingMode>('notes');

  const { data: writingStats, isLoading: loadingWriting } = useWritingStats();
  const { data: moodInsights = [], isLoading: loadingMood } = useMoodInsights();
  const { data: monthlyStats = [], isLoading: loadingMonthly } = useMonthlyStats(6);
  const { data: weeklyActivity = [], isLoading: loadingWeekly } = useWeeklyActivity(30);
  const { data: tagFrequency = [], isLoading: loadingTags } = useTagFrequency();
  const { data: scheduledNotes = [], isLoading: loadingScheduled } = useScheduledNotes();

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Statistik</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Insight dan pola dari kebiasaan menulismu
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-1 scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-[var(--surface-base)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            aria-current={activeTab === id ? 'page' as const : undefined}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <section aria-label="Ringkasan statistik">
            <StatsOverview stats={writingStats} isLoading={loadingWriting} />
          </section>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <section
              aria-label="Grafik bulanan"
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Aktivitas 6 bulan terakhir
                </h2>
                <div className="flex rounded-lg border border-[var(--border-subtle)] p-0.5 text-xs">
                  {(['notes', 'words'] as WritingMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setWritingMode(m)}
                      className={cn(
                        'rounded-md px-2.5 py-1 transition-colors',
                        writingMode === m
                          ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-secondary)]'
                      )}
                    >
                      {m === 'notes' ? 'Catatan' : 'Kata'}
                    </button>
                  ))}
                </div>
              </div>
              <StatsMonthlyChart data={monthlyStats} isLoading={loadingMonthly} mode={writingMode} />
            </section>

            <section
              aria-label="Heatmap 30 hari"
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5"
            >
              <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                Pola aktivitas 30 hari
              </h2>
              <StatsActivityHeatmap data={weeklyActivity} isLoading={loadingWeekly} />
            </section>
          </div>
        )}

        {activeTab === 'streak' && (
          <section
            aria-label="Streak dan milestone"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5"
          >
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Streak & Milestone
            </h2>
            <StatsStreakCard stats={writingStats} isLoading={loadingWriting} />
          </section>
        )}

        {activeTab === 'mood' && (
          <section
            aria-label="Distribusi mood"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5"
          >
            <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
              Distribusi mood
            </h2>
            <StatsMoodChart insights={moodInsights} isLoading={loadingMood} />
          </section>
        )}

        {activeTab === 'tags' && (
          <section
            aria-label="Tag cloud"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Tag Cloud</h2>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  Tag lebih besar = lebih sering dipakai. Klik untuk filter catatan.
                </p>
              </div>
              {tagFrequency.length > 0 && (
                <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]">
                  {tagFrequency.length} tag
                </span>
              )}
            </div>
            <TagCloudVisual tags={tagFrequency} isLoading={loadingTags} />
          </section>
        )}

        {activeTab === 'scheduled' && (
          <section aria-label="Catatan terjadwal">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Catatan Terjadwal
                </h2>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  Catatan yang akan muncul di feed pada waktu tertentu
                </p>
              </div>
              {scheduledNotes.length > 0 && (
                <span className="shrink-0 rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                  {scheduledNotes.length} terjadwal
                </span>
              )}
            </div>
            <ScheduledNotesPanel notes={scheduledNotes} isLoading={loadingScheduled} />
          </section>
        )}
      </div>
    </div>
  );
}
