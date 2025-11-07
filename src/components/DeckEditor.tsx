import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeckStore, type Card } from '../store/deckStore';

const DeckEditor: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  
  const { currentDeckId, blackCards: storedBlackCards, whiteCards: storedWhiteCards, setCurrentDeck, updateCards, clearCurrentDeck } = useDeckStore();
  
  // Load cards from Zustand if we're editing the same deck (e.g., after refresh)
  const [blackCards, setBlackCards] = useState<Card[]>([]);
  const [whiteCards, setWhiteCards] = useState<Card[]>([]);
  const [cardText, setCardText] = useState('');
  const [selectedType, setSelectedType] = useState<'black' | 'white'>('black');

  const MAX_BLACK_CARDS = 20;
  const MAX_WHITE_CARDS = 100;
  const MAX_CARD_TEXT_LENGTH = 30;

  // Load cards from Zustand store on mount only (for page refresh recovery)
  useEffect(() => {
    // TODO: Load deck from backend when endpoint is ready
    // const loadDeck = async () => {
    //   if (deckId && currentDeckId !== deckId) {
    //     try {
    //       const response = await api.get(`/decks/${deckId}`);
    //       setBlackCards(response.data.blackCards);
    //       setWhiteCards(response.data.whiteCards);
    //       setCurrentDeck(deckId, response.data.blackCards, response.data.whiteCards);
    //     } catch (error) {
    //       toast.error('Nie udało się załadować talii');
    //       console.error('Failed to load deck', error);
    //     }
    //   } else if (deckId && currentDeckId === deckId) {
    //     // Use Zustand cache (refresh recovery)
    //     setBlackCards(storedBlackCards);
    //     setWhiteCards(storedWhiteCards);
    //   }
    // };
    // loadDeck();
    
    // Current mock implementation (remove when backend is connected):
    if (deckId && currentDeckId === deckId) {
      setBlackCards(storedBlackCards);
      setWhiteCards(storedWhiteCards);
    } else if (deckId && currentDeckId !== deckId) {
      // New deck or different deck - initialize with empty cards
      setCurrentDeck(deckId, [], []);
      setBlackCards([]);
      setWhiteCards([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]); // Only run when deckId changes, not when store updates

  // Save to Zustand whenever cards change (auto-save for refresh protection)
  useEffect(() => {
    if (deckId && (blackCards.length > 0 || whiteCards.length > 0)) {
      updateCards(blackCards, whiteCards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blackCards, whiteCards]);

  const handleAddCard = () => {
    if (!cardText.trim()) return;

    // Check if max cards reached (button should be disabled, but double-check)
    if (selectedType === 'black' && blackCards.length >= MAX_BLACK_CARDS) {
      return;
    }

    if (selectedType === 'white' && whiteCards.length >= MAX_WHITE_CARDS) {
      return;
    }

    const newCard: Card = {
      id: `${selectedType}-${Date.now()}`,
      text: cardText,
      type: selectedType
    };

    if (selectedType === 'black') {
      setBlackCards([...blackCards, newCard]);
    } else {
      setWhiteCards([...whiteCards, newCard]);
    }

    setCardText('');
  };

  const handleRemoveCard = (cardId: string, type: 'black' | 'white') => {
    if (type === 'black') {
      setBlackCards(blackCards.filter(card => card.id !== cardId));
    } else {
      setWhiteCards(whiteCards.filter(card => card.id !== cardId));
    }
  };

  const handleSaveDeck = () => {
    if (!deckId) return;
    
    // TODO: Send deck to backend when endpoint is ready
    // const saveDeck = async () => {
    //   try {
    //     await api.put(`/decks/${deckId}`, {
    //       blackCards,
    //       whiteCards
    //     });
    //     
    //     // Clear temporary storage after successful save
    //     clearCurrentDeck();
    //     
    //     toast.success('Talia zapisana pomyślnie');
    //     navigate('/decks');
    //   } catch (error) {
    //     toast.error('Nie udało się zapisać talii');
    //     console.error('Failed to save deck', error);
    //   }
    // };
    // saveDeck();
    
    // Current mock implementation (remove when backend is connected):
    console.log('Saving deck to backend:', { 
      deckId, 
      blackCards, 
      whiteCards 
    });
    
    // Clear temporary storage after successful save
    clearCurrentDeck();
    
    navigate('/decks');
  };

  const handleCancel = () => {
    navigate('/decks');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">
            Edycja Talii
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition"
            >
              Anuluj
            </button>
            <button
              onClick={handleSaveDeck}
              className="px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition"
            >
              Zapisz Talię
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Black Cards */}
          <div className="col-span-3">
            <div className="bg-card border border-border rounded-lg p-4 h-[700px] flex flex-col">
              <h2 className="text-xl font-bold text-card-foreground mb-3 text-center">
                Czarne Karty
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {blackCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-gray-800 text-white p-3 rounded text-sm flex justify-between items-start hover:bg-gray-700 transition"
                  >
                    <span className="flex-1 break-words">{card.text}</span>
                    <button
                      onClick={() => handleRemoveCard(card.id, 'black')}
                      className="ml-2 text-red-400 hover:text-red-300 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm font-bold text-muted-foreground border-t border-border pt-2">
                {blackCards.length}/{MAX_BLACK_CARDS}
              </div>
            </div>
          </div>

          {/* Middle Panel - Card Creator */}
          <div className="col-span-6">
            <div className="bg-card border border-border rounded-lg p-6 h-[700px] flex flex-col">
              {/* Card Type Selector */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setSelectedType('black')}
                  className={`flex-1 py-3 rounded-lg font-bold transition ${
                    selectedType === 'black'
                      ? 'bg-gray-900 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Czarna Karta
                </button>
                <button
                  onClick={() => setSelectedType('white')}
                  className={`flex-1 py-3 rounded-lg font-bold transition ${
                    selectedType === 'white'
                      ? 'bg-white text-gray-900 border-2 border-gray-900'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Biała Karta
                </button>
              </div>

              {/* Text Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-muted-foreground">
                  Tekst Karty ({cardText.length}/{MAX_CARD_TEXT_LENGTH})
                </label>
                <textarea
                  value={cardText}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CARD_TEXT_LENGTH) {
                      setCardText(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-3 border border-border rounded-lg 
                           bg-background text-foreground
                           focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Wprowadź tekst karty (max 30 znaków)..."
                  rows={3}
                  maxLength={MAX_CARD_TEXT_LENGTH}
                />
              </div>

              {/* Add Card Button */}
              <button
                onClick={handleAddCard}
                disabled={
                  !cardText.trim() || 
                  (selectedType === 'black' && blackCards.length >= MAX_BLACK_CARDS) ||
                  (selectedType === 'white' && whiteCards.length >= MAX_WHITE_CARDS)
                }
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold 
                         hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition mb-6"
              >
                {(selectedType === 'black' && blackCards.length >= MAX_BLACK_CARDS) ||
                 (selectedType === 'white' && whiteCards.length >= MAX_WHITE_CARDS)
                  ? 'Pełne'
                  : 'Dodaj Kartę do Talii'}
              </button>

              {/* Card Preview */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-muted-foreground mb-4">
                  Podgląd Karty
                </h3>
                <div
                  className={`w-64 h-80 border-4 rounded-lg flex items-center justify-center p-6 ${
                    selectedType === 'black'
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-gray-900 text-gray-900'
                  }`}
                >
                  {cardText ? (
                    <p className="text-center text-lg font-medium break-words">
                      {cardText}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-center italic">
                      Podgląd pojawi się tutaj
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - White Cards */}
          <div className="col-span-3">
            <div className="bg-card border border-border rounded-lg p-4 h-[700px] flex flex-col">
              <h2 className="text-xl font-bold text-card-foreground mb-3 text-center">
                Białe Karty
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {whiteCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-white border-2 border-gray-900 text-gray-900 p-3 rounded text-sm flex justify-between items-start hover:bg-gray-50 transition"
                  >
                    <span className="flex-1 break-words">{card.text}</span>
                    <button
                      onClick={() => handleRemoveCard(card.id, 'white')}
                      className="ml-2 text-red-500 hover:text-red-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm font-bold text-muted-foreground border-t border-border pt-2">
                {whiteCards.length}/{MAX_WHITE_CARDS}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckEditor;
