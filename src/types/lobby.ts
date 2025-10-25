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

export interface Player {
  id: string;
  username: string;
  isHost: boolean;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  lobbyId: string;
  token: string;
  expiresAt: string;
  createdBy: string;
  isUsed: boolean;
}

export interface LobbyState {
  lobby: LobbySettings | null;
  players: Player[];
  invitation: Invitation | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateLobbyRequest {
  name: string;
  type: 'private' | 'public';
  maxPlayers: number;
  selectedDecks: string[];
}

export interface JoinLobbyRequest {
  lobbyId?: string;
  invitationToken?: string;
}