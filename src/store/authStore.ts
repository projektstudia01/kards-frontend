// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserData {
  username?: string;
  email: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  // Tymczasowe dane do weryfikacji e-maila
  emailForVerification: string | null;
  sessionId: string | null;
  code: string | null;

  // Akcje
  setAuthState: (user: UserData | null) => void;
  setVerificationData: (data: {
    email: string;
    sessionId: string;
    code: string;
  }) => void;
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

      logout: () =>
        set({
          isLoggedIn: false,
          user: null,
          emailForVerification: null,
          sessionId: null,
          code: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);
