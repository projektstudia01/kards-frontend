import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getDeck, getCards, addCards, type Card } from '../api';

const DeckEditor: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  
  const [blackCards, setBlackCards] = useState<Card[]>([]);
  const [whiteCards, setWhiteCards] = useState<Card[]>([]);
  const [cardText, setCardText] = useState('');
  const [selectedType, setSelectedType] = useState<'black' | 'white'>('black');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Pagination state
  const [blackPage, setBlackPage] = useState(0);
  const [whitePage, setWhitePage] = useState(0);
  const [blackTotal, setBlackTotal] = useState(0);
  const [whiteTotal, setWhiteTotal] = useState(0);
  const [hasMoreBlack, setHasMoreBlack] = useState(false);
  const [hasMoreWhite, setHasMoreWhite] = useState(false);
  const [loadingMoreBlack, setLoadingMoreBlack] = useState(false);
  const [loadingMoreWhite, setLoadingMoreWhite] = useState(false);

  const PAGE_SIZE = 20;
  const MAX_BLACK_CARDS = 20;
  const MAX_WHITE_CARDS = 100;
  const MAX_CARD_TEXT_LENGTH = 30;

  // Load initial cards from backend
  useEffect(() => {
    let isCancelled = false;
    
    const loadInitialCards = async () => {
      if (!deckId) return;
      
      setIsLoading(true);
      
      // Check for unsaved changes in localStorage
      const storageKey = `deck-editor-${deckId}`;
      const savedData = localStorage.getItem(storageKey);
      
      // Load deck info
      const deckResponse = await getDeck(deckId);
      if (isCancelled) return;
      
      if (deckResponse.isError) {
        toast.error('Nie udało się załadować talii');
        navigate('/deck');
        return;
      }
      
      // Load black cards (first page)
      const blackResponse = await getCards(deckId, 0, PAGE_SIZE, 'black');
      if (isCancelled) return;
      
      if (!blackResponse.isError) {
        setBlackCards(blackResponse.data);
        setBlackTotal(blackResponse.total);
        setHasMoreBlack(blackResponse.data.length < blackResponse.total);
      }
      
      // Load white cards (first page)
      const whiteResponse = await getCards(deckId, 0, PAGE_SIZE, 'white');
      if (isCancelled) return;
      
      if (!whiteResponse.isError) {
        setWhiteCards(whiteResponse.data);
        setWhiteTotal(whiteResponse.total);
        setHasMoreWhite(whiteResponse.data.length < whiteResponse.total);
      }
      
      // Restore unsaved cards from localStorage if exists
      if (savedData) {
        try {
          const { unsavedBlack, unsavedWhite, timestamp } = JSON.parse(savedData);
          
          // Only restore if less than 1 hour old
          const oneHour = 60 * 60 * 1000;
          if (Date.now() - timestamp < oneHour) {
            if (unsavedBlack.length > 0 || unsavedWhite.length > 0) {
              toast.info(`Przywrócono ${unsavedBlack.length + unsavedWhite.length} niezapisanych kart`);
              
              // Prepend unsaved cards
              setBlackCards(prev => [...unsavedBlack, ...prev]);
              setBlackTotal(prev => prev + unsavedBlack.length);
              
              setWhiteCards(prev => [...unsavedWhite, ...prev]);
              setWhiteTotal(prev => prev + unsavedWhite.length);
              
              setHasUnsavedChanges(true);
            }
          } else {
            // Clear old data
            localStorage.removeItem(storageKey);
          }
        } catch (e) {
          console.error('Failed to restore unsaved cards:', e);
        }
      }
      
      if (!isCancelled) {
        setIsLoading(false);
      }
    };
    
    loadInitialCards();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [deckId, navigate]);

  // Save unsaved cards to localStorage
  useEffect(() => {
    if (!deckId || isLoading) return;
    
    // Get only unsaved cards (those without IDs)
    const unsavedBlack = blackCards.filter(card => !card.id);
    const unsavedWhite = whiteCards.filter(card => !card.id);
    
    if (unsavedBlack.length > 0 || unsavedWhite.length > 0) {
      const storageKey = `deck-editor-${deckId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        unsavedBlack,
        unsavedWhite,
        timestamp: Date.now()
      }));
      setHasUnsavedChanges(true);
    } else {
      // Clear localStorage if no unsaved cards
      const storageKey = `deck-editor-${deckId}`;
      localStorage.removeItem(storageKey);
      setHasUnsavedChanges(false);
    }
  }, [blackCards, whiteCards, deckId, isLoading]);

  // Load more black cards
  const loadMoreBlackCards = async () => {
    if (!deckId || loadingMoreBlack || !hasMoreBlack) return;
    
    setLoadingMoreBlack(true);
    const nextPage = blackPage + 1;
    const response = await getCards(deckId, nextPage, PAGE_SIZE, 'black');
    
    if (!response.isError) {
      setBlackCards([...blackCards, ...response.data]);
      setBlackPage(nextPage);
      setHasMoreBlack(blackCards.length + response.data.length < response.total);
    }
    
    setLoadingMoreBlack(false);
  };

  // Load more white cards
  const loadMoreWhiteCards = async () => {
    if (!deckId || loadingMoreWhite || !hasMoreWhite) return;
    
    setLoadingMoreWhite(true);
    const nextPage = whitePage + 1;
    const response = await getCards(deckId, nextPage, PAGE_SIZE, 'white');
    
    if (!response.isError) {
      setWhiteCards([...whiteCards, ...response.data]);
      setWhitePage(nextPage);
      setHasMoreWhite(whiteCards.length + response.data.length < response.total);
    }
    
    setLoadingMoreWhite(false);
  };

  const handleAddCard = () => {
    if (!cardText.trim()) return;

    // Check if max cards reached (button should be disabled, but double-check)
    if (selectedType === 'black' && blackTotal >= MAX_BLACK_CARDS) {
      return;
    }

    if (selectedType === 'white' && whiteTotal >= MAX_WHITE_CARDS) {
      return;
    }

    // Count blank spaces (___) in black cards
    let blankSpaceAmount = null;
    if (selectedType === 'black') {
      const blanks = (cardText.match(/___/g) || []).length;
      if (blanks > 3) {
        toast.error('Maksymalnie 3 puste miejsca na kartę (___) ');
        return;
      }
      if (blanks === 0) {
        toast.error('Czarna karta musi mieć co najmniej jedno puste miejsce (___)');
        return;
      }
      blankSpaceAmount = blanks;
    }

    const newCard: Card = {
      text: cardText,
      type: selectedType,
      blankSpaceAmount,
    };

    if (selectedType === 'black') {
      setBlackCards([newCard, ...blackCards]);
      setBlackTotal(blackTotal + 1);
    } else {
      setWhiteCards([newCard, ...whiteCards]);
      setWhiteTotal(whiteTotal + 1);
    }

    setCardText('');
  };

  const handleRemoveCard = (cardId: string | undefined, type: 'black' | 'white') => {
    if (!cardId) return;
    
    if (type === 'black') {
      setBlackCards(blackCards.filter(card => card.id !== cardId));
      setBlackTotal(Math.max(0, blackTotal - 1));
    } else {
      setWhiteCards(whiteCards.filter(card => card.id !== cardId));
      setWhiteTotal(Math.max(0, whiteTotal - 1));
    }
  };

  const handleSaveDeck = async () => {
    if (!deckId) return;
    
    setIsSaving(true);
    
    // Prepare cards for bulk upload (only new cards without IDs)
    const newCards = [...blackCards, ...whiteCards].filter(card => !card.id);
    
    if (newCards.length > 0) {
      const response = await addCards(deckId, newCards);
      
      if (response.isError) {
        toast.error('Nie udało się zapisać kart');
        setIsSaving(false);
        return;
      }
      
      // Clear localStorage after successful save
      const storageKey = `deck-editor-${deckId}`;
      localStorage.removeItem(storageKey);
      setHasUnsavedChanges(false);
    }
    
    // Also handle deleted cards if we're tracking them
    // (Currently we're just filtering them from the UI, not tracking deletes)
    
    toast.success('Talia zapisana pomyślnie');
    setIsSaving(false);
    navigate('/deck');
  };

  const handleCancel = () => {
    navigate('/decks');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edycja Talii
            </h1>
            {hasUnsavedChanges && (
              <p className="text-sm text-amber-500 mt-1">
                ⚠️ Masz niezapisane zmiany
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition"
            >
              Anuluj
            </button>
            <button
              onClick={handleSaveDeck}
              disabled={isSaving || !hasUnsavedChanges}
              className="px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSaving ? 'Zapisywanie...' : hasUnsavedChanges ? 'Zapisz Talię' : 'Zapisano'}
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
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-4">
                    Ładowanie...
                  </div>
                ) : blackCards.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    Brak kart
                  </div>
                ) : (
                  <>
                    {blackCards.map((card, index) => (
                      <div
                        key={card.id || `black-${index}`}
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
                    {hasMoreBlack && (
                      <button
                        onClick={loadMoreBlackCards}
                        disabled={loadingMoreBlack}
                        className="w-full py-2 text-sm bg-muted hover:bg-muted/80 rounded text-muted-foreground disabled:opacity-50"
                      >
                        {loadingMoreBlack ? 'Ładowanie...' : 'Załaduj więcej'}
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="text-center text-sm font-bold text-muted-foreground border-t border-border pt-2">
                {blackTotal}/{MAX_BLACK_CARDS}
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
                  {selectedType === 'black' && (
                    <span className="ml-2 text-xs opacity-70">
                      (użyj ___ dla pustych miejsc, max 3)
                    </span>
                  )}
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
                  placeholder={
                    selectedType === 'black'
                      ? 'np. To jest ___ przykład z ___ pustymi miejscami'
                      : 'Wprowadź tekst białej karty...'
                  }
                  rows={4}
                  maxLength={MAX_CARD_TEXT_LENGTH}
                />
              </div>

              {/* Add Card Button */}
              <button
                onClick={handleAddCard}
                disabled={
                  !cardText.trim() || 
                  (selectedType === 'black' && blackTotal >= MAX_BLACK_CARDS) ||
                  (selectedType === 'white' && whiteTotal >= MAX_WHITE_CARDS)
                }
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold 
                         hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition mb-6"
              >
                {(selectedType === 'black' && blackTotal >= MAX_BLACK_CARDS) ||
                 (selectedType === 'white' && whiteTotal >= MAX_WHITE_CARDS)
                  ? 'Pełne'
                  : 'Dodaj Kartę do Talii'}
              </button>

              {/* Card Preview */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-muted-foreground mb-4">
                  Podgląd Karty
                </h3>
                <div
                  className={`w-64 h-80 border-4 rounded-lg flex flex-col items-center justify-center p-6 ${
                    selectedType === 'black'
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : 'bg-white border-gray-900 text-gray-900'
                  }`}
                >
                  {cardText ? (
                    <>
                      <p className="text-center text-lg font-medium break-words">
                        {cardText}
                      </p>
                      {selectedType === 'black' && (
                        <div className="mt-4 text-sm opacity-70">
                          Puste miejsca: {(cardText.match(/___/g) || []).length}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center italic">
                      {selectedType === 'black' 
                        ? 'Użyj ___ aby oznaczyć puste miejsce' 
                        : 'Podgląd pojawi się tutaj'}
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
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-4">
                    Ładowanie...
                  </div>
                ) : whiteCards.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    Brak kart
                  </div>
                ) : (
                  <>
                    {whiteCards.map((card, index) => (
                      <div
                        key={card.id || `white-${index}`}
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
                    {hasMoreWhite && (
                      <button
                        onClick={loadMoreWhiteCards}
                        disabled={loadingMoreWhite}
                        className="w-full py-2 text-sm bg-muted hover:bg-muted/80 rounded text-muted-foreground disabled:opacity-50"
                      >
                        {loadingMoreWhite ? 'Ładowanie...' : 'Załaduj więcej'}
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="text-center text-sm font-bold text-muted-foreground border-t border-border pt-2">
                {whiteTotal}/{MAX_WHITE_CARDS}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckEditor;
