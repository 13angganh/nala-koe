'use client';

import { SettingsShell } from '@/components/settings/settings-shell';
import { Shield, Fingerprint, Key, Lock } from 'lucide-react';

function InfoRow({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{description}</p>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <SettingsShell>
      <div className="space-y-6">
        <section>
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Informasi Keamanan</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4 space-y-4">
            <InfoRow
              icon={Shield}
              title="Enkripsi Data"
              description="Semua catatan disimpan di Firebase Firestore dengan enkripsi at-rest dari Google."
            />
            <InfoRow
              icon={Fingerprint}
              title="PIN Catatan Rahasia"
              description="PIN catatan rahasia disimpan sebagai hash di localStorage. Ini adalah gate UI, bukan enkripsi end-to-end."
            />
            <InfoRow
              icon={Key}
              title="Autentikasi"
              description="Login via email/password atau Google OAuth dikelola oleh Firebase Authentication."
            />
            <InfoRow
              icon={Lock}
              title="Kunci Biometrik"
              description="Dukungan kunci biometrik (sidik jari/wajah) direncanakan untuk versi mendatang."
            />
          </div>
        </section>
      </div>
    </SettingsShell>
  );
}
