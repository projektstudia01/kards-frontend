import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGameWebSocketStore } from "../store/gameWebSocketStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Game from "../components/Game";
import type {
  GameState,
  RoundStartedData,
  AllCardsSubmittedData,
  RoundFinishedData,
} from "../types/game";

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user, logout } = useAuthStore();
  const { ws } = useGameWebSocketStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const initialDataLoaded = useRef<boolean>(false);

  const [gameState, setGameState] = useState<GameState>({
    gameId: gameId || '',
    currentJudgeId: null,
    blackCard: null,
    myCards: [],
    selectedCardIds: [],
    submissions: [],
    players: [],
    isJudge: false,
    gamePhase: 'waiting',
  });

  // Initialize game state from navigation state if available
  useEffect(() => {
    const navState = location.state as { roundData?: RoundStartedData };
    if (navState?.roundData) {
      const roundData = navState.roundData;
      
      initialDataLoaded.current = true;
      
      const uniqueCards = roundData.cards ? 
        Array.from(new Map(roundData.cards.map(card => [card.id, card])).values()) : 
        [];
      
      setGameState((prev) => ({
        ...prev,
        currentJudgeId: roundData.cardRef,
        blackCard: roundData.blackCard,
        myCards: uniqueCards,
        selectedCardIds: [],
        submissions: [],
        isJudge: roundData.cardRef === user?.id,
        gamePhase: 'selecting',
      }));
      
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user?.id, navigate, location.pathname]);

  // Listen to WebSocket messages (WebSocket created in LobbyPage)
  useEffect(() => {
    if (!ws || !gameId || !user) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const { event: eventType, data: eventData } = data;

      switch (eventType) {
        case "WS_CONNECTED":
          return;

        case "INVALID_OR_EXPIRED_SESSION":
          logout();
          navigate("/login");
          return;

        case "PLAYERS_IN_GAME":
          if (Array.isArray(eventData)) {
            setGameState((prev) => ({
              ...prev,
              players: eventData,
            }));
          }
          return;

        case "PLAYER_LEFT":
          if (eventData && eventData.id) {
            const leavingPlayer = gameState.players.find(p => p.id === eventData.id);
            if (leavingPlayer) {
              toast.info(t("lobby.player_left", { name: leavingPlayer.name }));
            }
          }
          return;

        case "ROUND_STARTED":
          const roundData = eventData as RoundStartedData;
          
          // Skip if we already have initial data
          if (initialDataLoaded.current && (!roundData.cards || roundData.cards.length === 0)) {
            return;
          }
          
          initialDataLoaded.current = true;
          
          const uniqueCards = roundData.cards ? 
            Array.from(new Map(roundData.cards.map(card => [card.id, card])).values()) : 
            [];
          
          setGameState((prev) => ({
            ...prev,
            currentJudgeId: roundData.cardRef,
            blackCard: roundData.blackCard,
            myCards: uniqueCards,
            selectedCardIds: [],
            submissions: [],
            isJudge: roundData.cardRef === user?.id,
            gamePhase: 'selecting',
          }));
          return;

        case "ALL_CARDS_SUBMITTED":
          const submittedData = eventData as AllCardsSubmittedData;
          setGameState((prev) => ({
            ...prev,
            submissions: submittedData.submissions,
            gamePhase: 'judging',
          }));
          return;

        case "ROUND_FINISHED":
          const finishedData = eventData as RoundFinishedData;
          setGameState((prev) => ({
            ...prev,
            players: finishedData.players,
            gamePhase: 'results',
          }));
          toast.success(
            t("game.round_winner", { name: finishedData.winner.name })
          );
          
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              gamePhase: 'waiting',
            }));
          }, 5000);
          return;

        case "KICKED_FROM_GAME":
          toast.error(t("errors.KICKED_FROM_GAME"));
          navigate("/welcome");
          return;

        case "GAME_FINISHED":
          toast.info(t("game.finished"));
          navigate("/welcome");
          return;

        default:
          const errorMessage = t(`errors.${eventType}`);
          if (errorMessage !== `errors.${eventType}`) {
            toast.error(errorMessage);
          }
      }
    };

    ws.addEventListener("message", handleMessage);

    const handleBeforeUnload = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: 'LEAVE_GAME' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      ws.removeEventListener("message", handleMessage);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Close WebSocket when unmounting (but don't send LEAVE_GAME - button handler already did)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [ws, gameId, user, logout, navigate, t, gameState.players]);

  const handleSubmitCards = (cardIds: string[]) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }

    ws.send(JSON.stringify({
      event: 'SUBMIT_CARDS',
      data: { cardIds }
    }));

    setGameState((prev) => ({
      ...prev,
      selectedCardIds: cardIds,
      gamePhase: 'waiting',
    }));
    
    toast.success(t('game.cards_submitted'));
  };

  const handleSelectWinner = (playerId: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }

    ws.send(JSON.stringify({
      event: 'SELECT_ROUND_WINNER',
      data: { playerId }
    }));
  };

  const handleLeaveGame = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: 'LEAVE_GAME' }));
      setTimeout(() => {
        ws.close(1000, "User left game");
        navigate('/welcome');
      }, 100);
    } else {
      navigate('/welcome');
    }
  };

  if (!gameId) {
    return null;
  }

  return (
    <Game
      gameState={gameState}
      onSubmitCards={handleSubmitCards}
      onSelectWinner={handleSelectWinner}
      onLeaveGame={handleLeaveGame}
      currentUserId={user?.id || ''}
    />
  );
};

export default GamePage;
