"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDeckStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useDeckStore = (0, zustand_1.create)()((0, middleware_1.persist)((set) => ({
    currentDeckId: null,
    blackCards: [],
    whiteCards: [],
    setCurrentDeck: (deckId, blackCards, whiteCards) => set({ currentDeckId: deckId, blackCards, whiteCards }),
    updateCards: (blackCards, whiteCards) => set({ blackCards, whiteCards }),
    clearCurrentDeck: () => set({ currentDeckId: null, blackCards: [], whiteCards: [] }),
}), {
    name: 'deck-editor-storage', // localStorage key
}));
