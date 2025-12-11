import { create } from "zustand";

interface GameWebSocketStore {
  ws: WebSocket | null;
  setWebSocket: (ws: WebSocket | null) => void;
  connect: (gameId: string) => void;
}

export const useGameWebSocketStore = create<GameWebSocketStore>((set) => ({
  ws: null,
  setWebSocket: (ws) => set({ ws }),
  connect: (gameId: string) => {
    console.log("[WebSocketStore] Connecting with gameId:", gameId);
    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV ||
          "wss://main-server-dev.1050100.xyz"
        : import.meta.env.VITE_API_WS_GATEWAY ||
          "wss://main-server-dev.1050100.xyz";
    const endpoint = `${BASE_WS_URL}/game/connect?gameId=${gameId}`;
    console.log("[WebSocketStore] Endpoint:", endpoint);

    const newWs = new WebSocket(endpoint);

    newWs.onopen = () => console.log("[WebSocketStore] WebSocket opened");
    newWs.onerror = (e) => console.error("[WebSocketStore] WebSocket error:", e);
    newWs.onclose = () => console.log("[WebSocketStore] WebSocket closed");

    set({ ws: newWs });
  },

    const newWs = new WebSocket(endpoint);
    set({ ws: newWs });
  },
}));
