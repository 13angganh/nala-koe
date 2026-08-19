'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SettingsShell } from '@/components/settings/settings-shell';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore } from '@/stores/settings.store';
import { animation } from '@/tokens/animation';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { isOk } from '@/lib/normalizer';
import { logout } from '@/services/auth.service';
import { toast } from 'sonner';
import { Palette, Shield, Database, ChevronRight, LogOut, UserCircle } from 'lucide-react';

const SETTINGS_CARDS = [
  {
    href: ROUTES.SETTINGS_ACCOUNT,
    label: 'Akun',
    description: 'Info akun, reset password',
    icon: UserCircle,
  },
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
  const animationsEnabled = useSettingsStore((s) => s.preferences.enableAnimations ?? true);

  const handleLogout = async () => {
    // Same fix as header.tsx's handleLogout (see that file for the full
    // writeup): router.push(ROUTES.LOGIN) here used to race against
    // ProtectedLayout's onAuthStateChanged listener, which independently
    // redirects once logout()'s signOut() completes. This settings page
    // logout button had the identical unguarded pattern — missed when
    // header.tsx was fixed because only the header dropdown's logout was
    // reported at the time, but this button goes through the same
    // Firebase signOut() + ProtectedLayout race. logout() alone is
    // sufficient; ProtectedLayout is the single source of truth for the
    // post-logout cookie-clear + redirect sequence.
    const result = await logout();
    if (!isOk(result)) {
      toast.error(result.error.message);
    }
  };

  return (
    <SettingsShell>
      <motion.div
        className="space-y-6"
        {...(animationsEnabled
          ? {
              initial: animation.variants.slideUp.initial,
              animate: animation.variants.slideUp.animate,
              transition: animation.variants.slideUp.transition,
            }
          : {})}
      >
        {/* Profile card — links to the new Akun page instead of
            duplicating account info inline here */}
        {user && (
          <Link href={ROUTES.SETTINGS_ACCOUNT}>
            <motion.section
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4 transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--surface-subtle)]"
              {...(animationsEnabled ? { whileHover: { x: 2 }, whileTap: { scale: 0.99 } } : {})}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white text-sm font-semibold">
                  {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {user.displayName ?? 'Pengguna NalaKoe'}
                  </p>
                  <p className="truncate text-sm text-[var(--text-tertiary)] lowercase">{user.email}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden />
              </div>
            </motion.section>
          </Link>
        )}

        {/* Settings nav cards — mobile only. SettingsShell already renders
            this same navigation as a proper side-nav on desktop (sm:flex);
            showing both at once on desktop was the reported "duplikat
            menu, mubazir banget". On mobile, SettingsShell's own nav is a
            small horizontal pill row (sm:hidden in settings-shell.tsx) —
            these larger cards remain the primary way to navigate there,
            so they're kept, just scoped to the same breakpoint the pill
            row uses. */}
        <section className="sm:hidden">
          <div className="space-y-2">
            {SETTINGS_CARDS.map(({ href, label, description, icon: Icon }) => (
              <motion.div key={href} {...(animationsEnabled ? { whileHover: { x: 2 }, whileTap: { scale: 0.99 } } : {})}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-base)] p-4 transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--surface-subtle)]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)]">
                    <Icon className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden />
                </Link>
              </motion.div>
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

        <p className="text-center text-sm text-[var(--text-tertiary)]">NalaKoe · Versi {process.env.NEXT_PUBLIC_APP_VERSION}</p>
      </motion.div>
    </SettingsShell>
  );
}
