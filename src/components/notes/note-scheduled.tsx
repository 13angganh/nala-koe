'use client';

import { useState } from 'react';
import { CalendarClock, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { cn } from '@/lib/utils';

interface NoteScheduledProps {
  isScheduled: boolean;
  scheduledAt: string | null;
  onChange: (isScheduled: boolean, scheduledAt: string | null) => void;
}

const PRESETS = [
  { label: 'Besok pagi', hours: 16 },      // ~16h from now ≈ tomorrow 8am
  { label: 'Lusa', hours: 40 },
  { label: '1 minggu', hours: 168 },
  { label: '1 bulan', hours: 720 },
];

function addHours(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString().slice(0, 16);
}

function formatScheduledAt(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function minDateTime(): string {
  // min = 5 minutes from now
  return new Date(Date.now() + 5 * 60_000).toISOString().slice(0, 16);
}

export function NoteScheduled({ isScheduled, scheduledAt, onChange }: NoteScheduledProps) {
  const [customValue, setCustomValue] = useState<string>(
    scheduledAt ? scheduledAt.slice(0, 16) : addHours(24)
  );
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  function handlePreset(hours: number) {
    const iso = new Date(Date.now() + hours * 3600_000).toISOString();
    setCustomValue(iso.slice(0, 16));
    onChange(true, iso);
  }

  function handleCustomChange(val: string) {
    setCustomValue(val);
    if (val) {
      onChange(true, new Date(val).toISOString());
    }
  }

  function handleRemove() {
    setShowRemoveConfirm(false);
    onChange(false, null);
  }

  const isPast = scheduledAt ? new Date(scheduledAt) < new Date() : false;

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
        <h3 className="text-sm font-medium text-[var(--text-primary)]">Catatan Terjadwal</h3>
      </div>

      {isScheduled && scheduledAt ? (
        /* ── Active state ─────────────────────────────────────────── */
        <div className="space-y-3">
          <div
            className={cn(
              'flex items-start gap-2 rounded-lg border p-3 text-sm',
              isPast
                ? 'border-[var(--error)] bg-[var(--error-subtle)] text-[var(--error)]'
                : 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
            )}
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">
                {isPast ? 'Jadwal sudah lewat' : 'Dijadwalkan muncul'}
              </p>
              <p className="mt-0.5 text-xs opacity-80">{formatScheduledAt(scheduledAt)}</p>
            </div>
          </div>

          {/* Change datetime */}
          <div className="space-y-1">
            <label
              htmlFor="scheduled-datetime"
              className="text-xs font-medium text-[var(--text-secondary)]"
            >
              Ubah waktu jadwal
            </label>
            <input
              id="scheduled-datetime"
              type="datetime-local"
              value={customValue}
              min={minDateTime()}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          {/* Remove */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[var(--error)] hover:bg-[var(--error-subtle)] hover:text-[var(--error)]"
            onClick={() => setShowRemoveConfirm(true)}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Hapus jadwal
          </Button>
        </div>
      ) : (
        /* ── Inactive state ──────────────────────────────────────── */
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)]">
            Pilih preset atau atur waktu manual. Catatan akan muncul di feed sesuai jadwal.
          </p>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p.hours)}
                className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent)]"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom datetime */}
          <div className="space-y-1">
            <label
              htmlFor="scheduled-datetime-new"
              className="text-xs font-medium text-[var(--text-secondary)]"
            >
              Atau pilih tanggal & waktu
            </label>
            <input
              id="scheduled-datetime-new"
              type="datetime-local"
              value={customValue}
              min={minDateTime()}
              onChange={(e) => setCustomValue(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              if (customValue) {
                onChange(true, new Date(customValue).toISOString());
              }
            }}
            disabled={!customValue}
          >
            <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
            Jadwalkan catatan ini
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={showRemoveConfirm}
        onOpenChange={setShowRemoveConfirm}
        title="Hapus jadwal?"
        description="Catatan ini tidak akan lagi dijadwalkan dan akan langsung terlihat di feed."
        confirmLabel="Hapus jadwal"
        variant="destructive"
        onConfirm={handleRemove}
      />
    </div>
  );
}
