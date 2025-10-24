import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

const UsernamePopup: React.FC = () => {
  const { setUsername, showUsernamePopup } = useAuthStore();
  const [username, setUsernameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    
    // Symulacja API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUsername(username.trim());
    setIsSubmitting(false);
  };

  if (!showUsernamePopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-8 max-w-md w-full border border-border shadow-xl">
        <h2 className="text-2xl font-bold text-card-foreground text-center mb-6">
          Wybierz swoją nazwę użytkownika
        </h2>
        
        <p className="text-muted-foreground text-center mb-6">
          Email został potwierdzony! Teraz wybierz unikalną nazwę użytkownika.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-card-foreground"
            >
              Nazwa użytkownika
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="MojaUnikalnaNazwa"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              className="bg-input border border-border text-card-foreground sm:text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              3-20 znaków, tylko litery, cyfry i podkreślenia
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !username.trim()}
            className="w-full text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-ring font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Zapisuję...' : 'Potwierdź nazwę'}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Nazwa użytkownika będzie widoczna dla innych graczy
        </p>
      </div>
    </div>
  );
};

export default UsernamePopup;