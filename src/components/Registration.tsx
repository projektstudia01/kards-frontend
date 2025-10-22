// src/pages/Registration.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useErrorStore } from "../store/errorStore";
import { customAxios } from "../api/customAxios";

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const setVerificationData = useAuthStore((s) => s.setVerificationData);
  const setError = useErrorStore((s) => s.setError);
  const clearError = useErrorStore((s) => s.clearError);

  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // walidacja lokalna: hasła muszą być takie same
    if (formData.password !== formData.confirmPassword) {
      setError("errors.register.password_mismatch");
      return;
    }

    setLoading(true);
    try {
      // POST do /auth/register
      const res = await customAxios.post("/auth/register", {
        email: formData.email,
        password: formData.password,
      });

      const { sessionId, code } = res.data.data;

      // zapis do Zustand, aby VerifyEmail mógł użyć tych danych
      setVerificationData({
        email: formData.email,
        sessionId,
        code,
      });

      // przekierowanie do weryfikacji maila
      navigate("/verify-email");
    } catch (err: any) {
      if (err.response) {
        const { key } = err.response.data;
        // klucz z API → i18n, fallback "unknown_error"
        setError(key ? `errors.register.${key}` : "errors.unknown_error");
      } else {
        setError("errors.network_error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow sm:p-8 border border-border">
        <h2 className="text-3xl font-bold text-center text-card-foreground mb-4">
          Utwórz Konto
        </h2>
        <p className="text-base text-muted-foreground mb-6 text-center">
          Dołącz do społeczności CardOSR!
        </p>

        <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          <div className="w-full mb-4">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              Adres Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="imie@firma.pl"
              required
              className="bg-input border border-border text-card-foreground sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 ring-ring"
            />
          </div>

          <div className="w-full mb-4">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              Hasło
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="bg-input border border-border text-card-foreground sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 ring-ring"
            />
          </div>

          <div className="w-full mb-4">
            <label
              htmlFor="confirmPassword"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              Powtórz hasło
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="bg-input border border-border text-card-foreground sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full my-6 text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {loading ? "Tworzenie konta..." : "Utwórz Konto"}
          </button>

          <div className="flex items-center justify-center mb-4">
            <hr className="flex-1 border-t border-muted-foreground" />
            <span className="mx-2 text-muted-foreground">lub</span>
            <hr className="flex-1 border-t border-muted-foreground" />
          </div>

          <p className="text-sm font-light text-muted-foreground text-center">
            Masz już konto?
            <Link
              to="/login"
              className="font-medium text-primary hover:underline ml-4"
            >
              Zaloguj się
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registration;
