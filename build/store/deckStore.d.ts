export interface Card {
    id: string;
    text: string;
    type: 'black' | 'white';
}
interface DeckEditorState {
    currentDeckId: string | null;
    blackCards: Card[];
    whiteCards: Card[];
    setCurrentDeck: (deckId: string, blackCards: Card[], whiteCards: Card[]) => void;
    updateCards: (blackCards: Card[], whiteCards: Card[]) => void;
    clearCurrentDeck: () => void;
}
export declare const useDeckStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<DeckEditorState>, "setState" | "persist"> & {
    setState(partial: DeckEditorState | Partial<DeckEditorState> | ((state: DeckEditorState) => DeckEditorState | Partial<DeckEditorState>), replace?: false): unknown;
    setState(state: DeckEditorState | ((state: DeckEditorState) => DeckEditorState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<DeckEditorState, DeckEditorState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: DeckEditorState) => void) => () => void;
        onFinishHydration: (fn: (state: DeckEditorState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<DeckEditorState, DeckEditorState, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=deckStore.d.ts.map