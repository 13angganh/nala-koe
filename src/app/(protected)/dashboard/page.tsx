'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Layout, BarChart2, Clock, Plus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useRecentNotes } from '@/hooks/use-notes';
import { useCreateNote } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/notes/note-card';
import { NoteCardSkeleton } from '@/components/notes/note-card-skeleton';
import { ROUTES } from '@/constants/routes';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { StreakCard } from '@/components/notes/streak-card';
import { useStreak } from '@/hooks/use-streak';
import { MilestoneToast } from '@/components/shared/milestone-toast';
import { toast as sonnerToast } from 'sonner';

const QUICK_LINKS = [
  { label: 'Canvas', description: 'Papan sticky note bebas', href: ROUTES.CANVAS, icon: Layout, color: 'bg-[var(--success-subtle)] text-[var(--success)]' },
  { label: 'Timeline', description: 'Perjalanan catatanmu', href: ROUTES.TIMELINE, icon: Clock, color: 'bg-[var(--warning-subtle)] text-[var(--warning)]' },
  { label: 'Statistik', description: 'Insight menulis minggu ini', href: ROUTES.STATS, icon: BarChart2, color: 'bg-[var(--info-subtle)] text-[var(--info)]' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.displayName?.split(' ')[0] ?? 'Kamu';

  const { data: recentNotes = [], isLoading } = useRecentNotes(4);
  const { data: streakData } = useStreak();
  const milestoneFiredRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      streakData?.milestoneReached &&
      milestoneFiredRef.current !== streakData.milestoneReached
    ) {
      milestoneFiredRef.current = streakData.milestoneReached;
      sonnerToast.custom(() => (
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- reason: safe: milestoneReached is truthy (checked in if-guard above)
        <MilestoneToast streak={streakData.milestoneReached!} />
      ), { duration: 6000 });
    }
  }, [streakData?.milestoneReached]);
  const { mutateAsync: createNote, isPending: isCreating } = useCreateNote();

  async function handleCreateNote() {
    const note = await createNote({});
    router.push(ROUTES.NOTE(note.id));
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Halo, {firstName}
          </h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Ruang pikiran dan nuraniku — apa yang ingin kamu catat hari ini?
          </p>
        </div>
        <Button
          onClick={handleCreateNote}
          isLoading={isCreating}
          size="sm"
          className="shrink-0 gap-1.5"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Catatan baru
        </Button>
      </div>

      {/* Recent notes */}
      <section aria-labelledby="recent-notes-heading">
        <div className="flex items-center justify-between mb-3">
          <h2
            id="recent-notes-heading"
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            Catatan terbaru
          </h2>
          <Link
            href={ROUTES.NOTES}
            className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            Lihat semua
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }, (_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-6 text-center">
            <FileText className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-3" aria-hidden="true" />
            <p className="text-base text-[var(--text-tertiary)]">
              Belum ada catatan.{' '}
              <button
                onClick={handleCreateNote}
                className="text-[var(--accent)] hover:underline"
              >
                Buat sekarang
              </button>
            </p>
          </div>
        )}
      </section>

      {/* Streak card */}
      <StreakCard />

      {/* Quick links */}
      <section aria-labelledby="quick-links-heading">
        <h2
          id="quick-links-heading"
          className="text-sm font-medium text-[var(--text-primary)] mb-3"
        >
          Jelajahi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ label, description, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-base)]',
                'p-4 transition-all duration-100',
                'hover:border-[var(--border-emphasis)] hover:shadow-[var(--shadow-sm)]'
              )}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', color)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-100">
                  {label}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
