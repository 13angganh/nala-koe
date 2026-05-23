'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[var(--surface-base)] px-4 text-center">
      <div className="space-y-4">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Kamu sedang offline
        </h1>
        <p className="max-w-sm text-[var(--text-secondary)]">
          Tidak ada koneksi internet. Kamu masih bisa membaca catatan yang sudah tersimpan
          sebelumnya.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
      >
        Coba sambung ulang
      </button>
    </div>
  );
}
