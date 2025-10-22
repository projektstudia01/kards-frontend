// src/api/customAxios.ts
import axios from "axios";
import { useErrorStore } from "../store/errorStore";
import { useAuthStore } from "../store/authStore";

// 📌 Konfiguracja bazowa
export const customAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.cardosr.pl",
  withCredentials: true, // cookies z backendu
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧩 REQUEST Interceptor — można dodać token jeśli backend tego wymaga
customAxios.interceptors.request.use((config) => {
  const { user } = useAuthStore.getState();

  if (user && (user as any).token) {
    config.headers.Authorization = `Bearer ${(user as any).token}`;
  }

  return config;
});

// ⚠️ RESPONSE Interceptor — globalna obsługa błędów
customAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const setError = useErrorStore.getState().setError;
    const logout = useAuthStore.getState().logout;

    if (error.response) {
      const { key, message, statusCode } = error.response.data || {};
      const url = error.config?.url || "";

      // Automatyczne rozpoznanie grupy błędów na podstawie endpointu
      const group =
        url.includes("/register") ? "register" :
        url.includes("/verify-email") ? "verify" :
        url.includes("/resend-verification-code") ? "verify" :
        url.includes("/login") ? "login" :
        url.includes("/auth") ? "auth" :
        "general";

      // Wylogowanie przy 401 (poza verify-email)
      if (error.response.status === 401 && !url.includes("/verify-email")) {
        logout();
        setError("errors.auth.unauthorized");
      } else if (key) {
        setError(`errors.${group}.${key}`);
      } else if (statusCode >= 500) {
        setError("errors.server_error");
      } else {
        setError("errors.unknown_error");
      }
    } else {
      // Brak odpowiedzi (błąd sieciowy)
      useErrorStore.getState().setError("errors.network_error");
    }

    return Promise.reject(error);
  }
);

//
// ======================
// 🔑 AUTH ENDPOINTY
// ======================
//

export const authApi = {
  // Rejestracja użytkownika
  register: async (email: string, password: string) => {
    const res = await customAxios.post("/auth/register", { email, password });
    return res.data.data;
  },

  // Weryfikacja kodu e-mail
  verifyEmail: async (email: string, sessionId: string, code: string) => {
    const res = await customAxios.post("/auth/verify-email", {
      email,
      sessionId,
      code,
    });
    return res.data.data;
  },

  // Ponowne wysłanie kodu
  resendVerificationCode: async (email: string) => {
    const res = await customAxios.post("/auth/resend-verification-code", {
      email,
    });
    return res.data.data;
  },

  // Logowanie
  login: async (email: string, password: string) => {
    const res = await customAxios.post("/auth/login", { email, password });
    return res.data.data;
  },

  // Test sesji
  testAuth: async () => {
    const res = await customAxios.post("/auth/test-auth");
    return res.data;
  },
};
