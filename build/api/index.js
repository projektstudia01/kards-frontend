"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGame = exports.deleteCards = exports.getCards = exports.addCards = exports.getDeck = exports.deleteDeck = exports.createDeck = exports.getDecks = exports.resendVerificationCode = exports.verifyEmail = exports.register = exports.login = void 0;
//Kod do weryfikacji:84720254
//Ponowny kod do weryfikacji: 99999999
//Logowanie: test@g.pl 12345678
const customAxios_1 = require("./customAxios");
const authStore_1 = require("../store/authStore");
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield customAxios_1.customAxios.post("/auth/login", { email, password });
        const usernameSet = data.data.data.user.customUsername;
        authStore_1.useAuthStore.getState().setAuthState(Object.assign(Object.assign({}, data.data.data.user), { needsUsernameSetup: usernameSet }));
        return {
            isError: false,
            data: data.data.data,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.login = login;
const register = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield customAxios_1.customAxios.post("/auth/register", { email, password });
        return data.data;
    }
    catch (error) {
        return (0, customAxios_1.axiosErrorHandler)(error);
    }
});
exports.register = register;
const verifyEmail = (code, email, sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = (yield customAxios_1.customAxios.post("/auth/verify-email", {
            code,
            email,
            sessionId,
        })).data;
        authStore_1.useAuthStore.getState().setAuthState({
            email: result.data.user.email,
            name: result.data.user.name,
            needsUsernameSetup: result.data.user.customUsername,
            id: result.data.user.id,
        });
        return result.data;
    }
    catch (error) {
        return (0, customAxios_1.axiosErrorHandler)(error);
    }
});
exports.verifyEmail = verifyEmail;
const resendVerificationCode = (email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield customAxios_1.customAxios.post("/auth/resend-verification-code", {
            email,
        });
        return {
            isError: false,
            data: data.data.data,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.resendVerificationCode = resendVerificationCode;
const getDecks = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield customAxios_1.customAxios.get("/deck");
        return {
            isError: false,
            data: response.data.data || [],
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.getDecks = getDecks;
const createDeck = (title, description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield customAxios_1.customAxios.post("/deck/create", {
            title,
            description,
        });
        return {
            isError: false,
            data: response.data.data,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.createDeck = createDeck;
const deleteDeck = (deckId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield customAxios_1.customAxios.delete(`/deck/${deckId}`);
        return {
            isError: false,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.deleteDeck = deleteDeck;
const getDeck = (deckId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield customAxios_1.customAxios.get(`/deck/${deckId}`);
        return {
            isError: false,
            data: response.data.data,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.getDeck = getDeck;
const addCards = (deckId, cards) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield customAxios_1.customAxios.post(`/deck/${deckId}/cards`, {
            cards,
        });
        return {
            isError: false,
            data: response.data.data,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.addCards = addCards;
const getCards = (deckId_1, ...args_1) => __awaiter(void 0, [deckId_1, ...args_1], void 0, function* (deckId, page = 0, pageSize = 50, cardType) {
    try {
        const params = { page, pageSize };
        if (cardType) {
            params.cardType = cardType;
        }
        const response = yield customAxios_1.customAxios.get(`/deck/${deckId}/cards`, {
            params,
        });
        return {
            isError: false,
            data: response.data.data,
            total: response.data.total,
            page: response.data.page,
            pageSize: response.data.pageSize,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.getCards = getCards;
const deleteCards = (deckId, cardIds) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield customAxios_1.customAxios.delete(`/deck/${deckId}/cards`, {
            data: { cardIds },
        });
        return {
            isError: false,
        };
    }
    catch (error) {
        return {
            isError: true,
            error: (0, customAxios_1.axiosErrorHandler)(error),
        };
    }
});
exports.deleteCards = deleteCards;
const createGame = (name, lobbyType, maxPlayers) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield customAxios_1.customAxios.post("/game/create", {
            name, lobbyType, maxPlayers
        });
        return {
            isError: false,
            data: response.data.data,
        };
    }
    catch (error) {
        return (0, customAxios_1.axiosErrorHandler)(error);
    }
});
exports.createGame = createGame;
