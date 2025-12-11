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
    id: string;
    userId?: string;
    name: string;
    points: number;
    owner: boolean;
}
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
//# sourceMappingURL=lobby.d.ts.map