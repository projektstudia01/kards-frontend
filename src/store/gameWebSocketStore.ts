import { create } from 'zustand';

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface GameWebSocketStore {
  ws: WebSocket | null;
  setWebSocket: (ws: WebSocket | null) => void;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useGameWebSocketStore = create<GameWebSocketStore>((set) => ({
  ws: null,
  setWebSocket: (ws) => set({ ws }),
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}));
