'use client';

import {
  FileText,
  AlignLeft,
  Flame,
  Trophy,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { WritingStats } from '@/types/stats.types';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

function StatCard({ icon: Icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-shadow hover:shadow-sm',
        accent
          ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
          : 'border-[var(--border-subtle)] bg-[var(--surface-base)]'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            accent
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{label}</p>
      {sub && <p className="mt-1 text-xs text-[var(--text-tertiary)]">{sub}</p>}
    </div>
  );
}

function formatHour(h: number | null): string {
  if (h === null) return '—';
  const ampm = h < 12 ? 'pagi' : h < 17 ? 'siang' : h < 20 ? 'sore' : 'malam';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:00 ${ampm}`;
}

interface StatsOverviewProps {
  stats: WritingStats | null | undefined;
  isLoading: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!stats) return null;

  const cards: StatCardProps[] = [
    {
      icon: FileText,
      label: 'Total catatan',
      value: stats.totalNotes.toLocaleString('id-ID'),
      sub: `${stats.notesThisWeek} catatan minggu ini`,
    },
    {
      icon: AlignLeft,
      label: 'Total kata',
      value: stats.totalWords.toLocaleString('id-ID'),
      sub: `Rata-rata ${stats.averageWordsPerNote.toLocaleString('id-ID')} kata/catatan`,
    },
    {
      icon: TrendingUp,
      label: 'Kata minggu ini',
      value: stats.wordsThisWeek.toLocaleString('id-ID'),
      ...(stats.longestNote ? { sub: `Terpanjang: "${stats.longestNote.title || 'Tanpa judul'}" (${stats.longestNote.wordCount.toLocaleString('id-ID')} kata)` } : {}),
    },
    {
      icon: Flame,
      label: 'Streak saat ini',
      value: `${stats.currentStreak} hari`,
      sub: `Terpanjang: ${stats.longestStreak} hari`,
      accent: stats.currentStreak >= 3,
    },
    {
      icon: Trophy,
      label: 'Streak terpanjang',
      value: `${stats.longestStreak} hari`,
      ...(stats.lastActiveDate ? { sub: `Terakhir aktif: ${new Date(stats.lastActiveDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` } : {}),
    },
    {
      icon: Clock,
      label: 'Jam paling produktif',
      value: formatHour(stats.mostProductiveHour),
      sub: 'Berdasarkan waktu pembuatan catatan',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
