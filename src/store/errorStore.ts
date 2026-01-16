import { create } from 'zustand';

interface ErrorState {
  messageKey: string | null; // i18n key
  setError: (key: string | null) => void;
  clearError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  messageKey: null,
  setError: (key) => set({ messageKey: key }),
  clearError: () => set({ messageKey: null }),
}));
