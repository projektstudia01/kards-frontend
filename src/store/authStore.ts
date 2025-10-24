// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  username?: string;
  email: string;
  emailConfirmed?: boolean;
  needsUsernameSetup?: boolean;
  // W realnej apce: token JWT lub inne dane uwierzytelniające
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  showUsernamePopup: boolean;
  setAuthState: (user: UserData | null) => void;
  setUsername: (username: string) => void;
  confirmEmail: () => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      showUsernamePopup: false,

      // Przyjmuje obiekt użytkownika (opcjonalne username, email) i zapisuje stan
      setAuthState: (user) =>
        set({
          isLoggedIn: !!user,
          user: user || null, // Zapisujemy pełne dane lub null
          showUsernamePopup: user?.needsUsernameSetup || false,
        }),

      // Ustawia username i kończy setup
      setUsername: (username) =>
        set((state) => ({
          user: state.user ? { ...state.user, username, needsUsernameSetup: false } : null,
          showUsernamePopup: false,
        })),

      // Potwierdza email i pokazuje popup wyboru nazwy
      confirmEmail: () =>
        set((state) => ({
          user: state.user ? { ...state.user, emailConfirmed: true, needsUsernameSetup: true } : null,
          showUsernamePopup: true,
        })),

      // Obsługa wylogowania
      logout: () =>
        set({
          isLoggedIn: false,
          user: null,
          showUsernamePopup: false,
        }),
    }),
    {
      name: "auth-storage", // Unikalna nazwa klucza w localStorage
    }
  )
);