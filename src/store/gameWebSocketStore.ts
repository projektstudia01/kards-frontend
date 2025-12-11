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
    const BASE_WS_URL =
      import.meta.env.MODE === "development"
        ? import.meta.env.VITE_API_WS_GATEWAY_DEV ||
          "wss://main-server-dev.1050100.xyz"
        : import.meta.env.VITE_API_WS_GATEWAY ||
          "wss://main-server-dev.1050100.xyz";
    const endpoint = `${BASE_WS_URL}/game/connect?game=${gameId}`;

    const newWs = new WebSocket(endpoint);
    set({ ws: newWs });
  },
}));
