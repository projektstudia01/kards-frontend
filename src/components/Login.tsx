import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore'; // Będziemy tego potrzebować do logowania

// Interfejs dla danych logowania
interface LoginData {
  email: string; // Zmienione z emailOrUsername na samo 'email'
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate(); // Do przekierowania po zalogowaniu
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
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-8">
                {/* Tytuł */}
  <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Zaloguj się</h2>
    {/* Podtytuł */}
    <p className="text-base text-gray-700 dark:text-gray-300 mb-6 text-center">Witaj ponownie! Zaloguj się aby kontynuować</p>
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>

          {/* POLE: ADRES EMAIL (Zmienione, aby akceptować tylko email) */}
          <div className="w-full">
            <label 
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-center"
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
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          {/* POLE: HASŁO */}
          <div className="w-full">
            <label 
              htmlFor="password" 
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-center"
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
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>

          {/* PRZYCISK: ZALOGUJ */}
          <button
            type="submit"
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Zaloguj się
          </button>

          {/* ODNOŚNIK DO REJESTRACJI */}
          <p className="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
            Nie masz jeszcze konta? {' '}
            <Link 
              to="/register" 
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Zarejestruj się
            </Link>
          </p>
        </form>
    </div>
  );
};

export default Login;
