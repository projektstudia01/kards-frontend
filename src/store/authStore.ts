// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // dane tymczasowe do weryfikacji e-maila
  emailForVerification: string | null;
  sessionId: string | null;
  code: string | null;

  // akcje
  setAuthState: (user: UserData | null) => void;
  setVerificationData: (data: {
    email: string;
    sessionId: string;
    code: string;
  }) => void;
  clearVerificationData: () => void;
  showUsernamePopup: boolean;
  setUsername: (username: string) => void;
  confirmEmail: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      emailForVerification: null,
      sessionId: null,
      code: null,
      showUsernamePopup: false,

      setAuthState: (user) =>
        set({
          isLoggedIn: !!user,
          user: user || null,
        }),

      setVerificationData: ({ email, sessionId, code }) =>
        set({
          emailForVerification: email,
          sessionId,
          code,
        }),

      clearVerificationData: () =>
        set({
          emailForVerification: null,
          sessionId: null,
          code: null,
        }),

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
          emailForVerification: null,
          sessionId: null,
          code: null,
          showUsernamePopup: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
