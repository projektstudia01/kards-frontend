//Kod do weryfikacji:84720254
//Ponowny kod do weryfikacji: 99999999
//Logowanie: test@g.pl 12345678
import { axiosErrorHandler, customAxios } from "./customAxios";
import { useAuthStore } from "../store/authStore";

//Logowanie: ddd@g.pl 12345678
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
export const login = async (email: string, password: string) => {
  try {
    const data = await customAxios.post("auth/login", { email, password });
    const usernameSet = data.data.data.user.customUsername;
    useAuthStore.getState().setAuthState({
      ...data.data.data.user,
      needsUsernameSetup: usernameSet,
    });

    return {
      isError: false,
      data: data.data.data,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

export const register = async (email: string, password: string) => {
  try {
    const data = await customAxios.post("auth/register", { email, password });
    return data.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const verifyEmail = async (
  code: string,
  email: string,
  sessionId: string
) => {
  try {
    const result = (
      await customAxios.post("auth/verify-email", {
        code,
        email,
        sessionId,
      })
    ).data;
    useAuthStore.getState().setAuthState({
      email: result.data.user.email,
      name: result.data.user.name,
      needsUsernameSetup: result.data.user.customUsername,
      id: result.data.user.id,
    });
    return result.data;
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const resendVerificationCode = async (email: string) => {
  try {
    const data = await customAxios.post("auth/resend-verification-code", {
      email,
    });
    return {
      isError: false,
      data: data.data.data,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

// Deck API functions
export interface Deck {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const getDecks = async () => {
  try {
    const response = await customAxios.get("deck");
    return {
      isError: false,
      data: response.data.data || [],
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

export const createDeck = async (title: string, description: string) => {
  try {
    const response = await customAxios.post("deck/create", {
      title,
      description,
    });
    return {
      isError: false,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

export const deleteDeck = async (deckId: string) => {
  try {
    await customAxios.delete(`deck/${deckId}`);
    return {
      isError: false,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

export const getDeck = async (deckId: string) => {
  try {
    const response = await customAxios.get(`deck/${deckId}`);
    return {
      isError: false,
      data: response.data.data,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

// Card API functions
export interface Card {
  id?: string;
  text: string;
  type: "black" | "white";
  blankSpaceAmount?: number | null;
  createdAt?: string;
  updatedAt?: string;
  deck?: {
    id: string;
  };
}

export const addCards = async (deckId: string, cards: Card[]) => {
  try {
    const response = await customAxios.post(`deck/${deckId}/cards`, {
      cards,
    });
    return {
      isError: false,
      data: response.data.data,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

export const getCards = async (
  deckId: string,
  page: number = 0,
  pageSize: number = 50,
  cardType?: "white" | "black"
) => {
  try {
    const params: any = { page, pageSize };
    if (cardType) {
      params.cardType = cardType;
    }

    const response = await customAxios.get(`deck/${deckId}/cards`, {
      params,
    });
    return {
      isError: false,
      data: response.data.data,
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.pageSize,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

export const deleteCards = async (deckId: string, cardIds: string[]) => {
  try {
    await customAxios.delete(`deck/${deckId}/cards`, {
      data: { cardIds },
    });
    return {
      isError: false,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};

export const createGame = async (
  name: string,
  lobbyType: string,
  maxPlayers: number
) => {
  try {
    const response = await customAxios.post("game/create", {
      name,
      lobbyType,
      maxPlayers,
    });

    return {
      isError: false,
      data: response.data.data,
    };
  } catch (error) {
    return axiosErrorHandler(error);
  }
};

export const getGamesList = async () => {
  try {
    const response = await customAxios.get("game/list");

    return {
      isError: false,
      data: response.data.data.games,
    };
  } catch (error) {
    return {
      isError: true,
      error: axiosErrorHandler(error),
    };
  }
};
