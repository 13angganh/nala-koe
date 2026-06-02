'use client';

import { useUiStore } from '@/stores/ui.store';
import { useSettingsStore } from '@/stores/settings.store';
import { Switch } from '@/components/ui/switch';
import { SettingsShell } from '@/components/settings/settings-shell';
import { SettingsAccentPicker } from '@/components/settings/settings-accent-picker';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor, Palette, LayoutGrid, Sparkles, MapPin, Wind } from 'lucide-react';

const THEMES = [
  { value: 'light' as const, label: 'Terang', icon: Sun },
  { value: 'dark'  as const, label: 'Gelap',  icon: Moon },
  { value: 'system' as const, label: 'Sistem', icon: Monitor },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
      {children}
    </h2>
  );
}

/** Row dengan icon + teks di kiri, kontrol di kanan — konsisten dengan halaman Security & Data */
function SettingsRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-[var(--border)] last:border-0">
      {Icon && (
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export default function AppearancePage() {
  const { theme, setTheme } = useUiStore();
  const { preferences, setPreference } = useSettingsStore();

  return (
    <SettingsShell>
      <div className="space-y-7">

        {/* Tema */}
        <section>
          <SectionTitle>Tema</SectionTitle>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4">
            <SettingsRow icon={Palette} label="Mode Warna" description="Pilih tampilan terang, gelap, atau ikuti sistem" />
            {/* Tombol tema: baris terpisah di bawah deskripsi untuk menghindari overflow */}
            <div className="flex gap-2 mt-1 pl-7">
              {THEMES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm transition-colors',
                    theme === value
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Warna Aksen & Tema Musiman */}
        <section>
          <SectionTitle>Warna Aksen &amp; Tema Musiman</SectionTitle>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4">
            <SettingsAccentPicker />
          </div>
        </section>

        {/* Preferensi */}
        <section>
          <SectionTitle>Preferensi</SectionTitle>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4 space-y-0 divide-y divide-[var(--border)]">

            {/* Tampilan Default — toggle pill */}
            <div className="flex items-center gap-3 py-4 first:pt-0 last:pb-0">
              <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">Tampilan Default</p>
                <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">Grid atau daftar saat membuka halaman catatan</p>
              </div>
              <div className="shrink-0 flex gap-0.5 rounded-lg border border-[var(--border)] p-0.5">
                {(['grid', 'list'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setPreference('defaultView', v)}
                    aria-pressed={preferences.defaultView === v}
                    className={cn(
                      'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                      preferences.defaultView === v
                        ? 'bg-[var(--accent)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    )}
                  >
                    {v === 'grid' ? 'Grid' : 'Daftar'}
                  </button>
                ))}
              </div>
            </div>

            <SettingsRow icon={Sparkles} label="Animasi Kartu" description="Animasi masuk saat daftar catatan dimuat">
              <Switch
                checked={preferences.enableAnimations}
                onCheckedChange={(v) => setPreference('enableAnimations', v)}
                aria-label="Aktifkan animasi kartu"
              />
            </SettingsRow>

            <SettingsRow icon={Wind} label="Cuaca Otomatis" description="Simpan kondisi cuaca saat membuat catatan">
              <Switch
                checked={preferences.enableWeather}
                onCheckedChange={(v) => setPreference('enableWeather', v)}
                aria-label="Aktifkan cuaca otomatis"
              />
            </SettingsRow>

            <SettingsRow icon={MapPin} label="Lokasi Otomatis" description="Simpan lokasi saat membuat catatan (membutuhkan izin)">
              <Switch
                checked={preferences.enableLocation}
                onCheckedChange={(v) => setPreference('enableLocation', v)}
                aria-label="Aktifkan lokasi otomatis"
              />
            </SettingsRow>

          </div>
        </section>

      </div>
    </SettingsShell>
  );
}
