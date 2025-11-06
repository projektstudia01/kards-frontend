import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Card {
  id: string;
  text: string;
  type: 'black' | 'white';
}

interface DeckEditorState {
  // Temporary storage for deck being edited (persists across page refreshes)
  currentDeckId: string | null;
  blackCards: Card[];
  whiteCards: Card[];
  
  setCurrentDeck: (deckId: string, blackCards: Card[], whiteCards: Card[]) => void;
  updateCards: (blackCards: Card[], whiteCards: Card[]) => void;
  clearCurrentDeck: () => void;
}

export const useDeckStore = create<DeckEditorState>()(
  persist(
    (set) => ({
      currentDeckId: null,
      blackCards: [],
      whiteCards: [],
      
      setCurrentDeck: (deckId, blackCards, whiteCards) => 
        set({ currentDeckId: deckId, blackCards, whiteCards }),
      
      updateCards: (blackCards, whiteCards) => 
        set({ blackCards, whiteCards }),
      
      clearCurrentDeck: () => 
        set({ currentDeckId: null, blackCards: [], whiteCards: [] }),
    }),
    {
      name: 'deck-editor-storage', // localStorage key
    }
  )
);
