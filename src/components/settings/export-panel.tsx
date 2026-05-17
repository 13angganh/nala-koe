'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useExport } from '@/hooks/use-export';
import { cn } from '@/lib/utils';
import { Download, FileText, FileCode, FileSpreadsheet, File, Archive, Loader2 } from 'lucide-react';
import type { ExportFormat, ExportOptions } from '@/types/import-export.types';

const FORMATS: Array<{ format: ExportFormat; label: string; icon: React.ElementType; description: string }> = [
  { format: 'markdown', label: 'Markdown', icon: FileCode, description: '.md — untuk Obsidian, Notion, Bear' },
  { format: 'txt', label: 'Teks Biasa', icon: FileText, description: '.txt — universal, mudah dibuka' },
  { format: 'json', label: 'Backup JSON', icon: Archive, description: '.json — backup lengkap, bisa diimpor kembali' },
  { format: 'xlsx', label: 'Spreadsheet', icon: FileSpreadsheet, description: '.xlsx — untuk Excel / Google Sheets' },
  { format: 'pdf', label: 'PDF', icon: File, description: '.pdf — siap cetak atau kirim' },
  { format: 'docx', label: 'Word', icon: FileText, description: '.docx — untuk Microsoft Word / Google Docs' },
];

export function ExportPanel() {
  const { exportNotes, isExporting, progress } = useExport();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [opts, setOpts] = useState({
    includeMetadata: true,
    includeMood: true,
    includeTags: true,
  });

  const handleExport = () => {
    exportNotes({
      format: selectedFormat,
      ...opts,
    } as ExportOptions);
  };

  return (
    <div className="space-y-4">
      {/* Format selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FORMATS.map(({ format, label, icon: Icon, description }) => (
          <button
            key={format}
            onClick={() => setSelectedFormat(format)}
            aria-pressed={selectedFormat === format}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
              selectedFormat === format
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--border)] hover:border-[var(--accent)]/40'
            )}
          >
            <Icon
              className={cn('mt-0.5 h-4 w-4 shrink-0', selectedFormat === format ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]')}
              aria-hidden
            />
            <div className="min-w-0">
              <p className={cn('text-sm font-medium', selectedFormat === format ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
                {label}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-tertiary)] truncate">{description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Options — hidden for JSON (exports raw) */}
      {selectedFormat !== 'json' && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] divide-y divide-[var(--border)]">
          {(
            [
              { key: 'includeMetadata', label: 'Sertakan metadata', desc: 'Tanggal dibuat, diperbarui, jumlah kata' },
              { key: 'includeMood', label: 'Sertakan mood', desc: 'Label emosi catatan' },
              { key: 'includeTags', label: 'Sertakan tag', desc: 'Tag / label catatan' },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 px-3 py-3">
              <div>
                <p className="text-sm text-[var(--text-primary)]">{label}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{desc}</p>
              </div>
              <Switch
                checked={opts[key]}
                onCheckedChange={(v) => setOpts((o) => ({ ...o, [key]: v }))}
                aria-label={label}
              />
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {isExporting && progress > 0 && (
        <div className="rounded-full bg-[var(--surface-muted)] h-1.5 overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto" size="md">
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Mengekspor...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden />
            Ekspor Semua Catatan
          </>
        )}
      </Button>
    </div>
  );
}
