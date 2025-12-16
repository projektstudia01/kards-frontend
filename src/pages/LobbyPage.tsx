import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGameWebSocketStore } from "../store/gameWebSocketStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Lobby from "../components/Lobby";
import type { Player, Deck } from "../types/lobby";
import { getCookie } from "../utils/qrcode";
import { getGame } from "../api";

const LobbyPage: React.FC = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const { user, logout } = useAuthStore();
  const { ws, setWebSocket, addMessage, clearMessages } = useGameWebSocketStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const reconnectTimeout = useRef<any>(null);
  const shouldReconnect = useRef<boolean>(true);

  // Local state - following DeckEditor pattern
  const [players, setPlayers] = useState<Player[]>([]);
  const [decksInGame, setDecksInGame] = useState<Deck[]>([]);
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);
  const [availableDecksPage, setAvailableDecksPage] = useState(0);
  const [availableDecksTotal, setAvailableDecksTotal] = useState(0);
  const [availableDecksPageSize] = useState(10);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);

  // Clear messages on lobby change
  useEffect(() => {
    clearMessages();
  }, [lobbyId, clearMessages]);

  // Fetch game details (for invitation code)
  useEffect(() => {
    if (!lobbyId) return;
    const fetchGame = async () => {
      const response = await getGame(lobbyId);
      if (!response.isError && response.data) {
        setInvitationCode(response.data.invitationCode || null);
      }
    };
    fetchGame();
  }, [lobbyId]);

  // WebSocket connection - stays at page level to avoid reconnects on component changes
  useEffect(() => {
    if (!lobbyId || !user) return;

    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV
        : import.meta.env.VITE_API_WS_GATEWAY;
    
    // Get sessionToken from cookies
    const sessionToken = getCookie('sessionToken');
    
    // Get code from URL query params
    const queryParams = new URLSearchParams(window.location.search);
    const codeParam = queryParams.get('code');
    const codeQuery = codeParam ? `&code=${codeParam}` : '';

    const endpoint = `${BASE_WS_URL}/game/connect?${sessionToken ? `sessionToken=${sessionToken}&` : ''}game=${lobbyId}${codeQuery}`;

    const connect = () => {
      if (
        ws &&
        (ws.readyState === WebSocket.CONNECTING ||
          ws.readyState === WebSocket.OPEN)
      ) {
        return;
      }

      toast.info(t("reconnecting"));
      
      const newWs = new WebSocket(endpoint);
      setWebSocket(newWs);
      
      newWs.addEventListener("error", () => {
        toast.error(t("errors.UNKNOWN_ERROR"));
      });

      newWs.addEventListener("open", () => {
        toast.success(t("connected"));
        // Backend sends initial data automatically via sendInitialData
      });

      newWs.addEventListener("message", (event: any) => {
        const data = JSON.parse(event.data);

        const { event: eventType, data: eventData } = data;

        switch (eventType) {
          case "WS_CONNECTED":
            return;

          case "CHAT_MESSAGE":
            addMessage(eventData);
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

          case "JOIN_FAILED":
            shouldReconnect.current = false;
            toast.error(eventData.reason || t("lobby.errors.join_failed"));
            navigate("/welcome");
            return;

          case "KICKED_FROM_GAME":
            shouldReconnect.current = false;
            toast.error(t("errors.KICKED_FROM_GAME"));
            navigate("/welcome");
            return;

          case "NEW_PLAYER_JOINED":
            // toast.info(t("lobby.player_joined", { name: eventData.name }));
            // Don't manually add player - wait for PLAYERS_IN_GAME event
            // which contains correct owner status
            return;

          case "PLAYER_LEFT":
            if (eventData && eventData.id) {
              // Find player name before removing
              const leavingPlayer = players.find(p => p.id === eventData.id);
              if (leavingPlayer) {
                toast.info(t("lobby.player_left", { name: leavingPlayer.name }));
              }
              setPlayers((prev) => prev.filter(p => p.id !== eventData.id));
            }
            return;

          case "PLAYERS_IN_GAME":
            if (Array.isArray(eventData)) {
              setPlayers(eventData);
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
            toast.success(t("lobby.game_started"));
            // Don't close WebSocket yet - wait for ROUND_STARTED
            return;

          case "ROUND_STARTED":
            // Don't close WebSocket - GamePage will reuse the same connection
            shouldReconnect.current = false;
            
            // Navigate with round data - WebSocket stays open
            navigate(`/game/${lobbyId}`, { 
              state: { 
                roundData: eventData
              } 
            });
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

      newWs.addEventListener("close", () => {
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

    return () => {
      shouldReconnect.current = false;
      
      // DON'T close WebSocket here - GamePage will reuse it
      // Only close on actual page leave (beforeunload handles that)

      // Clear reconnect timeout
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };
  }, [lobbyId, logout, t, navigate, user, ws, setWebSocket]);

  if (!lobbyId) {
    return null;
  }

  const wsRef = useRef<WebSocket | null>(ws);
  wsRef.current = ws;

  return (
    <Lobby 
      wsRef={wsRef} 
      gameId={lobbyId}
      players={players}
      decksInGame={decksInGame}
      availableDecks={availableDecks}
      availableDecksPage={availableDecksPage}
      availableDecksTotal={availableDecksTotal}
      availableDecksPageSize={availableDecksPageSize}
      invitationCode={invitationCode}
    />
  );
};

export default LobbyPage;
