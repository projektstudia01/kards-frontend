import React from "react";
import { useTranslation } from "react-i18next";
import type { Player } from "../types/game";

interface GamePlayersProps {
  players: Player[];
  currentJudgeId: string | null;
  currentUserId: string;
}

const GamePlayers: React.FC<GamePlayersProps> = ({
  players,
  currentJudgeId,
  currentUserId,
}) => {
  const { t } = useTranslation();

  if (players.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow p-4 border border-border">
        <h3 className="text-lg font-semibold mb-3 text-card-foreground">
          {t("lobby.players")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("lobby.no_players")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow p-4 border border-border">
      <h3 className="text-lg font-semibold mb-3 text-card-foreground">
        {t("lobby.players")}
      </h3>

      <div className="flex flex-wrap gap-3">
        {players.map((player) => {
          const isJudge = player.id === currentJudgeId;
          const isCurrentUser = player.id === currentUserId;

          return (
            <div
              key={player.id}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2
                ${isJudge ? 'bg-purple-500/20 ring-2 ring-purple-500' : 'bg-accent'}
                ${isCurrentUser ? 'font-bold' : ''}
              `}
            >
              <span className={`text-sm flex items-center gap-1 ${isJudge ? 'text-purple-500' : 'text-card-foreground'}`}>
                {player.name}
                {isCurrentUser && ' (You)'}
                {player.hasSubmitted && <span className="text-success font-bold ml-1">✓</span>}
              </span>

              {isJudge && (
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded font-medium">
                  {t("game.judge")}
                </span>
              )}

              <span className="text-xs font-semibold text-muted-foreground">
                {player.points} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamePlayers;
