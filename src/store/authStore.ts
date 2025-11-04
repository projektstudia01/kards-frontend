// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserData {
  id: string;
  username?: string;
  email: string;
  needsUsernameSetup?: boolean;
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;

  emailForVerification: string | null;
  code: string | null;

  setAuthState: (user: UserData | null) => void;
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
              ? {
                  ...state.user,
                  emailConfirmed: true,
                  needsUsernameSetup: true,
                  username: undefined,
                }
              : null,
            showUsernamePopup: true, // Ensure popup is triggered
          };
        }),

      logout: () => {
        set({
          isLoggedIn: false,
          user: null,
          emailForVerification: null,
          code: null,
          showUsernamePopup: false,
        });
        localStorage.removeItem("auth-storage"); // Clear persisted auth state
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
