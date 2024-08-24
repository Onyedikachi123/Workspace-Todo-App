import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  error: string | null;
}

type AuthPersist = (
  config: (set: any) => AuthState,
  options: PersistOptions<AuthState>
) => (set: any, get: any, api: any) => AuthState;

export const useAuthStore = create<AuthState>(
  (persist as AuthPersist)(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      login: (token: string) => {
        try {
          const decoded = jwtDecode<User>(token);
          set({ user: decoded, isAuthenticated: true });
          localStorage.setItem('token', token);
        } catch (error) {
          set({ error: 'Failed to decode token' });
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    { name: 'auth-store' }
  )
);
