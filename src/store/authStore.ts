// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserData {
  username?: string;
  email: string;
  emailConfirmed?: boolean;
  needsUsernameSetup?: boolean;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;

  emailForVerification: string | null;
  sessionId: string | null;
  code: string | null;

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
          showUsernamePopup: user?.needsUsernameSetup || false, // Ensure popup is shown if needed
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

      setUsername: (username) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, username, needsUsernameSetup: false }
            : null,
          showUsernamePopup: false,
        })),

      confirmEmail: () =>
        set((state) => {
          return {
            user: state.user
              ? { ...state.user, emailConfirmed: true, needsUsernameSetup: true, username: undefined }
              : null,
            showUsernamePopup: true, // Ensure popup is triggered
          };
        }),

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
          emailForVerification: null,
          sessionId: null,
          code: null,
          showUsernamePopup: false,
        });
        localStorage.removeItem('auth-storage'); // Clear persisted auth state
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
