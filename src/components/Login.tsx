import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { login } from "../api";
import { toast } from "sonner";

// import { useAuthStore } from '../store/authStore'; // Będziemy tego potrzebować do logowania

// Interfejs dla danych logowania
interface LoginData {
  email: string; // Zmienione z emailOrUsername na samo 'email'
  password: string;
}

const Login: React.FC = () => {
  // const setAuthState = useAuthStore(state => state.setAuthState); // Do integracji z Zustand
  const { t } = useTranslation();

  // 1. Stan przechowujący dane logowania
  const [formData, setFormData] = useState<LoginData>({
    email: "", // Zmienione z emailOrUsername na samo 'email'
    password: "",
  });

  // 2. Funkcja obsługująca zmianę wartości pól
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. Szkielet funkcji obsługującej logowanie
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dane do logowania:", formData);

    const response = await login(formData.email, formData.password);
    if (response.isError) {
      toast.error(t(response.key));
      return;
    }

    console.log("Login successful:", response.data);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow sm:p-8 border border-border">
        <h2 className="text-3xl font-bold text-center text-card-foreground mb-4">
          {t("login.title", "Zaloguj się")}
        </h2>
        <p className="text-base text-muted-foreground mb-6 text-center">
          {t("login.subtitle", "Witaj ponownie! Zaloguj się aby kontynuować")}
        </p>

        <form className="space-y-6 w-full" onSubmit={handleSubmit} noValidate>
          <div className="w-full">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              {t("login.email", "Adres Email")}
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

          <div className="w-full">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              {t("login.password", "Hasło")}
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

          <button
            type="submit"
            className="w-full mt-2 mb-2 text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {t("login.submit", "Zaloguj się")}
          </button>

          <div className="flex items-center justify-center mb-4">
            <hr className="flex-1 border-t border-muted-foreground" />
            <span className="mx-2 text-muted-foreground">
              {t("login.or", "lub")}
            </span>
            <hr className="flex-1 border-t border-muted-foreground" />
          </div>

          <p className="text-sm font-light text-muted-foreground text-center">
            {t("login.no_account", "Nie masz jeszcze konta?")}{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              {t("login.register", "Zarejestruj się")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
