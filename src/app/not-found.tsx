import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[var(--surface-base)] px-4 text-center">
      <div className="space-y-2">
        <p className="text-8xl font-bold text-[var(--text-disabled)]">404</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Halaman tidak ditemukan
        </h1>
        <p className="max-w-sm text-[var(--text-secondary)]">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
      </div>
      <Link
        href={ROUTES.DASHBOARD}
        className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
