'use client';

import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStreak } from '@/hooks/use-streak';
import { Skeleton } from '@/components/ui/skeleton';

interface StreakCardProps {
  className?: string;
  compact?: boolean;
}

export function StreakCard({ className, compact = false }: StreakCardProps) {
  const { data, isLoading } = useStreak();

  if (isLoading) {
    return <Skeleton className={cn('h-24 rounded-xl', className)} />;
  }

  if (!data) return null;

  const { currentStreak, longestStreak, totalActiveDays, todayHasNote } = data;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2',
          className
        )}
      >
        <Flame
          className={cn('h-4 w-4 shrink-0', currentStreak > 0 ? 'text-orange-500' : 'text-[var(--text-tertiary)]')}
          aria-hidden="true"
        />
        <div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{currentStreak}</span>
          <span className="ml-1 text-xs text-[var(--text-secondary)]">hari berturut-turut</span>
        </div>
        {!todayHasNote && (
          <span className="ml-auto text-xs text-[var(--warning)] font-medium">Tulis hari ini!</span>
        )}
      </div>
    );
  }

  const stats = [
    {
      label: 'Streak aktif',
      value: currentStreak,
      unit: 'hari',
      icon: Flame,
      color: currentStreak > 0 ? 'text-orange-500' : 'text-[var(--text-tertiary)]',
      bg: currentStreak > 0 ? 'bg-orange-500/10' : 'bg-[var(--surface-muted)]',
    },
    {
      label: 'Terpanjang',
      value: longestStreak,
      unit: 'hari',
      icon: Trophy,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-subtle)]',
    },
    {
      label: 'Total hari aktif',
      value: totalActiveDays,
      unit: 'hari',
      icon: Calendar,
      color: 'text-[var(--success)]',
      bg: 'bg-[var(--success-subtle)]',
    },
  ];

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4',
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Streak Menulis</h3>
        </div>
        {!todayHasNote && (
          <span className="rounded-full bg-[var(--warning-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--warning)]">
            Belum menulis hari ini
          </span>
        )}
        {todayHasNote && currentStreak > 0 && (
          <span className="rounded-full bg-[var(--success-subtle)] px-2 py-0.5 text-xs font-semibold text-[var(--success)]">
            Sudah menulis hari ini
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, unit, icon: Icon, color, bg }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
              <Icon className={cn('h-4 w-4', color)} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-[var(--text-primary)] leading-none">
                {value}
                <span className="ml-0.5 text-xs font-normal text-[var(--text-tertiary)]">{unit}</span>
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mini calendar — last 7 days */}
      <div className="mt-4 border-t border-[var(--border)] pt-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          7 hari terakhir
        </p>
        <LastSevenDays activeDates={data.activeDates} />
      </div>
    </div>
  );
}

function LastSevenDays({ activeDates }: { activeDates: string[] }) {
  const activeSet = new Set(activeDates);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('id-ID', { weekday: 'narrow' });
    return { iso, label, active: activeSet.has(iso) };
  });

  return (
    <div className="flex gap-1" role="list" aria-label="Aktivitas 7 hari terakhir">
      {days.map(({ iso, label, active }) => (
        <div key={iso} className="flex flex-1 flex-col items-center gap-1" role="listitem">
          <div
            className={cn(
              'h-6 w-full rounded-md transition-colors duration-100',
              active
                ? 'bg-orange-400/80 dark:bg-orange-500/70'
                : 'bg-[var(--surface-muted)]'
            )}
            aria-label={`${iso}: ${active ? 'aktif' : 'tidak aktif'}`}
          />
          <span className="text-[9px] text-[var(--text-tertiary)]">{label}</span>
        </div>
      ))}
    </div>
  );
}
