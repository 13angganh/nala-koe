'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Sun, Moon, Monitor, PanelLeft, LogOut, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUiStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { logout } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { MobileNav } from './mobile-nav';

type Theme = 'light' | 'dark' | 'system';

const THEME_ITEMS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
];

export function Header() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toggleSidebar, theme, setTheme, toggleCommandPalette } = useUiStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.error === null) {
      // Hapus session cookie via server route (karena httpOnly tidak bisa dihapus client)
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.replace(ROUTES.LOGIN);
    } else {
      toast.error('Gagal keluar. Coba lagi.');
    }
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? 'N').toUpperCase();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[var(--z-header)] flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-base)] px-4">
        <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <PanelLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Buka menu navigasi">
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>

        <div className="flex-1" />

        <Button variant="outline" className="hidden sm:flex h-9 w-64 justify-start gap-2 text-[var(--text-tertiary)] text-sm font-normal"
          onClick={toggleCommandPalette} aria-label="Buka command palette (Cmd+K)">
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Cari catatan…</span>
          <kbd className="ml-auto text-xs text-[var(--text-tertiary)] font-mono">⌘K</kbd>
        </Button>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={toggleCommandPalette} aria-label="Cari">
          <Search className="h-4 w-4" aria-hidden="true" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ganti tema">
              <ThemeIcon className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Tema</DropdownMenuLabel>
            {THEME_ITEMS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem key={value} onClick={() => setTheme(value)} className="gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
                {theme === value && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" aria-label="Menu profil">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'Profil'} />
                <AvatarFallback className="text-xs bg-[var(--accent-subtle)] text-[var(--accent)]">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium text-[var(--text-primary)] truncate">{user?.displayName ?? 'Pengguna'}</p>
              <p className="text-xs font-normal text-[var(--text-tertiary)] truncate mt-0.5 lowercase">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(ROUTES.SETTINGS)} className="gap-2">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} destructive className="gap-2">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
