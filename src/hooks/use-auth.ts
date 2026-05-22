'use client';

import type { User } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth.store';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  return { user, isLoading, isAuthenticated };
}
