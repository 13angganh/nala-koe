'use client';

import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useSeasonalTheme } from '@/hooks/use-seasonal-theme';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles } from 'lucide-react';
import { colors } from '@/tokens/colors';

const ACCENT_PRESETS = [
  { color: colors.brand[500], label: 'Sky' },          // #0ea5e9
  { color: '#8b5cf6', label: 'Violet' },               // reason: tidak ada violet token di tokens/colors
  { color: '#ec4899', label: 'Pink' },                 // reason: tidak ada pink token di tokens/colors
  { color: '#22c55e', label: 'Hijau' },                // reason: tidak ada green token di tokens/colors
  { color: '#f97316', label: 'Oranye' },               // reason: tidak ada orange token di tokens/colors
  { color: colors.semantic.error.DEFAULT, label: 'Merah' },   // #dc2626
  { color: '#14b8a6', label: 'Teal' },                 // reason: tidak ada teal token di tokens/colors
  { color: colors.semantic.warning.light, label: 'Kuning' },  // #fbbf24
] as const;

interface SettingsAccentPickerProps {
  className?: string;
}

export function SettingsAccentPicker({ className }: SettingsAccentPickerProps) {
  const { accentColor, setAccentColor } = useUiStore();
  const { preferences, setPreference } = useSettingsStore();
  const { activeTheme, isActive: isSeasonalActive } = useSeasonalTheme(
    preferences.enableSeasonalTheme ?? true
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Accent presets */}
      <div>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">
          Warna utama untuk tombol, tautan, dan elemen interaktif
        </p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map(({ color, label }) => (
            <Tooltip key={color}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setAccentColor(color)}
                  aria-label={`Pilih warna ${label}`}
                  aria-pressed={accentColor === color}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
                    accentColor === color
                      ? 'border-[var(--text-primary)] scale-110'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              </TooltipTrigger>
              <TooltipContent className="text-xs">{label}</TooltipContent>
            </Tooltip>
          ))}

          {/* Custom color input */}
          <Tooltip>
            <TooltipTrigger asChild>
              <label
                className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] text-[var(--text-tertiary)] hover:border-[var(--accent)] transition-colors"
                aria-label="Pilih warna kustom"
              >
                <span className="text-xs font-bold leading-none">+</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Pilih warna kustom"
                />
              </label>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Warna kustom</TooltipContent>
          </Tooltip>
        </div>

        {/* Current color display */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: accentColor }}
            aria-hidden
          />
          <span className="font-mono text-xs text-[var(--text-secondary)]">{accentColor}</span>
          {accentColor !== colors.brand[500] && (
            <button
              onClick={() => setAccentColor(colors.brand[500])}
              className="ml-auto text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Seasonal theme toggle */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Tema Musiman Otomatis</p>
              <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                Tema berubah otomatis saat Ramadan, Lebaran, dan Tahun Baru
              </p>
            </div>
          </div>
          <Switch
            checked={preferences.enableSeasonalTheme ?? true}
            onCheckedChange={(v) => setPreference('enableSeasonalTheme', v)}
            aria-label="Aktifkan tema musiman otomatis"
          />
        </div>

        {/* Active seasonal theme indicator */}
        {isSeasonalActive && activeTheme && (
          <div
            className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
            style={{
              backgroundColor: `${activeTheme.accentColor}18`,
              color: activeTheme.accentColor,
            }}
            role="status"
          >
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: activeTheme.accentColor }}
              aria-hidden
            />
            Tema <strong>{activeTheme.name}</strong> sedang aktif
          </div>
        )}

        {/* Seasonal schedule */}
        <div className="mt-3 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Jadwal tema</p>
          <div className="grid gap-1">
            {[
              { name: 'Ramadan', period: '~1–30 Maret' },
              { name: 'Lebaran', period: '~1–14 April' },
              { name: 'Tahun Baru', period: '25 Des – 5 Jan' },
            ].map(({ name, period }) => (
              <div key={name} className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{name}</span>
                <span className="text-[var(--text-tertiary)]">{period}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
