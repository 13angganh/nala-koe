'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { useKeyboard } from '@/hooks/use-keyboard';
import { Header } from '@/components/layouts/header';
import { Sidebar } from '@/components/layouts/sidebar';
import { CommandPalette } from '@/components/shared/command-palette';
import { PageLoader } from '@/components/shared/loading-spinner';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

function ProtectedLayoutInner({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuthStore();
  const { sidebarOpen, toggleCommandPalette, commandPaletteOpen, setCommandPaletteOpen } = useUiStore();

  useKeyboard([
    { key: 'k', modifiers: ['meta'], onKeyDown: toggleCommandPalette },
    { key: 'Escape', onKeyDown: () => { if (commandPaletteOpen) setCommandPaletteOpen(false); } },
  ]);

  // Both isLoading (initial auth check) and the moment right after logout
  // (isAuthenticated flips to false but the redirect to /login triggered by
  // ProtectedLayout's onAuthStateChanged hasn't finished navigating away
  // yet) show the loader instead of a bare `return null`. The blank
  // `return null` was part of the reported "logout leads to /dashboard
  // with a blank screen" — isAuthenticated going false and the actual
  // navigation away from /dashboard completing are two separate moments,
  // and this component still renders (something) in between them.
  if (isLoading || !isAuthenticated) return <PageLoader />;

  return (
    <div className="min-h-dvh bg-[var(--surface-base)]">
      <Header />
      <Sidebar />
      <main
        className={cn(
          'pt-14 transition-[padding-left] duration-300 ease-out',
          sidebarOpen ? 'lg:pl-56' : 'lg:pl-0'
        )}
      >
        <div className="min-h-[calc(100dvh-3.5rem)]">{children}</div>
      </main>
      <CommandPalette />
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Root cause of the reported "auto logout tak menentu waktunya": Firebase
    // Auth's onAuthStateChanged is documented to fire the FIRST time with
    // whatever it currently knows — which, before it's finished reading the
    // persisted session from IndexedDB, is null — and then fires AGAIN once
    // that read completes, with the real signed-in user if there is one.
    // That gap between the two calls isn't fixed; it depends on device and
    // network conditions (real-world reports range from near-instant up to
    // 20-30+ seconds), which is exactly the "tak tau batas waktunya kapan"
    // pattern reported. The code below used to treat every null callback —
    // including that very first, still-unconfirmed one — as "the user is
    // logged out", forcing a redirect to /login before Firebase had even
    // finished checking. The user WAS still logged in; the app just didn't
    // wait long enough to find out. Confirmed via
    // tests/unit/app/repro-auto-logout.test.tsx before this fix.
    //
    // authStateReady() is Firebase's own documented way to wait for that
    // first check to actually complete before trusting a null result.
    // hasCheckedOnce ensures we only apply this "wait and don't panic" grace
    // period to the very first callback of this effect's lifetime — a null
    // that arrives AFTER we've already confirmed a real signed-in user is a
    // genuine sign-out (token revoked, account disabled, user signed out in
    // another tab, etc.) and should redirect immediately, same as before.
    let hasCheckedOnce = false;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        hasCheckedOnce = true;
        setUser(user);
        return;
      }

      if (hasCheckedOnce) {
        // A previously-confirmed session just ended for real.
        setUser(null);
        void fetch('/api/auth/session', { method: 'DELETE' });
        router.replace(ROUTES.LOGIN);
        return;
      }

      // First callback of this mount, and it's null — could be a genuine
      // logged-out visitor, or could just be Firebase not having finished
      // its IndexedDB read yet. Wait for authStateReady() to find out for
      // sure before deciding.
      void auth.authStateReady().then(() => {
        hasCheckedOnce = true;
        const confirmedUser = auth.currentUser;
        setUser(confirmedUser);
        if (!confirmedUser) {
          void fetch('/api/auth/session', { method: 'DELETE' });
          router.replace(ROUTES.LOGIN);
        }
      });
    });
    return unsubscribe;
  }, [router, setUser]);

  return (
    <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
  );
}
