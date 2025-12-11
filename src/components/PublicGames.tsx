import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGamesList } from '../api';
import { useTranslation } from 'react-i18next';

interface Game {
  id: string;
  name: string;
  ownerId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  lobbyType: string;
  createdAt: string;
}

const PublicGames: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
    // Auto-refresh co 5 sekund
    const interval = setInterval(loadGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadGames = async () => {
    const response = await getGamesList();
    if (!response.isError && response.data) {
      // Filtruj tylko publiczne gry w statusie "waiting"
      const publicGames = response.data.filter(
        (game: Game) => game.lobbyType === 'public' && game.status === 'waiting'
      );
      setGames(publicGames);
    }
    setLoading(false);
  };

  const handleJoinGame = (gameId: string) => {
    navigate(`/lobby/${gameId}`);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-4">
          🎮 {t('welcome.public_games')}
        </h2>
        <p className="text-muted-foreground text-center py-8">
          {t('welcome.loading')}...
        </p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-4">
          🎮 {t('welcome.public_games')}
        </h2>
        <p className="text-muted-foreground text-center py-8">
          {t('welcome.no_public_games')}
        </p>
        <p className="text-sm text-muted-foreground text-center">
          {t('welcome.create_first_game')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h2 className="text-xl font-bold text-card-foreground mb-4">
        🎮 {t('welcome.public_games')}
      </h2>
      
      <div className="space-y-3">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-accent border border-border rounded-lg p-4 hover:bg-accent/80 transition cursor-pointer"
            onClick={() => handleJoinGame(game.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">
                  {game.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-muted-foreground">
                    👥 {game.currentPlayers}/{game.maxPlayers}
                  </span>
                  <span className="text-xs bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                    {t('welcome.waiting')}
                  </span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinGame(game.id);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
              >
                {t('welcome.join')}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        {t('welcome.auto_refresh')}
      </p>
    </div>
  );
};

export default PublicGames;
