import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGameWebSocketStore } from "../store/gameWebSocketStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Game from "../components/Game";
import { getCookie } from "../utils/qrcode";
import type {
  AllCardsSubmittedData,
  GameState,
  RoundFinishedData,
  RoundStartedData,
} from "../types/game";

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user, logout } = useAuthStore();
  const { ws, setWebSocket, addMessage } = useGameWebSocketStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const initialDataLoaded = useRef<boolean>(false);
  const reconnectTimeout = useRef<any>(null);
  const shouldReconnect = useRef<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(
    !!ws && ws.readyState === WebSocket.OPEN
  );

  const [gameState, setGameState] = useState<GameState>({
    gameId: gameId || "",
    currentJudgeId: null,
    blackCard: null,
    myCards: [],
    selectedCardIds: [],
    submissions: [],
    players: [],
    isJudge: false,
    gamePhase: "waiting",
  });

  const loadedGameId = useRef<string | null>(null);

  // Ref to access current players in WebSocket callbacks without triggering re-connects
  const playersRef = useRef(gameState.players);
  useEffect(() => {
    playersRef.current = gameState.players;
  }, [gameState.players]);

  // Initialize game state from navigation state if available
  useEffect(() => {
    const navState = location.state as { roundData?: RoundStartedData };
    if (navState?.roundData) {
      const roundData = navState.roundData;

      // Mark this game ID as having loaded initial data to prevent reset
      if (gameId) {
        loadedGameId.current = gameId;
      }

      console.group(`[GamePage] Navigation Init Debug [Game: ${gameId}]`);
      console.log("Round Data from State:", roundData);
      console.log("Card Ref:", roundData.cardRef);
      console.log("User ID:", user?.id);

      const userId = user?.id ? String(user.id) : "";
      const judgeId = roundData.cardRef ? String(roundData.cardRef) : "";
      const isJudge = userId !== "" && userId === judgeId;
      console.log("Computed isJudge:", isJudge);
      console.groupEnd();

      initialDataLoaded.current = true;

      const uniqueCards = roundData.cards
        ? Array.from(
          new Map(roundData.cards.map((card) => [card.id, card])).values()
        )
        : [];

      setGameState((prev) => ({
        ...prev,
        currentJudgeId: roundData.cardRef,
        blackCard: roundData.blackCard,
        myCards: uniqueCards,
        selectedCardIds: [],
        submissions: [],
        isJudge: isJudge, // Use computed safe boolean
        gamePhase: "selecting",
      }));

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, user?.id, navigate, location.pathname, gameId]);

  // Reset state when user or game changes to prevent data leakage (e.g. shared cookies)

  useEffect(() => {
    // If we have ALREADY loaded data for this specific game ID (e.g. via navigation),
    // we should NOT reset the state, as that would overwrite the data we just loaded.
    if (gameId && loadedGameId.current === gameId) {
      console.log(
        `[GamePage] Skipping state reset for game ${gameId} (Data already loaded)`
      );
      return;
    }

    initialDataLoaded.current = false;

    setGameState((prev) => ({
      ...prev,

      myCards: [],

      selectedCardIds: [],

      submissions: [],

      isJudge: false,
    }));
  }, [user?.id, gameId]);

  // Listen to WebSocket messages (WebSocket created in LobbyPage)
  useEffect(() => {
    if (!gameId || !user) return;

    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV
        : import.meta.env.VITE_API_WS_GATEWAY;

    const connect = () => {
      // If we already have a valid connection, just use it
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        if (ws.readyState === WebSocket.OPEN) {
          setIsConnected(true);
        }
        // Ensure listeners are attached to the EXISTING ws
        attachListeners(ws);
        return;
      }

      // Get sessionToken from cookies
      const sessionToken = getCookie("sessionToken");
      const endpoint = `${BASE_WS_URL}/game/connect?${sessionToken ? `sessionToken=${sessionToken}&` : ""
        }game=${gameId}`;

      toast.info(t("reconnecting"));
      const newWs = new WebSocket(endpoint);
      setWebSocket(newWs);
      attachListeners(newWs);
    };

    const attachListeners = (socket: WebSocket) => {
      // Clear previous listeners to avoid duplicates if we are re-attaching
      // Note: This is tricky with anonymous functions.
      // In this architecture, useEffect cleanup handles removing listeners.
      // We rely on the fact that useEffect re-runs if `ws` changes.

      socket.onopen = () => {
        setIsConnected(true);
        toast.success(t("connected"));
      };

      socket.onclose = () => {
        setIsConnected(false);
        if (shouldReconnect.current) {
          if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = setTimeout(() => {
            connect(); // Attempt to create NEW connection
          }, 2000);
        }
      };

      socket.onerror = () => {
        // Error usually precedes close
      };

      socket.onmessage = handleMessage;
    };

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const { event: eventType, data: eventData } = data;

      switch (eventType) {
        case "WS_CONNECTED":
          setIsConnected(true);
          return;

        case "CHAT_MESSAGE":
          addMessage(eventData);
          return;

        case "INVALID_OR_EXPIRED_SESSION":
          shouldReconnect.current = false;
          logout();
          navigate("/login");
          return;

        case "JOIN_FAILED":
          shouldReconnect.current = false;
          if (ws) {
            ws.close();
            setWebSocket(null);
          }
          toast.error(eventData.reason || t("lobby.errors.join_failed"));
          navigate("/welcome");
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
            const leavingPlayer = playersRef.current.find(
              (p) => p.id === eventData.id
            );
            if (leavingPlayer) {
              toast.info(t("lobby.player_left", { name: leavingPlayer.name }));
            }
          }
          return;

        case "ROUND_STARTED": {
          const roundData = eventData as RoundStartedData;

          console.group(`[GamePage] ROUND_STARTED Debug [Game: ${gameId}]`); // Log Game ID
          console.log("Raw Message String:", JSON.stringify(eventData)); // Log raw string to avoid browser object reference issues
          console.log("Current User:", user);
          console.log("Card Ref (Server):", roundData.cardRef);
          console.log("User ID (Local):", user?.id);
          console.log("Cards (Count):", roundData.cards?.length);

          const userId = user?.id ? String(user.id) : "";
          const judgeId = roundData.cardRef ? String(roundData.cardRef) : "";
          const isJudge = userId !== "" && userId === judgeId;

          console.log(
            "Computed isJudge:",
            isJudge,
            `('${userId}' === '${judgeId}')`
          );
          console.groupEnd();

          initialDataLoaded.current = true;

          const uniqueCards = roundData.cards
            ? Array.from(
              new Map(roundData.cards.map((card) => [card.id, card])).values()
            )
            : [];

          console.log("Unique Cards Processed:", uniqueCards.length);

          const isReconnect = typeof roundData.hasSubmitted !== "undefined";

          setGameState((prev) => {
            const newState = {
              ...prev,
              currentJudgeId: roundData.cardRef,
              blackCard: roundData.blackCard,
              myCards: uniqueCards,
              selectedCardIds: [],
              submissions: [],
              // If it's a reconnect, preserve player statuses (loaded from PLAYERS_IN_GAME)
              // If it's a new round, reset everyone's status
              players: isReconnect
                ? prev.players
                : prev.players.map((p) => ({ ...p, hasSubmitted: false })),
              isJudge: isJudge,
              // If I have submitted, go to waiting. If not (or new round), go to selecting.
              gamePhase: roundData.hasSubmitted ? "waiting" : "selecting",
            };
            console.log("New Game State:", newState);
            return newState;
          });
          return;
        }

        case "CARDS_SUBMITTED": {
          const { playerId } = eventData;
          setGameState((prev) => ({
            ...prev,
            players: prev.players.map((p) =>
              p.id === playerId ? { ...p, hasSubmitted: true } : p
            ),
          }));
          return;
        }

        case "REF_CHANGED": {
          const { newJudgeId } = eventData;
          setGameState((prev) => ({
            ...prev,
            currentJudgeId: newJudgeId,
            isJudge: newJudgeId === user?.id,
          }));
          toast.info(t("game.judge_changed")); // Note: You might need to add this key or use a generic message
          return;
        }

        case "ALL_CARDS_SUBMITTED": {
          const submittedData = eventData as AllCardsSubmittedData;
          setGameState((prev) => ({
            ...prev,
            submissions: submittedData.submissions,
            gamePhase: "judging",
          }));
          return;
        }

        case "ROUND_FINISHED": {
          const finishedData = eventData as RoundFinishedData;
          setGameState((prev) => ({
            ...prev,
            players: finishedData.players,
            gamePhase: "results",
          }));
          toast.success(
            t("game.round_winner", { name: finishedData.winner.name })
          );

          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              gamePhase: "waiting",
            }));
          }, 5000);
          return;
        }

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

        default: {
          const errorMessage = t(`errors.${eventType}`);
          if (errorMessage !== `errors.${eventType}`) {
            toast.error(errorMessage);
          }
        }
      }
    };

    // Initial connection logic
    connect();

    return () => {
      // Cleanup
      shouldReconnect.current = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);

      if (ws) {
        ws.onopen = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
      }

      // Close WebSocket when unmounting (but don't send LEAVE_GAME - button handler already did)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounting");
      }
    };
  }, [gameId, user, logout, navigate, t]); // Removed gameState.players to prevent reconnect loop

  const handleSubmitCards = (cardIds: string[]) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error(t("errors.websocket_not_connected"));
      return;
    }

    ws.send(
      JSON.stringify({
        event: "SUBMIT_CARDS",
        data: { cardIds },
      })
    );

    setGameState((prev) => ({
      ...prev,
      selectedCardIds: cardIds,
      gamePhase: "waiting",
    }));

    toast.success(t("game.cards_submitted"));
  };

  const handleSelectWinner = (playerId: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error(t("errors.websocket_not_connected"));
      return;
    }

    ws.send(
      JSON.stringify({
        event: "SELECT_ROUND_WINNER",
        data: { playerId },
      })
    );
  };

  const handleLeaveGame = () => {
    shouldReconnect.current = false;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: "LEAVE_GAME" }));
      setTimeout(() => {
        ws.close(1000, "User left game");
        navigate("/welcome");
      }, 100);
    } else {
      navigate("/welcome");
    }
  };

  if (!gameId) {
    return null;
  }

  return (
    <>
      {!isConnected && (
        <div className="bg-red-500 text-white text-center py-2 fixed top-0 w-full z-50 animate-pulse">
          {t("reconnecting")}
        </div>
      )}
      <Game
        gameState={gameState}
        onSubmitCards={handleSubmitCards}
        onSelectWinner={handleSelectWinner}
        onLeaveGame={handleLeaveGame}
        currentUserId={user?.id || ""}
      />
    </>
  );
};

export default GamePage;
