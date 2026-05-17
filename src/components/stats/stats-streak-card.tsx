'use client';

import { Flame, Trophy, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import type { WritingStats } from '@/types/stats.types';

interface StatsStreakCardProps {
  stats: WritingStats | null | undefined;
  isLoading: boolean;
}

const MILESTONES = [3, 7, 14, 30, 50, 100];

export function StatsStreakCard({ stats, isLoading }: StatsStreakCardProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!stats) return null;

  const { currentStreak, longestStreak, totalNotes } = stats;

  // Next milestone
  const nextMilestone = MILESTONES.find((m) => m > currentStreak) ?? null;
  const prevMilestone =
    MILESTONES.filter((m) => m <= currentStreak).pop() ?? 0;
  const progress =
    nextMilestone !== null
      ? Math.min(
          ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100,
          100
        )
      : 100;

  return (
    <div className="space-y-4">
      {/* Main streak numbers */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4 text-center">
          <Flame
            className={cn(
              'mx-auto mb-1 h-5 w-5',
              currentStreak >= 3
                ? 'text-[var(--warning)]'
                : 'text-[var(--text-tertiary)]'
            )}
          />
          <p className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {currentStreak}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">Streak</p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4 text-center">
          <Trophy className="mx-auto mb-1 h-5 w-5 text-[var(--text-tertiary)]" />
          <p className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {longestStreak}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">Rekor</p>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4 text-center">
          <CalendarDays className="mx-auto mb-1 h-5 w-5 text-[var(--text-tertiary)]" />
          <p className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
            {totalNotes}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">Catatan</p>
        </div>
      </div>

      {/* Milestone progress */}
      {nextMilestone !== null && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">
              Milestone berikutnya: <strong>{nextMilestone} hari</strong>
            </span>
            <span className="tabular-nums text-[var(--text-tertiary)]">
              {currentStreak}/{nextMilestone}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={currentStreak}
              aria-valuemin={prevMilestone}
              aria-valuemax={nextMilestone}
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            {nextMilestone - currentStreak} hari lagi untuk mencapai milestone
          </p>
        </div>
      )}

      {/* All milestones */}
      <div className="flex flex-wrap gap-2">
        {MILESTONES.map((m) => (
          <div
            key={m}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
              currentStreak >= m
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface-muted)] text-[var(--text-tertiary)]'
            )}
          >
            <Flame className="h-3 w-3" aria-hidden="true" />
            {m} hari
          </div>
        ))}
      </div>
    </div>
  );
}
