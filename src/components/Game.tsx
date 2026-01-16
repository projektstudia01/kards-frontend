import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { GameState } from "../types/game";
import BlackCardDisplay from "./BlackCardDisplay";
import WhiteCardsHand from "./WhiteCardsHand";
import SubmissionsDisplay from "./SubmissionsDisplay";
import RoundResults from "./RoundResults";
import GamePlayers from "./GamePlayers";

interface GameProps {
  gameState: GameState;
  onSubmitCards: (cardIds: string[]) => void;
  onSelectWinner: (playerId: string) => void;
  onLeaveGame: () => void;
  currentUserId: string;
}

const Game: React.FC<GameProps> = ({
  gameState,
  onSubmitCards,
  onSelectWinner,
  onLeaveGame,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  // Clear selected cards when new round starts (gamePhase changes to 'selecting')
  useEffect(() => {
    if (gameState.gamePhase === "selecting") {
      setSelectedCardIds([]);
    }
  }, [gameState.gamePhase]);

  const handleCardSelect = (cardId: string) => {
    if (!gameState.blackCard) return;

    const requiredCards = gameState.blackCard.blankSpaceAmount;

    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }

      if (prev.length < requiredCards) {
        return [...prev, cardId];
      }

      return [...prev.slice(0, -1), cardId];
    });
  };

  const handleSubmit = () => {
    if (!gameState.blackCard) return;

    const requiredCards = gameState.blackCard.blankSpaceAmount;

    if (selectedCardIds.length === requiredCards) {
      onSubmitCards(selectedCardIds);
      setSelectedCardIds([]);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {t("game.title")}
          </h1>
          <button
            onClick={onLeaveGame}
            className="cursor-pointer px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition"
          >
            {t("lobby.leave")}
          </button>
        </div>

        {/* Players sidebar */}
        <div className="mb-6">
          <GamePlayers
            players={gameState.players}
            currentJudgeId={gameState.currentJudgeId}
            currentUserId={currentUserId}
          />
        </div>

        {/* Main game area */}
        <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
          {gameState.gamePhase === "waiting" && !gameState.blackCard && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                {t("game.waiting_for_round")}
              </p>
            </div>
          )}

          {gameState.gamePhase === "waiting" && gameState.blackCard && (
            <div className="space-y-6">
              {/* Show black card */}
              <div className="flex justify-center">
                <BlackCardDisplay card={gameState.blackCard} />
              </div>

              <div className="text-center py-8">
                <p className="text-lg text-success font-semibold mb-2">
                  ✓ {t("game.cards_submitted")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("game.waiting_for_others")}
                </p>
              </div>
            </div>
          )}

          {(gameState.gamePhase === "selecting" ||
            gameState.gamePhase === "judging") && (
              <div className="space-y-6">
                {/* Black card */}
                {gameState.blackCard && (
                  <div className="flex justify-center">
                    <BlackCardDisplay card={gameState.blackCard} />
                  </div>
                )}

                {/* Judge waiting view */}
                {gameState.isJudge && gameState.gamePhase === "selecting" && (
                  <div className="text-center py-8">
                    <p className="text-lg text-muted-foreground">
                      {t("game.judge_waiting")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("game.players_selecting")}
                    </p>
                  </div>
                )}

                {/* Player card selection */}
                {!gameState.isJudge && gameState.gamePhase === "selecting" && (
                  <div className="space-y-4">
                    <WhiteCardsHand
                      cards={gameState.myCards}
                      selectedCardIds={selectedCardIds}
                      onCardSelect={handleCardSelect}
                      disabled={false}
                    />

                    {gameState.blackCard && (
                      <div className="flex justify-center">
                        <button
                          onClick={handleSubmit}
                          disabled={
                            selectedCardIds.length !==
                            gameState.blackCard.blankSpaceAmount
                          }
                          className="cursor-pointer px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          {t("game.submit_cards")} ({selectedCardIds.length}/
                          {gameState.blackCard.blankSpaceAmount})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Judging phase - show submissions */}
                {gameState.gamePhase === "judging" &&
                  gameState.submissions.length > 0 && (
                    <div className="space-y-4">
                      {gameState.isJudge ? (
                        <>
                          <h2 className="text-xl font-semibold text-center text-foreground">
                            {t("game.select_winner")}
                          </h2>
                          <SubmissionsDisplay
                            submissions={gameState.submissions}
                            onSelectWinner={onSelectWinner}
                            isJudge={true}
                          />
                        </>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold text-center text-foreground">
                            {t("game.judge_selecting")}
                          </h2>
                          <SubmissionsDisplay
                            submissions={gameState.submissions}
                            onSelectWinner={onSelectWinner}
                            isJudge={false}
                          />
                        </>
                      )}
                    </div>
                  )}
              </div>
            )}

          {/* Results phase */}
          {gameState.gamePhase === "results" && (
            <RoundResults players={gameState.players} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
