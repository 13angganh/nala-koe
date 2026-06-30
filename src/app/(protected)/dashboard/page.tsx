'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Layout, BarChart2, Clock, Plus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useRecentNotes } from '@/hooks/use-notes';
import { useCreateNote } from '@/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/components/notes/note-card';
import { AnimatedNoteCard } from '@/components/notes/animated-note-card';
import { NoteCardSkeleton } from '@/components/notes/note-card-skeleton';
import { ROUTES } from '@/constants/routes';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { animation } from '@/tokens/animation';
import { cn } from '@/lib/utils';
import { StreakCard } from '@/components/notes/streak-card';
import { useStreak } from '@/hooks/use-streak';
import { MilestoneToast } from '@/components/shared/milestone-toast';
import { toast as sonnerToast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useTrashNote, useArchiveNote } from '@/hooks/use-notes';
import { useSettingsStore } from '@/stores/settings.store';

const QUICK_LINKS = [
  { label: 'Canvas', description: 'Papan sticky note bebas', href: ROUTES.CANVAS, icon: Layout, color: 'bg-[var(--success-subtle)] text-[var(--success)]' },
  { label: 'Timeline', description: 'Perjalanan catatanmu', href: ROUTES.TIMELINE, icon: Clock, color: 'bg-[var(--warning-subtle)] text-[var(--warning)]' },
  { label: 'Statistik', description: 'Insight menulis minggu ini', href: ROUTES.STATS, icon: BarChart2, color: 'bg-[var(--info-subtle)] text-[var(--info)]' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.displayName?.split(' ')[0] ?? 'Kamu';
  const animationsEnabled = useSettingsStore((s) => s.preferences.enableAnimations ?? true);
  const reveal = useCallback(
    (delay: number) =>
      animationsEnabled
        ? {
            initial: animation.variants.slideUp.initial,
            animate: animation.variants.slideUp.animate,
            transition: { ...animation.variants.slideUp.transition, delay },
          }
        : {},
    [animationsEnabled]
  );

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
  const { mutate: trashNote } = useTrashNote();
  const { mutate: archiveNote } = useArchiveNote();
  const [pendingTrashId, setPendingTrashId] = useState<string | null>(null);
  const handleTrash = useCallback((id: string) => setPendingTrashId(id), []);
  const handleArchive = useCallback((id: string) => archiveNote(id), [archiveNote]);
  const confirmTrash = useCallback(() => {
    if (pendingTrashId) { trashNote(pendingTrashId); setPendingTrashId(null); }
  }, [pendingTrashId, trashNote]);

  async function handleCreateNote() {
    const note = await createNote({});
    router.push(ROUTES.NOTE(note.id));
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-8">
      {/* Greeting */}
      <motion.div
        {...reveal(0)}
        className="flex items-start justify-between gap-4"
      >
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
      </motion.div>

      {/* Recent notes */}
      <motion.section
        aria-labelledby="recent-notes-heading"
        {...reveal(0.05)}
      >
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
            {recentNotes.map((note, i) => (
              <AnimatedNoteCard key={note.id} index={i} enabled={animationsEnabled}>
                <NoteCard
                  note={note}
                  onTrash={handleTrash}
                  onArchive={handleArchive}
                />
              </AnimatedNoteCard>
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
      </motion.section>

      {/* Streak card */}
      <motion.div {...reveal(0.1)}>
        <StreakCard />
      </motion.div>

      {/* Quick links */}
      <motion.section
        aria-labelledby="quick-links-heading"
        {...reveal(0.15)}
      >
        <h2
          id="quick-links-heading"
          className="text-sm font-medium text-[var(--text-primary)] mb-3"
        >
          Jelajahi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ label, description, href, icon: Icon, color }) => (
            <motion.div
              key={href}
              {...(animationsEnabled ? { whileHover: { y: -2 }, whileTap: { scale: 0.98 } } : {})}
            >
              <Link
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
            </motion.div>
          ))}
        </div>
      </motion.section>

      <ConfirmDialog
        isOpen={!!pendingTrashId}
        title="Pindahkan ke sampah?"
        description="Catatan akan dihapus otomatis setelah 30 hari di sampah."
        confirmLabel="Pindahkan"
        cancelLabel="Batal"
        variant="destructive"
        onConfirm={confirmTrash}
        onCancel={() => setPendingTrashId(null)}
      />
    </div>
  );
}
