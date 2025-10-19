import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore'; // Będziemy tego potrzebować do logowania

// Interfejs dla danych logowania
interface LoginData {
  email: string; // Zmienione z emailOrUsername na samo 'email'
  password: string;
}

const Login: React.FC = () => {
  // const setAuthState = useAuthStore(state => state.setAuthState); // Do integracji z Zustand

  // 1. Stan przechowujący dane logowania
  const [formData, setFormData] = useState<LoginData>({
    email: '', // Zmienione z emailOrUsername na samo 'email'
    password: '',
  });

  // 2. Funkcja obsługująca zmianę wartości pól
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. Szkielet funkcji obsługującej logowanie
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dane do logowania:', formData);

    // --- KROK INTEGRACJI ZUSTANDA ---
    // W przyszłości: 
    // 1. Wyślij dane do API.
    // 2. Jeśli sukces:
    //    const userPayload = { username: 'testuser', email: formData.email }; // Dane zwrócone przez API
    //    setAuthState(userPayload);
    //    navigate('/'); // Przekieruj na stronę główną
    // ---------------------------------
    
    // Na razie tylko logowanie do konsoli
    // Możesz na sztywno dodać przekierowanie, aby sprawdzić routing:
    // navigate('/'); 
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow sm:p-8 border border-border">
                {/* Tytuł */}
  <h2 className="text-3xl font-bold text-center text-card-foreground mb-4">Zaloguj się</h2>
    {/* Podtytuł */}
    <p className="text-base text-muted-foreground mb-6 text-center">Witaj ponownie! Zaloguj się aby kontynuować</p>
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>

          {/* POLE: ADRES EMAIL (Zmienione, aby akceptować tylko email) */}
          <div className="w-full">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-card-foreground text-center"
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
          <div className="w-full">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-card-foreground text-center"
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

          {/* PRZYCISK: ZALOGUJ */}
          <button
            type="submit"
            className="w-full mt-2 mb-2 text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Zaloguj się
           </button>

          <div className="flex items-center justify-center mb-4">
            <hr className="flex-1 border-t border-muted-foreground" />
            <span className="mx-2 text-muted-foreground">lub</span>
            <hr className="flex-1 border-t border-muted-foreground" />
          </div>

          {/* ODNOŚNIK DO REJESTRACJI */}
          <p className="text-sm font-light text-muted-foreground text-center">
            Nie masz jeszcze konta? {' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Zarejestruj się
            </Link>
          </p>
        </form>
    </div>
    </div>
  );
};

export default Login;
