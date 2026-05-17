'use client';

import { useState } from 'react';
import { SettingsShell } from '@/components/settings/settings-shell';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settings.store';
import { Shield, Fingerprint, Key } from 'lucide-react';

function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-[var(--border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SecurityPage() {
  const { preferences, setPreference } = useSettingsStore();
  const [biometricSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!window.PublicKeyCredential;
  });

  return (
    <SettingsShell>
      <div className="space-y-6">
        <section>
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Kunci Catatan</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] divide-y divide-[var(--border)]">
            <SettingsRow
              label="Kunci Biometrik"
              description={biometricSupported ? 'Gunakan sidik jari atau wajah untuk membuka catatan rahasia' : 'Perangkat tidak mendukung biometrik'}
            >
              <Switch
                checked={preferences.enableBiometric ?? false}
                onCheckedChange={(v) => setPreference('enableBiometric' as keyof typeof preferences, v as never)}
                disabled={!biometricSupported}
                aria-label="Aktifkan kunci biometrik"
              />
            </SettingsRow>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Informasi</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4 space-y-3">
            <div className="flex gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Enkripsi Data</p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Semua catatan disimpan di Firebase Firestore dengan enkripsi at-rest dari Google.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">PIN Lokal</p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">PIN catatan rahasia disimpan sebagai hash di localStorage. Ini adalah gate UI, bukan enkripsi end-to-end.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Key className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Autentikasi</p>
                <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Login via email/password atau Google OAuth dikelola oleh Firebase Authentication.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}
