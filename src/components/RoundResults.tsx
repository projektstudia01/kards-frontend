import React from "react";
import { useTranslation } from "react-i18next";
import type { Player } from "../types/game";

interface RoundResultsProps {
  players: Player[];
}

const RoundResults: React.FC<RoundResultsProps> = ({ players }) => {
  const { t } = useTranslation();
  
  // Sort players by points descending
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        {t("game.round_finished")}
      </h2>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("game.rank")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("game.player")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("game.points")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {sortedPlayers.map((player, index) => (
                <tr key={player.id} className={index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {index === 0 ? '🏆' : `#${index + 1}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right font-semibold">
                    {player.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {t("game.next_round_starting")}
      </p>
    </div>
  );
};

export default RoundResults;
