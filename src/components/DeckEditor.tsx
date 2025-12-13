import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getDeck, getCards, addCards, deleteCards, type Card } from '../api';

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
  const [deletedCardIds, setDeletedCardIds] = useState<string[]>([]); // Track deleted card IDs
  
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
    
    if (unsavedBlack.length > 0 || unsavedWhite.length > 0 || deletedCardIds.length > 0) {
      const storageKey = `deck-editor-${deckId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        unsavedBlack,
        unsavedWhite,
        timestamp: Date.now()
      }));
      setHasUnsavedChanges(true);
    } else {
      // Clear localStorage if no unsaved cards and no deleted cards
      const storageKey = `deck-editor-${deckId}`;
      localStorage.removeItem(storageKey);
      setHasUnsavedChanges(false);
    }
  }, [blackCards, whiteCards, deletedCardIds, deckId, isLoading]);

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

  const handleRemoveCard = (cardId: string | undefined, cardIndex: number, type: 'black' | 'white') => {
    if (type === 'black') {
      // If card has no ID (unsaved), remove by index, otherwise by ID
      if (!cardId) {
        setBlackCards(blackCards.filter((_, index) => index !== cardIndex));
      } else {
        // Track deleted card ID for API call
        setDeletedCardIds([...deletedCardIds, cardId]);
        setBlackCards(blackCards.filter(card => card.id !== cardId));
      }
      setBlackTotal(Math.max(0, blackTotal - 1));
    } else {
      // If card has no ID (unsaved), remove by index, otherwise by ID
      if (!cardId) {
        setWhiteCards(whiteCards.filter((_, index) => index !== cardIndex));
      } else {
        // Track deleted card ID for API call
        setDeletedCardIds([...deletedCardIds, cardId]);
        setWhiteCards(whiteCards.filter(card => card.id !== cardId));
      }
      setWhiteTotal(Math.max(0, whiteTotal - 1));
    }
  };

  const handleSaveDeck = async () => {
    if (!deckId) return;
    
    setIsSaving(true);
    
    // Handle deleted cards first
    if (deletedCardIds.length > 0) {
      const deleteResponse = await deleteCards(deckId, deletedCardIds);
      
      if (deleteResponse.isError) {
        toast.error('Nie udało się usunąć kart');
        setIsSaving(false);
        return;
      }
      
      // Clear deleted IDs after successful deletion
      setDeletedCardIds([]);
    }
    
    // Prepare cards for bulk upload (only new cards without IDs)
    const newCards = [...blackCards, ...whiteCards].filter(card => !card.id);
    
    if (newCards.length > 0) {
      const response = await addCards(deckId, newCards);
      
      if (response.isError) {
        toast.error('Nie udało się zapisać kart');
        setIsSaving(false);
        return;
      }
    }
    
    // Clear localStorage after successful save
    const storageKey = `deck-editor-${deckId}`;
    localStorage.removeItem(storageKey);
    setHasUnsavedChanges(false);
    
    toast.success('Talia zapisana pomyślnie');
    setIsSaving(false);
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Edycja Talii
            </h1>
            {hasUnsavedChanges && (
              <p className="text-sm text-amber-500 mt-1">
                Masz niezapisane zmiany
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-accent border border-border text-card-foreground rounded-lg hover:bg-accent/60 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Anuluj
            </button>
            <button
              onClick={handleSaveDeck}
              disabled={isSaving || !hasUnsavedChanges}
              className="px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/80 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
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
              <div className="flex-1 overflow-y-auto space-y-2 mb-3 hover:scale-[1.01] transition-all duration-300">
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
                        className="bg-gray-800 text-white p-3 pr-2 rounded text-sm flex justify-between items-start hover:bg-gray-700 transition-all duration-200 group"
                      >
                        <span className="flex-1 break-words mr-3">{card.text}</span>
                        <button
                          onClick={() => handleRemoveCard(card.id, index, 'black')}
                          className="ml-2 text-red-400 hover:text-red-300 hover:scale-110 font-bold cursor-pointer transition-all duration-200 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {hasMoreBlack && (
                      <button
                        onClick={loadMoreBlackCards}
                        disabled={loadingMoreBlack}
                        className="w-full py-2 text-sm bg-muted hover:bg-muted/60 hover:scale-105 rounded text-muted-foreground disabled:opacity-50 cursor-pointer transition-all duration-200"
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
            <div className="bg-card border border-border rounded-lg p-6 h-[700px] flex flex-col shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              {/* Card Type Selector */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setSelectedType('black')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${
                    selectedType === 'black'
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-gray-300 dark:bg-muted text-gray-700 dark:text-muted-foreground hover:bg-gray-400 dark:hover:bg-muted/80'
                  }`}
                >
                  Czarna Karta
                </button>
                <button
                  onClick={() => setSelectedType('white')}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 cursor-pointer hover:scale-105 ${
                    selectedType === 'white'
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-gray-300 dark:bg-muted text-gray-700 dark:text-muted-foreground hover:bg-gray-400 dark:hover:bg-muted/80'
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
                         hover:bg-primary/80 hover:scale-105 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed cursor-pointer transition-all duration-200 mb-6"
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
                  className={`w-64 h-80 border-4 rounded-lg flex flex-col items-center justify-center p-6 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer ${
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
                    <p className="text-center italic" style={{ color: selectedType === 'black' ? 'white' : '#111827' }}>
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
            <div className="bg-card border border-border rounded-lg p-4 h-[700px] flex flex-col shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
              <h2 className="text-xl font-bold text-card-foreground mb-3 text-center">
                Białe Karty
              </h2>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3 hover:scale-[1.01] transition-all duration-300">
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
                        className="bg-white border-2 border-gray-900 text-gray-900 p-3 pr-2 rounded text-sm flex justify-between items-start hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <span className="flex-1 break-words mr-3">{card.text}</span>
                        <button
                          onClick={() => handleRemoveCard(card.id, index, 'white')}
                          className="ml-2 text-red-500 hover:text-red-600 hover:scale-110 font-bold cursor-pointer transition-all duration-200 flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {hasMoreWhite && (
                      <button
                        onClick={loadMoreWhiteCards}
                        disabled={loadingMoreWhite}
                        className="w-full py-2 text-sm bg-muted hover:bg-muted/60 hover:scale-105 rounded text-muted-foreground disabled:opacity-50 cursor-pointer transition-all duration-200"
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
