import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode correctly

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  error: string | null;
}

type AuthPersist = (
  config: (set: any, get: any) => AuthState,
  options: PersistOptions<AuthState>
) => (set: any, get: any, api: any) => AuthState;

export const useAuthStore = create<AuthState>(
  (persist as AuthPersist)(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      error: null,
      login: (token: string) => {
        try {
          const decodedUser = jwtDecode<User>(token); // Ensure token is decoded
          set({ user: decodedUser, isAuthenticated: true, token });
        } catch (error) {
          set({ error: 'Failed to decode token', isAuthenticated: false });
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
        localStorage.removeItem('auth-store');  // Clear auth store on logout
      },
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'auth-store',
      getStorage: () => localStorage, // Persist state in localStorage
    }
  )
);

// Only run this block on the client-side
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    useAuthStore.getState().login(token);
  }
}
