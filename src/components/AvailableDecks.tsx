import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Deck } from '../types/lobby';

interface AvailableDecksProps {
  onAddDeck: (deckId: string) => void;
  isOwner: boolean;
  wsRef: React.MutableRefObject<WebSocket | null>;
  availableDecks: Deck[];
  decksInGame: Deck[];
  availableDecksPage: number;
  availableDecksTotal: number;
  availableDecksPageSize: number;
}

const AvailableDecks: React.FC<AvailableDecksProps> = ({ 
  onAddDeck, 
  isOwner, 
  wsRef, 
  availableDecks, 
  decksInGame, 
  availableDecksPage, 
  availableDecksTotal, 
  availableDecksPageSize 
}) => {
  const { t } = useTranslation();

  const isDeckInGame = (deckId: string) => {
    return decksInGame.some(deck => deck.id === deckId);
  };

  const handleAddDeck = (deck: Deck) => {
    if (!isOwner || isDeckInGame(deck.id)) return;
    onAddDeck(deck.id);
  };

  const handlePageChange = (newPage: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    wsRef.current.send(JSON.stringify({
      event: 'GET_DECKS_PAGINATED',
      data: { page: String(newPage), pageSize: String(availableDecksPageSize) }
    }));
  };

  const totalPages = Math.ceil(availableDecksTotal / availableDecksPageSize);

  if (availableDecks.length === 0) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-bold text-card-foreground mb-4">
          {t('lobby.available_decks')}
        </h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('lobby.no_available_decks')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <h3 className="text-lg font-bold text-card-foreground mb-4">
        {t('lobby.available_decks')}
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {availableDecks.map((deck) => {
          const inGame = isDeckInGame(deck.id);
          return (
            <div
              key={deck.id}
              className={`p-4 rounded-lg border transition-all ${
                inGame
                  ? 'bg-accent/50 border-primary/50 opacity-60'
                  : 'bg-accent border-border hover:border-primary'
              }`}
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
                    <span>⚫ {deck.blackCardsCount} {t('lobby.black_cards')}</span>
                    <span>⚪ {deck.whiteCardsCount} {t('lobby.white_cards')}</span>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => handleAddDeck(deck)}
                    disabled={inGame}
                    className={`ml-4 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                      inGame
                        ? 'bg-secondary text-secondary-foreground cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {inGame ? t('lobby.in_game') : t('lobby.add')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <button
            onClick={() => handlePageChange(availableDecksPage - 1)}
            disabled={availableDecksPage === 0}
            className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {t('lobby.previous')}
          </button>
          
          <span className="text-sm text-muted-foreground">
            {t('lobby.page')} {availableDecksPage + 1} {t('lobby.of')} {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(availableDecksPage + 1)}
            disabled={availableDecksPage >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {t('lobby.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailableDecks;
