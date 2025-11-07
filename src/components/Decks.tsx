import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/deckStore';
import { toast } from 'sonner';

interface Deck {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
}

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-96 max-w-md border border-border">
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
              className="px-4 py-2 bg-muted text-muted-foreground 
                       rounded-md hover:bg-muted/80 transition"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
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
  
  const { setCurrentDeck } = useDeckStore();
  
  // Use regular useState for deck list - will be fetched from backend later
  const [userDecks, setUserDecks] = useState<Deck[]>([]);
  
  // TODO: Fetch decks from backend on mount
  // useEffect(() => {
  //   const fetchDecks = async () => {
  //     try {
  //       const response = await api.get('/decks');
  //       setUserDecks(response.data.decks.filter(d => !d.isDefault));
  //     } catch (error) {
  //       toast.error('Nie udało się załadować talii');
  //       console.error('Failed to fetch decks', error);
  //     }
  //   };
  //   fetchDecks();
  // }, []);
  
  // Default deck (cannot be modified)
  const defaultDeck: Deck = {
    id: 'default',
    name: 'domyślna',
    description: 'Domyślna talia z podstawowymi kartami',
    isDefault: true
  };

  const handleCreateDeck = (name: string, description: string) => {
    // TODO: Replace with API call
    // const response = await api.post('/decks', { name, description });
    // const newDeck: Deck = {
    //   id: response.data.deckId,
    //   name,
    //   description,
    //   isDefault: false
    // };
    
    // Mock implementation (remove when backend is connected):
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      description,
      isDefault: false
    };
    setUserDecks([...userDecks, newDeck]);
    
    // Initialize empty deck in Zustand store for editing
    setCurrentDeck(newDeck.id, [], []);
    
    // Navigate to deck creation/editing page
    navigate(`/deck/${newDeck.id}/edit`);
  };

  const handleAddDeckClick = () => {
    if (userDecks.length < 3) {
      setIsModalOpen(true);
    }
    else{
      toast.error("Tutaj blad maksymalna ilosc deckow")
    }
  };

  const handleDeckClick = (deck: Deck) => {
    if (deck.isDefault) {
      // View only for default deck
      navigate(`/deck/${deck.id}`);
    } else {
      // Edit for user decks
      navigate(`/deck/${deck.id}/edit`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-foreground">
          TALIE
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Default Deck */}
          <div
            onClick={() => handleDeckClick(defaultDeck)}
            className="bg-card border border-border 
                     rounded-lg p-8 flex flex-col items-center justify-center h-64 
                     cursor-pointer hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              {defaultDeck.name}
            </h2>
            <p className="text-muted-foreground text-center text-sm">
              {defaultDeck.description}
            </p>
          </div>

          {/* User Deck #1 */}
          {userDecks[0] ? (
            <div
              onClick={() => handleDeckClick(userDecks[0])}
              className="bg-card border border-border 
                       rounded-lg p-8 flex flex-col items-center justify-center h-64 
                       cursor-pointer hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                {userDecks[0].name}
              </h2>
              <p className="text-muted-foreground text-center text-sm">
                {userDecks[0].description}
              </p>
            </div>
          ) : (
            <div
              onClick={handleAddDeckClick}
              className="bg-card border border-border 
                       rounded-lg p-8 flex flex-col items-center justify-center h-64 
                       cursor-pointer hover:shadow-xl transition-shadow hover:bg-accent"
            >
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                user #1
              </h2>
              <button className="text-primary font-semibold text-lg hover:underline">
                dodaj talię
              </button>
            </div>
          )}

          {/* User Deck #2 */}
          {userDecks[1] ? (
            <div
              onClick={() => handleDeckClick(userDecks[1])}
              className="bg-card border border-border 
                       rounded-lg p-8 flex flex-col items-center justify-center h-64 
                       cursor-pointer hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                {userDecks[1].name}
              </h2>
              <p className="text-muted-foreground text-center text-sm">
                {userDecks[1].description}
              </p>
            </div>
          ) : userDecks.length < 2 ? (
            <div
              onClick={handleAddDeckClick}
              className="bg-card border border-border 
                       rounded-lg p-8 flex flex-col items-center justify-center h-64 
                       cursor-pointer hover:shadow-xl transition-shadow hover:bg-accent"
            >
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                user #2
              </h2>
              <button className="text-primary font-semibold text-lg hover:underline">
                dodaj talię
              </button>
            </div>
          ) : null}
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
