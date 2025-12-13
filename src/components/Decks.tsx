import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getDecks, createDeck, deleteDeck, type Deck } from '../api';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
}

const CreateDeckModal: React.FC<CreateDeckModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deckName.trim()) {
      onSubmit(deckName, deckDescription);
      setDeckName('');
      setDeckDescription('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-96 max-w-md border border-border shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
        <h2 className="text-2xl font-bold mb-4 text-card-foreground">
          Utwórz Nową Talię
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Nazwa Talii
            </label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
                       bg-background text-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Wprowadź nazwę talii..."
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Opis
            </label>
            <textarea
              value={deckDescription}
              onChange={(e) => setDeckDescription(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md 
                       bg-background text-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Wprowadź opis talii..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-accent border border-border text-card-foreground 
                       rounded-md hover:bg-accent/60 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              Utwórz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Decks: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDecks, setUserDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MAX_DECKS = 3;

  // Fetch user decks on mount
  useEffect(() => {
    const fetchDecks = async () => {
      setIsLoading(true);
      const response = await getDecks();
      
      if (!response.isError) {
        setUserDecks(response.data);
      }
      setIsLoading(false);
    };
    
    fetchDecks();
  }, []);

  const handleCreateDeck = async (title: string, description: string) => {
    const response = await createDeck(title, description);
    
    if (!response.isError) {
      const newDeck = response.data;
      setUserDecks([...userDecks, newDeck]);
      
      // Navigate to deck editor to add cards
      navigate(`/deck/${newDeck.id}/edit`);
    }
  };

  const handleAddDeckClick = () => {
    if (userDecks.length < MAX_DECKS) {
      setIsModalOpen(true);
    } else {
      toast.error('Maksymalna liczba talii to 3');
    }
  };

  const handleDeckClick = (deck: Deck) => {
    navigate(`/deck/${deck.id}/edit`);
  };

  const handleDeleteDeck = async (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation(); // Prevent deck click event
    
    if (!confirm('Czy na pewno chcesz usunąć tę talię?')) {
      return;
    }

    const response = await deleteDeck(deckId);
    
    if (!response.isError) {
      setUserDecks(userDecks.filter(d => d.id !== deckId));
      toast.success('Talia została usunięta');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Ładowanie talii...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/welcome')}
          className="mb-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/80 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span>←</span> Powrót
        </button>
        
        <h1 className="text-4xl font-bold text-center mb-12 text-foreground">
          TALIE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Deck Slots (0-2) */}
          {[0, 1, 2].map((index) => {
            const deck = userDecks[index];
            
            if (deck) {
              // Existing deck
              return (
                <div
                  key={deck.id}
                  className="bg-card border border-border 
                           rounded-lg p-8 flex flex-col items-center justify-center h-64 
                           cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-200 relative group"
                  onClick={() => handleDeckClick(deck)}
                >
                  <h2 className="text-2xl font-bold text-card-foreground mb-4">
                    {deck.title}
                  </h2>
                  <p className="text-muted-foreground text-center text-sm">
                    {deck.description || 'Brak opisu'}
                  </p>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteDeck(e, deck.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 
                             transition-all duration-200 p-2 bg-destructive text-destructive-foreground 
                             rounded-full hover:bg-destructive/90 hover:scale-110 cursor-pointer"
                    title="Usuń talię"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            } else {
              // Empty slot
              return (
                <div
                  key={`empty-${index}`}
                  onClick={handleAddDeckClick}
                  className="bg-card border-2 border-dashed border-border 
                           rounded-lg p-8 flex flex-col items-center justify-center h-64 
                           cursor-pointer hover:shadow-xl hover:border-primary hover:scale-105 transition-all duration-200 hover:bg-accent group"
                >
                  <div className="text-6xl mb-4 text-muted-foreground transition-transform duration-200 group-hover:scale-110">+</div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-2">
                    Talia #{index + 1}
                  </h2>
                  <button className="text-primary font-semibold text-lg hover:underline transition-transform duration-200 group-hover:scale-110">
                    Dodaj talię
                  </button>
                </div>
              );
            }
          })}
        </div>
      </div>

      <CreateDeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeck}
      />
    </div>
  );
};

export default Decks;
