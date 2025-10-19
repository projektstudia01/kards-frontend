import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Dodano useNavigate
import { useAuthStore } from "../store/authStore"; // <--- TERAZ ODKOMENTOWANE I UŻYTE

// 1. Interfejs dla danych formularza
interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
}

const Registration: React.FC = () => {
  const navigate = useNavigate(); // Do przekierowania po rejestracji
  // Pobieranie akcji 'login' z magazynu Zustanda
  const setAuthState = useAuthStore((state) => state.setAuthState); // 2. Stan przechowujący dane formularza

  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  // 3. Funkcja obsługująca zmianę wartości pól

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }; // 4. Obsługa wysłania formularza (z symulacją i użyciem Zustanda)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dane do rejestracji:", formData); // --- KROK INTEGRACJI ZUSTANDA ---

    // Prawdziwa aplikacja wysłałaby dane do API, utworzyła konto i zalogowała

    // Walidacja: czy hasła się zgadzają
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są takie same');
      return;
    }

    // Symulacja udanej rejestracji (i automatycznego logowania po niej):
    const mockUserPayload = {
      email: formData.email,
    };

    // Zapis stanu do Zustanda (logowanie)
    setAuthState(mockUserPayload);

    // Przekierowanie na stronę główną
    navigate("/");
    // ---------------------------------
  };
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow sm:p-8 border border-border">
      {/* Nagłówek */}
      <h2 className="text-3xl font-bold text-center text-card-foreground mb-4">
        Utwórz Konto
      </h2>
      {/* Podtytuł */}
      <p className="text-base text-muted-foreground mb-6 text-center">
        Dołącz do społeczności CardOSR!
      </p>
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
        {error && (
          <div className="text-sm text-red-600 mb-2" role="alert">{error}</div>
        )}
        {/* POLE: ADRES EMAIL */}
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
                  {/* POLE: HASŁO */}
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
        {/* POLE: POWTÓRZ HASŁO */}
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
        {/* PRZYCISK: REJESTRACJA */}
        <button
          type="submit"
          className="w-full my-6 text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Utwórz Konto
        </button>

        <div className="flex items-center justify-center mb-4">
          <hr className="flex-1 border-t border-muted-foreground" />
          <span className="mx-2 text-muted-foreground">lub</span>
          <hr className="flex-1 border-t border-muted-foreground" />
        </div>

        {/* ODNOŚNIK DO LOGOWANIA */}
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
