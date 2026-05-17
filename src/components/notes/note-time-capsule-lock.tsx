'use client';

import { useEffect, useRef, useState } from 'react';
import { addDays, addMonths, addYears, format, startOfDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Lock, Unlock, Timer, Clock, AlertCircle, X, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTimeCapsule } from '@/hooks/use-time-capsule';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NoteTimeCapsuleLockProps {
  isTimeCapsule: boolean;
  timeCapsuleUnlockAt: string | null;
  onTimeCapsuleChange: (isTimeCapsule: boolean, unlockAt: string | null) => void;
  className?: string;
}

// ─── Preset buttons ───────────────────────────────────────────────────────────

const PRESETS: Array<{ label: string; fn: () => Date }> = [
  { label: '1 minggu', fn: () => addDays(new Date(), 7) },
  { label: '1 bulan', fn: () => addMonths(new Date(), 1) },
  { label: '3 bulan', fn: () => addMonths(new Date(), 3) },
  { label: '6 bulan', fn: () => addMonths(new Date(), 6) },
  { label: '1 tahun', fn: () => addYears(new Date(), 1) },
  { label: '2 tahun', fn: () => addYears(new Date(), 2) },
];

// ─── Countdown display ────────────────────────────────────────────────────────

function CountdownDisplay({ unlockAt }: { unlockAt: Date }) {
  const [, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const now = new Date();
  const diffMs = unlockAt.getTime() - now.getTime();

  if (diffMs <= 0) {
    return (
      <span className="text-[var(--success)] text-xs font-medium flex items-center gap-1">
        <Unlock className="h-3 w-3" aria-hidden="true" />
        Sudah terbuka
      </span>
    );
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
      <Clock className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" aria-hidden="true" />
      {days > 0 && <span>{days}h</span>}
      <span>{String(hours).padStart(2, '0')}j</span>
      <span>{String(minutes).padStart(2, '0')}m</span>
      <span>{String(seconds).padStart(2, '0')}d</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NoteTimeCapsuleLock({
  isTimeCapsule,
  timeCapsuleUnlockAt,
  onTimeCapsuleChange,
  className,
}: NoteTimeCapsuleLockProps) {
  const { status, validateUnlockDate } = useTimeCapsule(isTimeCapsule, timeCapsuleUnlockAt);

  // Date picker state (min date = tomorrow)
  const minDate = format(addDays(startOfDay(new Date()), 1), 'yyyy-MM-dd');
  const [customDate, setCustomDate] = useState<string>(
    timeCapsuleUnlockAt
      ? format(new Date(timeCapsuleUnlockAt), 'yyyy-MM-dd')
      : format(addDays(new Date(), 7), 'yyyy-MM-dd')
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  function handleEnable(date: Date) {
    const error = validateUnlockDate(date);
    if (error) {
      setDateError(error);
      return;
    }
    setDateError(null);
    onTimeCapsuleChange(true, date.toISOString());
  }

  function handlePreset(preset: typeof PRESETS[number]) {
    const date = preset.fn();
    setCustomDate(format(date, 'yyyy-MM-dd'));
    handleEnable(date);
  }

  function handleCustomDateChange(value: string) {
    setCustomDate(value);
    setDateError(null);
  }

  function handleCustomDateConfirm() {
    if (!customDate) return;
    const date = new Date(customDate + 'T12:00:00');
    handleEnable(date);
  }

  function handleRemove() {
    setShowRemoveConfirm(true);
  }

  function confirmRemove() {
    onTimeCapsuleChange(false, null);
    setShowRemoveConfirm(false);
  }

  // ── Locked state ──────────────────────────────────────────────────────────

  if (isTimeCapsule && status.isLocked && status.unlockAt) {
    return (
      <div
        className={cn(
          'rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-3 space-y-2',
          className
        )}
        role="status"
        aria-label="Catatan dikunci sebagai kapsul waktu"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)]/15 shrink-0">
              <Lock className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">Kapsul Waktu</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Terbuka{' '}
                {format(status.unlockAt, "d MMM yyyy 'pukul' HH:mm", { locale: localeId })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[var(--text-tertiary)] hover:text-[var(--error)] transition-colors p-0.5 rounded"
            aria-label="Hapus kapsul waktu"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <CountdownDisplay unlockAt={status.unlockAt} />

        <ConfirmDialog
          open={showRemoveConfirm}
          onOpenChange={setShowRemoveConfirm}
          title="Hapus kapsul waktu?"
          description="Catatan ini akan kembali dapat dibaca sekarang. Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Ya, hapus kunci"
          variant="destructive"
          onConfirm={confirmRemove}
        />
      </div>
    );
  }

  // ── Unlocked (was capsule, now open) ─────────────────────────────────────

  if (isTimeCapsule && status.isUnlocked) {
    return (
      <div
        className={cn(
          'rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/5 p-3',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Unlock className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
            <p className="text-xs font-medium text-[var(--text-primary)]">Kapsul Waktu Terbuka</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors p-0.5 rounded"
            aria-label="Hapus status kapsul waktu"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-1 ml-6">
          Catatan ini dibuka pada{' '}
          {status.unlockAt &&
            format(status.unlockAt, "d MMM yyyy", { locale: localeId })}
        </p>

        <ConfirmDialog
          open={showRemoveConfirm}
          onOpenChange={setShowRemoveConfirm}
          title="Hapus status kapsul waktu?"
          description="Catatan ini tidak akan lagi bertanda kapsul waktu."
          confirmLabel="Hapus"
          variant="destructive"
          onConfirm={confirmRemove}
        />
      </div>
    );
  }

  // ── Setup form ────────────────────────────────────────────────────────────

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
        <p className="text-xs font-medium text-[var(--text-primary)]">Kapsul Waktu</p>
      </div>
      <p className="text-[11px] text-[var(--text-tertiary)]">
        Catatan ini akan dikunci dan baru bisa dibaca pada tanggal yang kamu tentukan.
      </p>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePreset(p)}
            className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)] pointer-events-none" aria-hidden="true" />
          <Input
            type="date"
            min={minDate}
            value={customDate}
            onChange={(e) => handleCustomDateChange(e.target.value)}
            className="pl-8 h-8 text-xs"
            aria-label="Pilih tanggal buka kapsul"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCustomDateConfirm}
          disabled={!customDate}
          className="h-8 text-xs shrink-0"
        >
          Kunci
        </Button>
      </div>

      {dateError && (
        <p className="flex items-center gap-1.5 text-[11px] text-[var(--error)]">
          <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
          {dateError}
        </p>
      )}
    </div>
  );
}
