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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
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
                ${isJudge ? 'bg-purple-100 dark:bg-purple-900 ring-2 ring-purple-500' : 'bg-gray-100 dark:bg-gray-700'}
                ${isCurrentUser ? 'font-bold' : ''}
              `}
            >
              <span className="text-sm text-gray-900 dark:text-white">
                {player.name}
                {isCurrentUser && ' (You)'}
              </span>
              
              {isJudge && (
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">
                  {t("game.judge")}
                </span>
              )}
              
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
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
