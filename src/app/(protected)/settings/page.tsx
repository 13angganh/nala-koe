'use client';

import Link from 'next/link';
import { SettingsShell } from '@/components/settings/settings-shell';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { logout } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Palette, Shield, Database, ChevronRight, LogOut } from 'lucide-react';

const SETTINGS_CARDS = [
  {
    href: ROUTES.SETTINGS_APPEARANCE,
    label: 'Tampilan',
    description: 'Tema, warna aksen, tampilan default',
    icon: Palette,
  },
  {
    href: ROUTES.SETTINGS_SECURITY,
    label: 'Keamanan',
    description: 'Kunci biometrik, PIN, privasi',
    icon: Shield,
  },
  {
    href: ROUTES.SETTINGS_DATA,
    label: 'Data',
    description: 'Ekspor catatan, impor dari Keep/ColorNote',
    icon: Database,
  },
] as const;

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();
    if (result.ok) {
      router.push(ROUTES.LOGIN);
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <SettingsShell>
      <div className="space-y-6">
        {/* Profile card */}
        {user && (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white text-sm font-semibold">
                {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {user.displayName ?? 'Pengguna NalaKoe'}
                </p>
                <p className="truncate text-xs text-[var(--text-tertiary)]">{user.email}</p>
              </div>
            </div>
          </section>
        )}

        {/* Settings nav cards */}
        <section>
          <div className="space-y-2">
            {SETTINGS_CARDS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4 transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--surface-subtle)]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
                  <Icon className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden />
              </Link>
            ))}
          </div>
        </section>

        {/* Logout */}
        <section>
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            className="w-full text-[var(--error)] border-[var(--error)]/30 hover:bg-[var(--error)]/5 hover:border-[var(--error)]"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Keluar
          </Button>
        </section>

        <p className="text-center text-xs text-[var(--text-tertiary)]">NalaKoe · Versi 1.0.0</p>
      </div>
    </SettingsShell>
  );
}
