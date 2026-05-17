'use client';

import { SettingsShell } from '@/components/settings/settings-shell';
import { ExportPanel } from '@/components/settings/export-panel';
import { ImportPanel } from '@/components/settings/import-panel';
import { Download, Upload } from 'lucide-react';

export default function DataPage() {
  return (
    <SettingsShell>
      <div className="space-y-8">
        {/* Export */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Download className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Ekspor</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Ekspor semua catatanmu ke berbagai format. File akan diunduh langsung ke perangkatmu.
          </p>
          <ExportPanel />
        </section>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Import */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wide">Impor</h2>
          </div>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Impor catatan dari Google Keep, ColorNote, atau file backup NalaKoe.
          </p>
          <ImportPanel />
        </section>
      </div>
    </SettingsShell>
  );
}
