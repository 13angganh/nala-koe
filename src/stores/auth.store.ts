import { create }      from 'zustand';
import { type User }   from 'firebase/auth';

interface AuthStore {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  setUser:         (user: User | null) => void;
  setLoading:      (loading: boolean)  => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user:            null,
  isLoading:       true,
  isAuthenticated: false,

  setUser: (user) =>
    set(
      { user, isAuthenticated: user !== null, isLoading: false },
      false,
      'auth/setUser'
    ),

  setLoading: (isLoading) =>
    set({ isLoading }, false, 'auth/setLoading'),
}));
