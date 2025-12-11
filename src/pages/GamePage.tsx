import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getCookie } from "../utils/qrcode";
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<any>(null);
  const shouldReconnect = useRef<boolean>(true);

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

  useEffect(() => {
    if (!gameId || !user) return;

    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV
        : import.meta.env.VITE_API_WS_GATEWAY;
    
    // Get sessionToken from cookies
    const sessionToken = getCookie('sessionToken');
    const endpoint = `${BASE_WS_URL}/game/connect?${sessionToken ? `sessionToken=${sessionToken}&` : ''}game=${gameId}`;

    const connect = () => {
      if (
        ws.current &&
        (ws.current.readyState === WebSocket.CONNECTING ||
          ws.current.readyState === WebSocket.OPEN)
      ) {
        return;
      }

      toast.info(t("reconnecting"));
      ws.current = new WebSocket(endpoint);

      ws.current.addEventListener("error", () => {
        toast.error(t("errors.UNKNOWN_ERROR"));
      });

      ws.current.addEventListener("open", () => {
        toast.success(t("connected"));
      });

      ws.current.addEventListener("message", (event: any) => {
        const data = JSON.parse(event.data);
        const { event: eventType, data: eventData } = data;
        console.log('[Game WebSocket Event]', eventType, eventData);

        switch (eventType) {
          case "WS_CONNECTED":
            return;

          case "INVALID_OR_EXPIRED_SESSION":
            shouldReconnect.current = false;
            logout();
            navigate("/login");
            return;

          case "GAME_STARTED":
            toast.success(t("game.started"));
            return;

          case "PLAYERS_IN_GAME":
            console.log('[Game PLAYERS_IN_GAME] Received players:', eventData);
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
            setGameState((prev) => ({
              ...prev,
              currentJudgeId: roundData.cardRef,
              blackCard: roundData.blackCard,
              myCards: roundData.cards,
              selectedCardIds: [],
              submissions: [],
              isJudge: roundData.cardRef === user?.id,
              gamePhase: roundData.cardRef === user?.id ? 'judging' : 'selecting',
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
            
            // Auto-hide results after 5 seconds
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                gamePhase: 'waiting',
              }));
            }, 5000);
            return;

          case "KICKED_FROM_GAME":
            shouldReconnect.current = false;
            toast.error(t("errors.KICKED_FROM_GAME"));
            navigate("/welcome");
            return;

          case "GAME_FINISHED":
            shouldReconnect.current = false;
            toast.info(t("game.finished"));
            navigate("/welcome");
            return;

          default:
            const errorMessage = t(`errors.${eventType}`);
            if (errorMessage !== `errors.${eventType}`) {
              toast.error(errorMessage);
            }
        }
      });

      ws.current.addEventListener("close", () => {
        toast.error(t("errors.WEBSOCKET_DISCONNECT"));

        if (shouldReconnect.current) {
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
          }

          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, 2000);
        }
      });
    };

    connect();

    const handleBeforeUnload = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ event: 'LEAVE_GAME' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      shouldReconnect.current = false;

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ event: 'LEAVE_GAME' }));
        setTimeout(() => {
          if (ws.current) {
            ws.current.close(1000, "Component unmounting");
            ws.current = null;
          }
        }, 100);
      } else if (ws.current) {
        ws.current.close(1000, "Component unmounting");
        ws.current = null;
      }

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameId, logout, t, navigate, user]);

  const handleSubmitCards = (cardIds: string[]) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }

    ws.current.send(JSON.stringify({
      event: 'SUBMIT_CARDS',
      data: { cardIds }
    }));

    setGameState((prev) => ({
      ...prev,
      gamePhase: 'waiting',
    }));
    
    toast.success(t('game.cards_submitted'));
  };

  const handleSelectWinner = (playerId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      toast.error(t('errors.websocket_not_connected'));
      return;
    }

    ws.current.send(JSON.stringify({
      event: 'SELECT_ROUND_WINNER',
      data: { playerId }
    }));
  };

  const handleLeaveGame = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event: 'LEAVE_GAME' }));
      setTimeout(() => {
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
