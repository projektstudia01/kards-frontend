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
      <h2 className="text-2xl font-bold text-center text-foreground">
        {t("game.round_finished")}
      </h2>

      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("game.rank")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("game.player")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("game.points")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedPlayers.map((player, index) => (
                <tr key={player.id} className={index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">
                    {index === 0 ? '🏆' : `#${index + 1}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-card-foreground text-right font-semibold">
                    {player.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t("game.next_round_starting")}
      </p>
    </div>
  );
};

export default RoundResults;
