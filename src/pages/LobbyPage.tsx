import React, { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useLobbyStore } from "../store/lobbyStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Lobby from "../components/Lobby";

const LobbyPage: React.FC = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const { user, logout } = useAuthStore();
  const { clearLobby } = useLobbyStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const ws = useRef<any>(null);
  const reconnectTimeout = useRef<any>(null);
  const shouldReconnect = useRef<boolean>(true);

  // Token to user.id (session id) z authStore
  const token = "3e6f26dc-25d4-4df7-a496-b90fb5a9f920";

  useEffect(() => {
    if (!token || !lobbyId) return;

    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV ||
          "wss://main-server-dev.1050100.xyz"
        : import.meta.env.VITE_API_WS_GATEWAY ||
          "wss://main-server-dev.1050100.xyz";
    const endpoint = `${BASE_WS_URL}/game/connect`;

    const connect = () => {
      if (
        ws.current &&
        (ws.current.readyState === WebSocket.CONNECTING ||
          ws.current.readyState === WebSocket.OPEN)
      ) {
        console.log(
          "WebSocket is already connecting or open. Skipping connect."
        );
        return;
      }

      console.log("Connecting to WebSocket:", endpoint);
      toast.info(t("reconnecting"));
      ws.current = new WebSocket(endpoint, token);

      ws.current.addEventListener("error", (error: any) => {
        console.log("WebSocket error:", error);
        toast.error(t("errors.UNKNOWN_ERROR"));
      });

      ws.current.addEventListener("open", () => {
        console.log("WebSocket connected");
        toast.success(t("connected"));
      });

      ws.current.addEventListener("message", (event: any) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        switch (data.event) {
          case "WS_CONNECTED":
            console.log("WebSocket connection confirmed");
            return;
          case "INVALID_OR_EXPIRED_SESSION":
            console.log("Invalid or expired session, logging out");
            shouldReconnect.current = false;
            logout();
            navigate("/login");
            return;
          case "USER_NOT_IN_GAME":
            console.log("User not in game, leaving lobby");
            shouldReconnect.current = false;
            clearLobby();
            toast.error(t("errors.USER_NOT_IN_GAME"));
            navigate("/welcome");
            return;
          case "GAME_FINISHED":
            // funkcjaZaToOdpowiadająca(data.data);
            console.log("Game finished:", data.data);
            break;
          default:
            const errorMessage = t(`errors.${data.event}`);
            toast.error(
              errorMessage === `errors.${data.event}`
                ? t("errors.UNKNOWN_ERROR")
                : errorMessage
            );
        }
      });

      ws.current.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        toast.error(t("errors.WEBSOCKET_DISCONNECT"));

        if (shouldReconnect.current) {
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
          }

          reconnectTimeout.current = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connect();
          }, 2000); // 2 second delay
        }
      });
    };

    connect();

    return () => {
      console.log("LobbyPage unmounting - closing WebSocket connection");

      // Clear reconnect timeout
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      // Close WebSocket
      if (ws.current) {
        ws.current.close(1000, "Component unmounting");
        ws.current = null;
      }
    };
  }, [token, lobbyId, logout, t]);

  if (!lobbyId) {
    return null;
  }

  return <Lobby wsRef={ws} />;
};

export default LobbyPage;
