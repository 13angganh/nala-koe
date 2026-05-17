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

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return null;

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // Hapus session cookie via server route (karena httpOnly tidak bisa dihapus client)
        void fetch('/api/auth/session', { method: 'DELETE' });
        router.replace(ROUTES.LOGIN);
      }
    });
    return unsubscribe;
  }, [router, setUser]);

  return (
    <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
  );
}
