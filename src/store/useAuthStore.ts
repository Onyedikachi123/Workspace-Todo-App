import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  password: string
}

const users: { [key: string]: User } = {};

// Add a user to the storage
export function addUser(user: User) {
  users[user.email] = user;
}

// Retrieve a user from the storage by email
export function getUser(email: string): User | undefined {
  return users[email];
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
  config: (set: any) => AuthState,
  options: PersistOptions<AuthState>
) => (set: any, get: any, api: any) => AuthState;

export const useAuthStore = create<AuthState>(
  (persist as AuthPersist)(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      error: null,
      login: (token: string) => {
        try {
          const decoded = jwtDecode<User>(token);
          set({ user: decoded, isAuthenticated: true });
          localStorage.setItem('token', token);
        } catch (error) {
          set({ error: 'Failed to decode token', isAuthenticated: false });
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
