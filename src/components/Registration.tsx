// src/pages/Registration.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import VerifyEmail from "./VerifyEmail";
import { register } from "../api";
import { toast } from "sonner";
import { t } from "i18next";

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
}

const Registration: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>("");

  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailForVerification, setEmailForVerification] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("errors.register.password_mismatch"));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t("errors.register.password_too_short"));
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData.email, formData.password);
      if (res.isError) {
        toast.error(
          t(`errors.register.${res.key}`) || t("errors.unknown_error")
        );
        setLoading(false);
        return;
      }

      const { sessionId } = res.data;
      setSessionId(sessionId);
      setEmailForVerification(formData.email);
    } catch (error) {
      toast.error(t("errors.server_error"));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.email.includes("@") &&
    formData.password.length >= 8 &&
    formData.confirmPassword.length >= 8;

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
              placeholder="example@domain.pl"
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
            disabled={!isFormValid || loading}
            className="w-full my-6 text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
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
      {/* Jeśli mamy dane w store — pokaż popup VerifyEmail nad stroną rejestracji */}
      {emailForVerification && (
        <VerifyEmail
          sessionId={sessionId}
          emailForVerification={emailForVerification}
          onClose={() => {
            setEmailForVerification("");
            setSessionId("");
          }}
        />
      )}
    </div>
  );
};

export default Registration;
