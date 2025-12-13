import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import UsernamePopup from './UsernamePopup';
import PublicGames from './PublicGames';

const Welcome: React.FC = () => {
  const { logout, user, showUsernamePopup, confirmEmail } = useAuthStore();
  const navigate = useNavigate();
  const [isTitleHovered, setIsTitleHovered] = useState(false);

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
        <div className="text-center mb-12 space-y-4">
          <h1
            className="text-7xl font-extrabold text-primary mb-6 cursor-pointer inline-flex items-baseline overflow-visible leading-normal pb-4"
            onMouseEnter={() => setIsTitleHovered(true)}
            onMouseLeave={() => setIsTitleHovered(false)}
          >
            <span className="inline-block align-baseline">Card</span>
            <span className="inline-block align-baseline">O</span>
            <span
              className={`inline-block align-baseline transition-all duration-700 ease-in-out overflow-visible ${
                isTitleHovered 
                  ? 'max-w-[200px] opacity-100' 
                  : 'max-w-0 opacity-0'
              }`}
              style={{ whiteSpace: 'nowrap' }}
            >
              ni
            </span>
            <span className="inline-block align-baseline">S</span>
            <span
              className={`inline-block align-baseline transition-all duration-700 ease-in-out overflow-visible ${
                isTitleHovered 
                  ? 'max-w-[300px] opacity-100' 
                  : 'max-w-0 opacity-0'
              }`}
              style={{ whiteSpace: 'nowrap' }}
            >
              nejka
            </span>
            <span className="inline-block align-baseline">R</span>
            <span
              className={`inline-block align-baseline transition-all duration-700 ease-in-out overflow-visible ${
                isTitleHovered 
                  ? 'max-w-[300px] opacity-100' 
                  : 'max-w-0 opacity-0'
              }`}
              style={{ whiteSpace: 'nowrap' }}
            >
              obią
            </span>
          </h1>
          <p className="text-2xl text-card-foreground font-semibold mb-4">
            Wieloosobowa Gra Karciana Online
          </p>
          <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-medium">Zabawna, szybka i pełna humoru!</span>
            <span className="text-2xl">⚡</span>
          </p>
        </div>

        {/* Game Rules Section */}
        <div className="bg-card rounded-lg p-8 mb-12 border border-border shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
          <h2 className="text-3xl font-bold text-card-foreground text-center mb-8">
            Jak grać w CardOSR?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rule 1 */}
            <div className="bg-accent border border-border rounded-lg p-6 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-default">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-destructive rounded-full flex items-center justify-center shadow-md">
                    <span className="text-3xl">🎯</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-semibold text-lg">
                    Sędzia losuje kartę
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="bg-accent border border-border rounded-lg p-6 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-default">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <span className="text-3xl">🃏</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-semibold text-lg">
                    Gracze zagrywają po jednej białej karcie
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="bg-accent border border-border rounded-lg p-6 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-default">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-warning rounded-full flex items-center justify-center shadow-md">
                    <span className="text-3xl">😂</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-semibold text-lg">
                    Sędzia wybiera najśmieszniejszą odpowiedź
                  </p>
                </div>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="bg-accent border border-border rounded-lg p-6 hover:scale-105 hover:shadow-lg transition-all duration-200 cursor-default">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-md">
                    <span className="text-3xl">🏅</span>
                  </div>
                </div>
                <div>
                  <p className="text-card-foreground font-semibold text-lg">
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
            className="px-10 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/80 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
          >
            Stwórz grę
          </button>
          <button 
            onClick={() => navigate('/join-lobby')}
            className="px-10 py-4 bg-info text-info-foreground rounded-lg font-semibold text-lg hover:bg-info/80 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
          >
            Dołącz do gry
          </button>
          <button 
            onClick={() => navigate('/decks')}
            className="px-10 py-4 bg-warning text-warning-foreground rounded-lg font-semibold text-lg hover:bg-warning/80 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
          >
            Talie
          </button>
        </div>

        {/* Public Games List */}
        <div className="mb-12">
          <PublicGames />
        </div>

        {/* User Profile Card */}
        <div className="bg-card rounded-lg p-6 mb-12 border border-border max-w-sm mx-auto shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">👤</span>
            </div>
            <div className="flex-1">
              <p className="text-card-foreground font-semibold text-lg">
                Witaj, {user?.name ?? 'Gościu'}
              </p>
              <p className="text-muted-foreground text-sm">
                ID: {user?.email ? user.email.substring(0, 3) + '***' + user.email.slice(-3) : 'brak'}
              </p>
            </div>
            <button
              onClick={handleChangeUsername}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/80 hover:scale-105 cursor-pointer transition-all duration-200 shadow-md"
            >
              Zmień nazwę
            </button>
          </div>
        </div>
      </div>

      {/* Logout Button - Bottom Left Corner */}
      <button
        onClick={handleLogout}
        className="fixed bottom-6 left-6 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/80 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
      >
        Wyloguj
      </button>
    </div>
  );
};

export default Welcome;
