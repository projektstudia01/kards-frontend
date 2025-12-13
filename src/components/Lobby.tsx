import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import PlayersInGame from './PlayersInGame';
import DecksInGame from './DecksInGame';
import AvailableDecks from './AvailableDecks';
import QRCodeGenerator from './QRCodeGenerator';
import Chat from './Chat';
import type { Player, Deck } from '../types/lobby';

interface LobbyProps {
  wsRef: React.MutableRefObject<WebSocket | null>;
  gameId: string | null;
  players: Player[];
  decksInGame: Deck[];
  availableDecks: Deck[];
  availableDecksPage: number;
  availableDecksTotal: number;
  availableDecksPageSize: number;
  invitationCode: string | null;
}

const Lobby: React.FC<LobbyProps> = ({ 
  wsRef, 
  gameId, 
  players, 
  decksInGame,
  availableDecks,
  availableDecksPage,
  availableDecksTotal,
  availableDecksPageSize,
  invitationCode
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [showQRCode, setShowQRCode] = useState(false);

  // Find current user as player to check if owner
  const currentPlayer = players.find(p => p.id === user?.id);
  const isOwner = currentPlayer?.owner || false;

  const handleKickPlayer = (playerId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }
    wsRef.current.send(JSON.stringify({
      event: 'KICK_PLAYER',
      data: { playerId }
    }));
  };

  const handleAddDeck = (deckId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }

    wsRef.current.send(JSON.stringify({
      event: 'ADD_DECKS_TO_GAME',
      data: { decks: [deckId] }
    }));
  };

  const handleRemoveDeck = (deckId: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }

    wsRef.current.send(JSON.stringify({
      event: 'REMOVE_DECKS_FROM_GAME',
      data: { decks: [deckId] }
    }));
  };

  const handleStartGame = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }

    // Validate requirements
    if (players.length < 2) {
      toast.error(t('lobby.errors.min_players_2'));
      return;
    }

    const totalBlackCards = decksInGame.reduce((sum, deck) => sum + deck.blackCardsCount, 0);
    const totalWhiteCards = decksInGame.reduce((sum, deck) => sum + deck.whiteCardsCount, 0);
    const requiredBlackCards = players.length * 1;
    const requiredWhiteCards = players.length * 10;

    if (totalBlackCards < requiredBlackCards || totalWhiteCards < requiredWhiteCards) {
      toast.error(t('lobby.errors.not_enough_cards'));
      return;
    }

    wsRef.current.send(JSON.stringify({
      event: 'START_GAME'
    }));
  };

  const handleLeaveLobby = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'LEAVE_GAME'
      }));
      setTimeout(() => {
        wsRef.current?.close(1000, "User left lobby");
        navigate('/welcome');
      }, 100);
    } else {
      navigate('/welcome');
    }
  };

  // Check if can start game
  const totalBlackCards = decksInGame.reduce((sum, deck) => sum + deck.blackCardsCount, 0);
  const totalWhiteCards = decksInGame.reduce((sum, deck) => sum + deck.whiteCardsCount, 0);
  const requiredBlackCards = Math.max(2, players.length) * 1;
  const requiredWhiteCards = Math.max(2, players.length) * 10;
  const hasEnoughPlayers = players.length >= 2;
  const hasEnoughCards = totalBlackCards >= requiredBlackCards && totalWhiteCards >= requiredWhiteCards;
  const canStartGame = isOwner && hasEnoughPlayers && hasEnoughCards;

  if (!gameId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t('lobby.not_found')}
          </h1>
          <p className="text-muted-foreground mb-4">
            {t('lobby.not_found_description')}
          </p>
          <button
            onClick={() => navigate('/welcome')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 hover:scale-105 transition-all duration-200 cursor-pointer"
          >
            {t('lobby.back_to_menu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {t('lobby.title')}
          </h1>
          <div className="flex items-center justify-center space-x-4 text-muted-foreground mb-3">
            <span className="flex items-center">
              {players.length} {t('lobby.players')}
            </span>
            <span className="flex items-center">
              {decksInGame.length} {t('lobby.decks')}
            </span>
          </div>
          
          {/* Game ID - do kopiowania i udostępniania */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">ID Gry:</span>
            <code className="px-3 py-1 bg-accent rounded border border-border text-sm font-mono">
              {gameId}
            </code>

            {invitationCode && (
              <>
                <span className="text-sm text-muted-foreground ml-2">Kod:</span>
                <code className="px-3 py-1 bg-accent rounded border border-border text-sm font-mono">
                  {invitationCode}
                </code>
              </>
            )}

            <button
              onClick={() => {
                const url = `${window.location.origin}/lobby/${gameId}${invitationCode ? `?code=${invitationCode}` : ''}`;
                navigator.clipboard.writeText(url);
                toast.success('Link do lobby skopiowany!');
              }}
              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Kopiuj Link
            </button>
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              {showQRCode ? 'Ukryj QR' : 'Pokaż QR'}
            </button>
          </div>
          
          {/* QR Code Modal */}
          {showQRCode && (
            <div className="mt-4 p-4 bg-card rounded-lg border border-border flex flex-col items-center mx-auto w-fit hover:scale-[1.02] transition-all duration-200">
              <p className="text-sm text-muted-foreground mb-2 text-center">
                Zeskanuj kod aby dołączyć do gry
              </p>
              <QRCodeGenerator 
                text={`${window.location.origin}/lobby/${gameId}${invitationCode ? `?code=${invitationCode}` : ''}`}
                size={200}
              />
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Players */}
          <div className="lg:col-span-1 space-y-6">
            <PlayersInGame
              players={players}
              onKickPlayer={handleKickPlayer}
              isOwner={isOwner}
            />
            <Chat />
          </div>

          {/* Middle Column - Decks in Game */}
          <div className="lg:col-span-1">
            <DecksInGame
              onRemoveDeck={handleRemoveDeck}
              isOwner={isOwner}
              decksInGame={decksInGame}
              players={players}
            />
          </div>

          {/* Right Column - Available Decks */}
          <div className="lg:col-span-1">
            <AvailableDecks
              onAddDeck={handleAddDeck}
              isOwner={isOwner}
              wsRef={wsRef}
              availableDecks={availableDecks}
              decksInGame={decksInGame}
              availableDecksPage={availableDecksPage}
              availableDecksTotal={availableDecksTotal}
              availableDecksPageSize={availableDecksPageSize}
            />
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-card rounded-lg p-6 border border-border hover:scale-[1.01] transition-all duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Messages */}
            <div className="flex-1">
              {!hasEnoughPlayers && (
                <p className="text-sm text-muted-foreground">
                  {t('lobby.need_more_players', { count: 2 - players.length })}
                </p>
              )}
              {hasEnoughPlayers && !hasEnoughCards && (
                <p className="text-sm text-muted-foreground">
                  {t('lobby.need_more_cards')}
                </p>
              )}
              {hasEnoughPlayers && hasEnoughCards && isOwner && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {t('lobby.ready_to_start')}
                </p>
              )}
              {hasEnoughPlayers && hasEnoughCards && !isOwner && (
                <p className="text-sm text-muted-foreground">
                  {t('lobby.waiting_for_owner')}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLeaveLobby}
                className="px-6 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/80 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
              >
                {t('lobby.leave')}
              </button>

              {isOwner && (
                <button
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {t('lobby.start_game')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
