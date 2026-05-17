'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useImport } from '@/hooks/use-import';
import { cn } from '@/lib/utils';
import { Upload, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import type { ImportSource } from '@/types/import-export.types';

const SOURCES: Array<{ source: ImportSource; label: string; description: string; accept: string }> = [
  {
    source: 'google-keep',
    label: 'Google Keep',
    description: 'File JSON dari Google Takeout (Keep)',
    accept: '.json',
  },
  {
    source: 'colornote',
    label: 'ColorNote',
    description: 'File backup JSON dari ColorNote',
    accept: '.json',
  },
  {
    source: 'json',
    label: 'Backup NalaKoe',
    description: 'File backup JSON yang diekspor dari NalaKoe',
    accept: '.json',
  },
];

export function ImportPanel() {
  const { importFile, isImporting, result, reset } = useImport();
  const [selectedSource, setSelectedSource] = useState<ImportSource>('google-keep');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (result) reset();
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    await importFile(selectedFile, selectedSource);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (result) reset();
  };

  return (
    <div className="space-y-4">
      {/* Source selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SOURCES.map(({ source, label, description }) => (
          <button
            key={source}
            onClick={() => { setSelectedSource(source); clearFile(); }}
            aria-pressed={selectedSource === source}
            className={cn(
              'rounded-xl border p-3 text-left transition-colors',
              selectedSource === source
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--border)] hover:border-[var(--accent)]/40'
            )}
          >
            <p className={cn('text-sm font-medium', selectedSource === source ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
              {label}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{description}</p>
          </button>
        ))}
      </div>

      {/* File drop zone */}
      <label
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors',
          selectedFile
            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
            : 'border-[var(--border)] hover:border-[var(--accent)]/60'
        )}
      >
        {selectedFile ? (
          <>
            <CheckCircle className="h-8 w-8 text-[var(--accent)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--text-primary)]">{selectedFile.name}</p>
            <p className="text-xs text-[var(--text-tertiary)]">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-[var(--text-tertiary)]" aria-hidden />
            <p className="text-sm font-medium text-[var(--text-primary)]">Pilih atau seret file JSON</p>
            <p className="text-xs text-[var(--text-tertiary)]">Hanya file .json yang didukung</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Pilih file untuk diimpor"
        />
      </label>

      {/* Result */}
      {result && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border p-3',
            result.imported > 0
              ? 'border-[var(--success)]/30 bg-[var(--success)]/5'
              : 'border-[var(--error)]/30 bg-[var(--error)]/5'
          )}
          role="status"
        >
          {result.imported > 0 ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--error)]" aria-hidden />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {result.imported} dari {result.total} catatan berhasil diimpor
            </p>
            {result.skipped > 0 && (
              <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                {result.skipped} dilewati
                {result.errors[0] && ` — ${result.errors[0].reason}`}
              </p>
            )}
          </div>
          <button onClick={reset} aria-label="Tutup hasil import" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleImport}
          disabled={!selectedFile || isImporting}
          size="md"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Mengimpor...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" aria-hidden />
              Impor Catatan
            </>
          )}
        </Button>
        {selectedFile && (
          <Button variant="outline" size="md" onClick={clearFile} disabled={isImporting}>
            Batal
          </Button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-[var(--text-tertiary)]">
        Catatan yang diimpor akan ditambahkan ke koleksimu. Tanggal asli catatan akan dipertahankan di field{' '}
        <code className="font-mono">originalCreatedAt</code>.
      </p>
    </div>
  );
}
