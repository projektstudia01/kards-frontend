import type { CreateLobbyRequest, JoinLobbyRequest, LobbySettings, Player, Invitation } from '../types/lobby';
import { customAxios } from '../api/customAxios';

export class LobbyAPI {
  // Tworzenie nowego lobby
  static async createLobby(request: CreateLobbyRequest): Promise<LobbySettings> {
    try {
      const response = await customAxios.post('/lobby', request);
      return response.data;
    } catch (error) {
      console.error('Error creating lobby:', error);
      throw new Error('Nie udało się utworzyć lobby');
    }
  }

  // Pobieranie publicznych lobby
  static async getPublicLobbies(): Promise<LobbySettings[]> {
    try {
      // TODO: Implement when GET method is available in customAxios
      // Mock data for now
      const mockLobbies: LobbySettings[] = [
        {
          id: 'lobby-1',
          name: 'Wieczorna rozgrywka',
          type: 'public',
          maxPlayers: 6,
          currentPlayers: 3,
          selectedDecks: ['basic', 'polish'],
          createdBy: 'user123',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: 'lobby-2',
          name: 'Szybka gra',
          type: 'public',
          maxPlayers: 4,
          currentPlayers: 2,
          selectedDecks: ['clean'],
          createdBy: 'user456',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ];
      return mockLobbies;
    } catch (error) {
      console.error('Error fetching public lobbies:', error);
      throw new Error('Nie udało się pobrać listy publicznych lobby');
    }
  }

  // Dołączanie do lobby
  static async joinLobby(request: JoinLobbyRequest): Promise<{ lobby: LobbySettings; player: Player }> {
    try {
      const response = await customAxios.post('/lobby/join', request);
      return response.data;
    } catch (error) {
      console.error('Error joining lobby:', error);
      throw new Error('Nie udało się dołączyć do lobby');
    }
  }

  // Pobieranie szczegółów lobby
  static async getLobby(lobbyId: string): Promise<{ lobby: LobbySettings; players: Player[] }> {
    try {
      // TODO: Implement when GET method is available in customAxios
      // Mock data for now
      const mockLobby: LobbySettings = {
        id: lobbyId,
        name: 'Wieczorna rozgrywka',
        type: 'private',
        maxPlayers: 6,
        currentPlayers: 2,
        selectedDecks: ['basic', 'polish'],
        createdBy: 'user123',
        createdAt: new Date().toISOString(),
        isActive: true
      };

      const mockPlayers: Player[] = [
        {
          id: 'user123',
          username: 'Host',
          isHost: true,
          joinedAt: new Date().toISOString()
        },
        {
          id: 'user456',
          username: 'Gracz 2',
          isHost: false,
          joinedAt: new Date().toISOString()
        }
      ];

      return { lobby: mockLobby, players: mockPlayers };
    } catch (error) {
      console.error('Error fetching lobby:', error);
      throw new Error('Nie udało się pobrać danych lobby');
    }
  }

  // Generowanie zaproszenia
  static async generateInvitation(lobbyId: string): Promise<Invitation> {
    try {
      await customAxios.post(`/lobby/${lobbyId}/invitation`, {});
      
      // Mock invitation for now
      const mockInvitation: Invitation = {
        id: 'invite-' + Date.now(),
        lobbyId: lobbyId,
        token: 'invite-token-' + Math.random().toString(36).substr(2, 9),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdBy: 'user123',
        isUsed: false
      };
      
      return mockInvitation;
    } catch (error) {
      console.error('Error generating invitation:', error);
      throw new Error('Nie udało się wygenerować zaproszenia');
    }
  }

  // Opuszczanie lobby
  static async leaveLobby(lobbyId: string): Promise<void> {
    try {
      await customAxios.post(`/lobby/${lobbyId}/leave`, {});
    } catch (error) {
      console.error('Error leaving lobby:', error);
      throw new Error('Nie udało się opuścić lobby');
    }
  }

  // Rozpoczynanie gry
  static async startGame(lobbyId: string): Promise<{ gameId: string }> {
    try {
      await customAxios.post(`/lobby/${lobbyId}/start`, {});
      
      // Mock game start response
      return { gameId: 'game-' + lobbyId + '-' + Date.now() };
    } catch (error) {
      console.error('Error starting game:', error);
      throw new Error('Nie udało się rozpocząć gry');
    }
  }
}

// Hook do korzystania z API w komponentach React
export const useLobbyAPI = () => {
  return {
    createLobby: LobbyAPI.createLobby,
    getPublicLobbies: LobbyAPI.getPublicLobbies,
    joinLobby: LobbyAPI.joinLobby,
    getLobby: LobbyAPI.getLobby,
    generateInvitation: LobbyAPI.generateInvitation,
    leaveLobby: LobbyAPI.leaveLobby,
    startGame: LobbyAPI.startGame,
  };
};