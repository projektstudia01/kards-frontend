import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Lobby from "../components/Lobby";

const LobbyPage: React.FC = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const ws = useRef<any>(null);
  const reconnectTimeout = useRef<any>(null);

  // Token to user.id (session id) z authStore
  const token = user?.id;

  useEffect(() => {
    if (!token || !lobbyId) return;

    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV || "ws://localhost:8080"
        : import.meta.env.VITE_API_WS_GATEWAY || "wss://main-server-dev.1050100.xyz";
    const endpoint = `${BASE_WS_URL}/connect`;

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
          case "GAME_FINISHED":
            // funkcjaZaToOdpowiadająca(data.data);
            console.log("Game finished:", data.data);
            break;
          case "INVALID_OR_EXPIRED_SESSION":
            // W ws też musimy sprawdzać sesję
            console.log("Invalid session, logging out");
            logout();
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
        
        // Clear existing timeout if any
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        
        reconnectTimeout.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 2000); // 2 second delay
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
