import { create } from 'zustand';

interface GameWebSocketStore {
  ws: WebSocket | null;
  setWebSocket: (ws: WebSocket | null) => void;
}

export const useGameWebSocketStore = create<GameWebSocketStore>((set) => ({
  ws: null,
  setWebSocket: (ws) => set({ ws }),
}));
