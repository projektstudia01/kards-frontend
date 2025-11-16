import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LobbySettings, Player, Invitation, LobbyState } from '../types/lobby';

interface LobbyStore extends LobbyState {
  lobbyId: string | null;
  // Actions
  setLobby: (lobby: LobbySettings | null) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setInvitation: (invitation: Invitation | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setLobbyId: (lobbyId: string | null) => void;
  clearLobby: () => void;
}

export const useLobbyStore = create<LobbyStore>()(
  persist(
    (set) => ({
      // Initial state
      lobby: null,
      players: [],
      invitation: null,
      isLoading: false,
      error: null,
      lobbyId: null,

  // Actions
  setLobby: (lobby) => set({ lobby }),
  
  setPlayers: (players) => set({ players }),
  
  addPlayer: (player) => set((state) => ({
    players: [...state.players, player],
    lobby: state.lobby ? {
      ...state.lobby,
      currentPlayers: state.players.length + 1
    } : null
  })),
  
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.id !== playerId),
    lobby: state.lobby ? {
      ...state.lobby,
      currentPlayers: Math.max(0, state.players.length - 1)
    } : null
  })),
  
  setInvitation: (invitation) => set({ invitation }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setLobbyId: (lobbyId) => set({ lobbyId }),
  
  clearLobby: () => set({
    lobby: null,
    players: [],
    invitation: null,
    isLoading: false,
    error: null,
    lobbyId: null
  })
}),
    {
      name: 'lobby-storage',
    }
  )
);