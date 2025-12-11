import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Lobby from "../components/Lobby";
import type { Player, Deck } from "../types/lobby";
import { getCookie } from "../utils/qrcode";

const LobbyPage: React.FC = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<any>(null);
  const shouldReconnect = useRef<boolean>(true);

  // Local state - following DeckEditor pattern
  const [players, setPlayers] = useState<Player[]>([]);
  const [decksInGame, setDecksInGame] = useState<Deck[]>([]);
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);
  const [availableDecksPage, setAvailableDecksPage] = useState(0);
  const [availableDecksTotal, setAvailableDecksTotal] = useState(0);
  const [availableDecksPageSize] = useState(10);

  // WebSocket connection - stays at page level to avoid reconnects on component changes
  useEffect(() => {
    if (!lobbyId || !user) return;

    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV ||
          "ws://localhost:8000"
        : import.meta.env.VITE_API_WS_GATEWAY ||
          "wss://main-server-dev.1050100.xyz";
    
    // Get sessionToken from cookies
    const sessionToken = getCookie('sessionToken');
    const endpoint = `${BASE_WS_URL}/game/connect?${sessionToken ? `sessionToken=${sessionToken}&` : ''}game=${lobbyId}`;

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
        // Backend sends initial data automatically via sendInitialData
      });

      ws.current.addEventListener("message", (event: any) => {
        const data = JSON.parse(event.data);

        const { event: eventType, data: eventData } = data;
        console.log('[WebSocket Event]', eventType, eventData);

        switch (eventType) {
          case "WS_CONNECTED":
            return;

          case "INVALID_OR_EXPIRED_SESSION":
            shouldReconnect.current = false;
            logout();
            navigate("/login");
            return;

          case "USER_NOT_IN_GAME":
            shouldReconnect.current = false;
            toast.error(t("errors.USER_NOT_IN_GAME"));
            navigate("/welcome");
            return;

          case "KICKED_FROM_GAME":
            shouldReconnect.current = false;
            toast.error(t("errors.KICKED_FROM_GAME"));
            navigate("/welcome");
            return;

          case "NEW_PLAYER_JOINED":
            if (eventData && eventData.id && eventData.name) {
              toast.info(t("lobby.player_joined", { name: eventData.name }));
              // Add new player to list if not already present
              setPlayers((prev) => {
                const exists = prev.some(p => p.id === eventData.id);
                if (exists) return prev;
                return [...prev, {
                  id: eventData.id,
                  name: eventData.name,
                  points: 0,
                  owner: false
                }];
              });
            }
            return;

          case "PLAYER_LEFT":
            if (eventData && eventData.id) {
              setPlayers((prev) => prev.filter(p => p.id !== eventData.id));
            }
            return;

          case "PLAYERS_IN_GAME":
            console.log('[PLAYERS_IN_GAME] Received players:', eventData);
            if (Array.isArray(eventData)) {
              setPlayers(eventData);
              console.log('[PLAYERS_IN_GAME] Players updated, count:', eventData.length);
            }
            return;

          case "AVAILABLE_DECKS":
            // Handle two structures from backend:
            // 1. {event, data: [...], total, page} - from initial data
            // 2. {event, data: {data: [...], total, page}} - from GET_DECKS_PAGINATED
            let decksData, total, page;
            
            if (Array.isArray(eventData)) {
              // Structure 1: data is directly an array
              decksData = eventData;
              total = data.total || eventData.length;
              page = data.page || 0;
            } else if (eventData && eventData.data && Array.isArray(eventData.data)) {
              // Structure 2: data is nested
              decksData = eventData.data;
              total = eventData.total || 0;
              page = eventData.page || 0;
            } else {
              return;
            }
            
            setAvailableDecks(decksData);
            setAvailableDecksTotal(total);
            setAvailableDecksPage(page);
            return;

          case "DECKS_IN_GAME":
            // Handle two structures: [] or {decks: [...]}
            if (Array.isArray(eventData)) {
              setDecksInGame(eventData);
            } else if (eventData && Array.isArray(eventData.decks)) {
              setDecksInGame(eventData.decks);
            }
            return;

          case "GAME_STARTED":
            shouldReconnect.current = false;
            toast.success(t("lobby.game_started"));
            navigate(`/game/${lobbyId}`);
            return;

          case "GAME_FINISHED":
            shouldReconnect.current = false;
            toast.info(t("lobby.game_finished"));
            navigate("/welcome");
            return;

          // Error events
          case "not_enough_players":
            toast.error(t("lobby.errors.min_players_2"));
            return;

          case "not_enough_cards_in_decks":
            toast.error(t("lobby.errors.not_enough_cards"));
            return;

          case "game_not_found":
            toast.error(t("lobby.errors.game_not_found"));
            shouldReconnect.current = false;
            navigate("/welcome");
            return;

          case "game_already_started":
            toast.error(t("lobby.errors.game_already_started"));
            return;

          case "user_it_not_game_owner":
            toast.error(t("lobby.errors.not_owner"));
            return;

          case "deck_not_found":
            toast.error(t("lobby.errors.deck_not_found"));
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

    // beforeunload handler to leave game when closing/refreshing page
    const handleBeforeUnload = () => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ event: 'LEAVE_GAME' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      shouldReconnect.current = false;

      // Send LEAVE_GAME before closing WebSocket
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

      // Clear reconnect timeout
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      // Remove beforeunload listener
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [lobbyId, logout, t, navigate, user]);

  if (!lobbyId) {
    return null;
  }

  return (
    <Lobby 
      wsRef={ws} 
      gameId={lobbyId}
      players={players}
      decksInGame={decksInGame}
      availableDecks={availableDecks}
      availableDecksPage={availableDecksPage}
      availableDecksTotal={availableDecksTotal}
      availableDecksPageSize={availableDecksPageSize}
    />
  );
};

export default LobbyPage;
