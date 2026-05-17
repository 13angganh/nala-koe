'use client';

import { useAuthStore } from '@/stores/auth.store';

interface AuthState {
  user: ReturnType<typeof useAuthStore>['user'];
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Thin wrapper atas useAuthStore.
 *
 * Menggunakan store state — BUKAN subscription Firebase tersendiri.
 * Subscription onAuthStateChanged yang sesungguhnya hidup di ProtectedLayout
 * (src/app/(protected)/layout.tsx) dan memperbarui store via setUser().
 *
 * Alasan: hook standalone yang membuat subscription Firebase sendiri
 * akan memiliki state auth terpisah dari useAuthStore, sehingga
 * komponen yang menggunakan keduanya bisa memiliki state tidak konsisten
 * selama jeda antara dua subscriber berbeda terpicu.
 */
export function useAuth(): AuthState {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  return { user, isLoading, isAuthenticated };
}
