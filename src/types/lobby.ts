// Types based on backend API responses (following docs.md)

export interface Deck {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  blackCardsCount: number;
  whiteCardsCount: number;
}

export interface Player {
  id: string; // gamePlayerId
  userId?: string; // actual userId from session
  name: string;
  points: number;
  owner: boolean;
}

// Legacy types - kept for backward compatibility with existing API hooks
export interface LobbySettings {
  id: string;
  name: string;
  type: 'private' | 'public';
  maxPlayers: number;
  currentPlayers: number;
  selectedDecks: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

export interface Invitation {
  id: string;
  lobbyId: string;
  token: string;
  expiresAt: string;
  createdBy: string;
  isUsed: boolean;
}