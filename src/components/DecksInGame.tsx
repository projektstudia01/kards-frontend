import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Deck, Player } from '../types/lobby';

interface DecksInGameProps {
  onRemoveDeck: (deckId: string) => void;
  isOwner: boolean;
  decksInGame: Deck[];
  players: Player[];
}

const DecksInGame: React.FC<DecksInGameProps> = ({ onRemoveDeck, isOwner, decksInGame, players }) => {
  const { t } = useTranslation();

  const handleRemoveDeck = (deckId: string) => {
    if (!isOwner) return;
    onRemoveDeck(deckId);
  };

  // Calculate total cards
  const totalBlackCards = decksInGame.reduce((sum, deck) => sum + deck.blackCardsCount, 0);
  const totalWhiteCards = decksInGame.reduce((sum, deck) => sum + deck.whiteCardsCount, 0);

  // Calculate requirements (min 2 players, each needs 1 black + 10 white)
  const minPlayers = 2;
  const requiredBlackCards = Math.max(minPlayers, players.length) * 1;
  const requiredWhiteCards = Math.max(minPlayers, players.length) * 10;

  const hasEnoughCards = totalBlackCards >= requiredBlackCards && totalWhiteCards >= requiredWhiteCards;

  if (decksInGame.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-bold text-card-foreground mb-4">
          {t('lobby.decks_in_game')}
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎴</div>
          <p className="text-muted-foreground mb-2">{t('lobby.no_decks_selected')}</p>
          {isOwner && (
            <p className="text-sm text-muted-foreground">
              {t('lobby.add_decks_hint')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-bold text-card-foreground mb-4">
        {t('lobby.decks_in_game')}
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          ({decksInGame.length})
        </span>
      </h3>

      {/* Card Requirements Status */}
      <div className={`mb-4 p-3 rounded-lg border ${
        hasEnoughCards
          ? 'bg-green-500/10 border-green-500/50'
          : 'bg-destructive/10 border-destructive/50'
      }`}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-card-foreground">
            {hasEnoughCards ? '✅ ' : '⚠️ '}
            {t('lobby.card_requirements')}
          </span>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <div className={`flex items-center justify-between ${
            totalBlackCards >= requiredBlackCards ? 'text-green-600 dark:text-green-400' : 'text-destructive'
          }`}>
            <span>⚫ {t('lobby.black_cards')}</span>
            <span className="font-mono">
              {totalBlackCards} / {requiredBlackCards}
            </span>
          </div>
          <div className={`flex items-center justify-between ${
            totalWhiteCards >= requiredWhiteCards ? 'text-green-600 dark:text-green-400' : 'text-destructive'
          }`}>
            <span>⚪ {t('lobby.white_cards')}</span>
            <span className="font-mono">
              {totalWhiteCards} / {requiredWhiteCards}
            </span>
          </div>
        </div>
      </div>

      {/* Decks List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {decksInGame.map((deck) => (
          <div
            key={deck.id}
            className="p-4 rounded-lg bg-accent border border-border hover:border-primary transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-card-foreground">{deck.title}</h4>
                  {deck.isPublic && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      {t('lobby.public')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{deck.description}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>⚫ {deck.blackCardsCount}</span>
                  <span>⚪ {deck.whiteCardsCount}</span>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => handleRemoveDeck(deck.id)}
                  className="ml-4 px-3 py-1.5 rounded-lg font-medium text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  {t('lobby.remove')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecksInGame;
