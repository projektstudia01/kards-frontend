import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Dodano useNavigate
import { useAuthStore } from '../store/authStore'; // <--- TERAZ ODKOMENTOWANE I UŻYTE

// 1. Interfejs dla danych formularza
interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

const Registration: React.FC = () => {
  const navigate = useNavigate(); // Do przekierowania po rejestracji
  // Pobieranie akcji 'login' z magazynu Zustanda
    const setAuthState = useAuthStore(state => state.setAuthState);

  // 2. Stan przechowujący dane formularza
  const [formData, setFormData] = useState<RegistrationData>({
    username: '',
    email: '',
    password: '',
  });

  // 3. Funkcja obsługująca zmianę wartości pól
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 4. Obsługa wysłania formularza (z symulacją i użyciem Zustanda)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dane do rejestracji:', formData);

    // --- KROK INTEGRACJI ZUSTANDA ---
    // Prawdziwa aplikacja wysłałaby dane do API, utworzyła konto i zalogowała
    
    // Symulacja udanej rejestracji (i automatycznego logowania po niej):
    const mockUserPayload = { 
        username: formData.username, 
        email: formData.email 
    }; 
    
    // Zapis stanu do Zustanda (logowanie)
    setAuthState(mockUserPayload);
    
    // Przekierowanie na stronę główną
    navigate('/'); 
    // ---------------------------------
  };
        return (
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-8">
                {/* Nagłówek */}
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Utwórz Konto</h2>
                {/* Podtytuł */}
                <p className="text-base text-gray-700 dark:text-gray-300 mb-6 text-center">Dołącz do społeczności CardOSR!</p>
                <form className="space-y-6 w-full" onSubmit={handleSubmit}>
          {/* POLE: NAZWA UŻYTKOWNIKA */}
                                <div className="w-full mb-4">
                                    <label 
                                        htmlFor="username" 
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Nazwa użytkownika
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="JanKowalski"
                                        required
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>
          {/* POLE: ADRES EMAIL */}
                                <div className="w-full mb-4">
                                    <label 
                                        htmlFor="email" 
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
                                <div className="w-full mb-4">
                                    <label 
                                        htmlFor="password" 
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
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
          {/* PRZYCISK: REJESTRACJA */}
          <button
            type="submit"
            className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Zarejestruj Konto
          </button>
          {/* ODNOŚNIK DO LOGOWANIA */}
          <p className="text-sm font-light text-gray-500 dark:text-gray-400 text-center">
            Masz już konto?{' '}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Zaloguj się
            </Link>
          </p>
                </form>
        </div>
    );
};

export default Registration;
