import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useLobbyStore } from '../store/lobbyStore';
import { useNavigate } from 'react-router-dom';
import UsernamePopup from './UsernamePopup';
import { useEffect } from 'react';

const Lobby: React.FC = () => {
  const { logout, user, showUsernamePopup, confirmEmail } = useAuthStore();
  const { lobbyId } = useLobbyStore();
  const navigate = useNavigate();

  // Przekieruj na lobby jeśli istnieje lobbyId
  useEffect(() => {
    if (lobbyId) {
      navigate(`/lobby/${lobbyId}`);
    }
  }, [lobbyId, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangeUsername = () => {
    confirmEmail();
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-12 relative">
      {showUsernamePopup && <UsernamePopup />}
      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary mb-6">CardOSR</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Wieloosobowa Gra Karciana Online
          </p>
          <p className="text-sm text-muted-foreground flex items-center justify-center">
            <span className="text-primary mr-2">⚡</span>
            Zabawna, szybka i pełna humoru!
          </p>
        </div>

        {/* Game Rules Section */}
        <div className="bg-card rounded-lg p-8 mb-12 border border-border">
          <h2 className="text-2xl font-bold text-card-foreground text-center mb-8">
            Jak grać w CardOSR?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rule 1 */}
            <div className="bg-accent border border-border rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-medium">
                    Sędzia losuje kartę
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="bg-accent border border-border rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-medium">
                    Gracze zagrywają po jednej białej karcie
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="bg-accent border border-border rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center">
                    <span className="text-2xl">🚗</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-medium">
                    Sędzia wybiera najśmieszniejszą odpowiedź
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="bg-accent border border-border rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏅</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-medium">
                    Zwycięzca rundy dostaje punkt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-12 justify-center">
          <button 
            onClick={() => navigate('/create-lobby')}
            className="px-10 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            ▶ Stwórz grę
          </button>
          <button 
            onClick={() => navigate('/join-lobby')}
            className="px-10 py-4 bg-info text-info-foreground rounded-lg font-medium hover:bg-info/90 transition-colors"
          >
            🎮 Dołącz do gry
          </button>
          <button 
            onClick={() => navigate('/decks')}
            className="px-10 py-4 bg-warning text-warning-foreground rounded-lg font-medium hover:bg-warning/90 transition-colors"
          >
            🃏 Talie
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-card rounded-lg p-6 mb-12 border border-border max-w-sm mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-card-foreground font-medium">
                Witaj, {user?.name ?? 'Gościu'}
              </p>
              <p className="text-muted-foreground text-sm">
                ID: {user?.email ? user.email.substring(0, 3) + '***' + user.email.slice(-3) : 'brak'}
              </p>
            </div>
            <button
              onClick={handleChangeUsername}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Zmień nazwę
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button - Bottom Left Corner */}
      <button
        onClick={handleLogout}
        className="fixed bottom-6 left-6 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors shadow-lg"
      >
        Wyloguj
      </button>
    </div>
  );
};

export default Lobby;
