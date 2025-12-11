export interface RegisterResponse {
    data: {
        message: string;
        userId: string;
        sessionId: string;
        code: string;
    };
}
export interface VerifyResponse {
    data: {
        message: string;
        userId: string;
    };
}
export interface ResendResponse {
    data: {
        message: string;
        sessionId: string;
        code: string;
    };
}
export declare const login: (email: string, password: string) => Promise<{
    isError: boolean;
    data: any;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
    data?: undefined;
}>;
export declare const register: (email: string, password: string) => Promise<any>;
export declare const verifyEmail: (code: string, email: string, sessionId: string) => Promise<any>;
export declare const resendVerificationCode: (email: string) => Promise<{
    isError: boolean;
    data: any;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
    data?: undefined;
}>;
export interface Deck {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}
export declare const getDecks: () => Promise<{
    isError: boolean;
    data: any;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
    data?: undefined;
}>;
export declare const createDeck: (title: string, description: string) => Promise<{
    isError: boolean;
    data: any;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
    data?: undefined;
}>;
export declare const deleteDeck: (deckId: string) => Promise<{
    isError: boolean;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
}>;
export declare const getDeck: (deckId: string) => Promise<{
    isError: boolean;
    data: any;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
    data?: undefined;
}>;
export interface Card {
    id?: string;
    text: string;
    type: 'black' | 'white';
    blankSpaceAmount?: number | null;
    createdAt?: string;
    updatedAt?: string;
    deck?: {
        id: string;
    };
}
export declare const addCards: (deckId: string, cards: Card[]) => Promise<{
    isError: boolean;
    data: any;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
    data?: undefined;
}>;
export declare const getCards: (deckId: string, page?: number, pageSize?: number, cardType?: "white" | "black") => Promise<{
    isError: boolean;
    data: any;
    total: any;
    page: any;
    pageSize: any;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
    data?: undefined;
    total?: undefined;
    page?: undefined;
    pageSize?: undefined;
}>;
export declare const deleteCards: (deckId: string, cardIds: string[]) => Promise<{
    isError: boolean;
    error?: undefined;
} | {
    isError: boolean;
    error: {
        isError: boolean;
        key: string;
        errorKey: any;
    };
}>;
export declare const createGame: (name: string, lobbyType: string, maxPlayers: number) => Promise<{
    isError: boolean;
    key: string;
    errorKey: any;
} | {
    isError: boolean;
    data: any;
}>;
//# sourceMappingURL=index.d.ts.map