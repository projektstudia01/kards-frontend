// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  username: string;
  email: string;
  // W realnej apce: token JWT lub inne dane uwierzytelniające
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  setAuthState: (user: UserData) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,

      // Przyjmuje obiekt użytkownika (username, email) i zapisuje stan
      setAuthState: (user) =>
        set({
          isLoggedIn: !!user,
          user: user, // Zapisujemy pełne dane
        }),
      // Obsługa wylogowania
      logout: () =>
        set({
          isLoggedIn: false,
          user: null,
        }),
    }),
    {
      name: "auth-storage", // Unikalna nazwa klucza w localStorage
    }
  )
);