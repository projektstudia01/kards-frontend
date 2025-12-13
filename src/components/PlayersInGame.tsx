import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import type { Player } from '../types/lobby';

interface PlayersInGameProps {
  players: Player[];
}

const PlayersInGame: React.FC<PlayersInGameProps> = ({ players }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  if (players.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-card-foreground mb-4">
          {t('lobby.players_in_game')}
        </h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('lobby.no_players')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border hover:scale-[1.02] transition-all duration-200">
      <h2 className="text-xl font-bold text-card-foreground mb-4">
        {t('lobby.players_in_game')}
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({players.length})
        </span>
      </h2>

      <div className="space-y-3">
        {players.map((player) => {
          const isCurrentUser = user?.id === player.id;
          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                isCurrentUser
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-accent border border-border'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  player.owner
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-card-foreground">
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({t('lobby.you')})
                        </span>
                      )}
                    </p>
                    {player.owner && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-medium">
                        {t('lobby.owner')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-muted-foreground">
                      {t('lobby.online')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-card-foreground">
                  {player.points}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('lobby.points')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayersInGame;
