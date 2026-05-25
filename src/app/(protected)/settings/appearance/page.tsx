'use client';

import { useUiStore } from '@/stores/ui.store';
import { useSettingsStore } from '@/stores/settings.store';
import { Switch } from '@/components/ui/switch';
import { SettingsShell } from '@/components/settings/settings-shell';
import { SettingsAccentPicker } from '@/components/settings/settings-accent-picker';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor } from 'lucide-react';

const THEMES = [
  { value: 'light' as const, label: 'Terang', icon: Sun },
  { value: 'dark' as const, label: 'Gelap', icon: Moon },
  { value: 'system' as const, label: 'Sistem', icon: Monitor },
];

function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 border-b border-[var(--border)] last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="mt-0.5 text-sm text-[var(--text-tertiary)] leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AppearancePage() {
  const { theme, setTheme } = useUiStore();
  const { preferences, setPreference } = useSettingsStore();

  return (
    <SettingsShell>
      <div className="space-y-6">
        <section>
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Tema</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] divide-y divide-[var(--border)]">
            <SettingsRow label="Mode Warna" description="Pilih tampilan terang, gelap, atau ikuti sistem">
              <div className="flex gap-2">
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors min-w-[52px]',
                      theme === value
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </SettingsRow>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Warna Aksen & Tema Musiman</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4">
            <SettingsAccentPicker />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Preferensi</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] divide-y divide-[var(--border)]">
            <SettingsRow label="Tampilan Default" description="Grid atau daftar saat membuka halaman catatan">
              <div className="flex gap-1 rounded-lg border border-[var(--border)] p-0.5">
                {(['grid', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setPreference('defaultView', v)}
                    aria-pressed={preferences.defaultView === v}
                    className={cn('rounded-md px-3 py-1 text-xs transition-colors', preferences.defaultView === v ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
                  >
                    {v === 'grid' ? 'Grid' : 'Daftar'}
                  </button>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow label="Animasi Kartu" description="Animasi masuk saat daftar catatan dimuat">
              <Switch checked={preferences.enableAnimations ?? true} onCheckedChange={(v) => setPreference('enableAnimations', v)} aria-label="Aktifkan animasi kartu" />
            </SettingsRow>
            <SettingsRow label="Cuaca Otomatis" description="Simpan kondisi cuaca saat membuat catatan">
              <Switch checked={preferences.enableWeather} onCheckedChange={(v) => setPreference('enableWeather', v)} aria-label="Aktifkan cuaca otomatis" />
            </SettingsRow>
            <SettingsRow label="Lokasi Otomatis" description="Simpan lokasi saat membuat catatan (membutuhkan izin)">
              <Switch checked={preferences.enableLocation} onCheckedChange={(v) => setPreference('enableLocation', v)} aria-label="Aktifkan lokasi otomatis" />
            </SettingsRow>
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}
