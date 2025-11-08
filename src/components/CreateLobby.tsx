import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobbyAPI } from '../hooks/useLobbyAPI';
import type { CreateLobbyRequest } from '../types/lobby';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const CreateLobby: React.FC = () => {
  const navigate = useNavigate();
  const { createLobby } = useLobbyAPI();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<CreateLobbyRequest>({
    name: '',
    type: 'public',
    maxPlayers: 6,
    selectedDecks: []
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Przykładowe talie - w przyszłości pobrane z API
  const availableDecks = [
    { id: 'basic', name: 'Podstawowa talia', description: 'Standardowe karty dla wszystkich' },
    { id: 'adult', name: 'Dla dorosłych', description: 'Humor dla dorosłych' },
    { id: 'clean', name: 'Czysta wersja', description: 'Bezpieczne dla rodziny' },
    { id: 'polish', name: 'Polskie referencje', description: 'Karty z polskimi odwołaniami' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t('lobby.errors.name_required'));
      return;
    }
    if (formData.selectedDecks.length === 0) {
      toast.error(t('lobby.errors.decks_required'));
      return;
    }

    setIsLoading(true);
    try {
      const lobby = await createLobby(formData);
      console.log('Created lobby:', lobby);
      navigate(`/lobby/${lobby.id}`);
    } catch (error) {
      console.error('Error creating lobby:', error);
      toast.error(t('lobby.errors.create_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDeck = (deckId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDecks: prev.selectedDecks.includes(deckId)
        ? prev.selectedDecks.filter(id => id !== deckId)
        : [...prev.selectedDecks, deckId]
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Stwórz nową grę</h1>
          <p className="text-muted-foreground">Ustaw parametry swojego lobby</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-lg p-8 border border-border">
          {/* Lobby Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Nazwa lobby
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="np. Wieczorna rozgrywka"
              maxLength={50}
            />
          </div>

          {/* Lobby Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Typ lobby
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'public' }))}
                className={`p-4 border rounded-lg transition-colors ${
                  formData.type === 'public'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-accent'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🌍</div>
                  <div className="font-medium">Publiczne</div>
                  <div className="text-sm opacity-70">Widoczne dla wszystkich</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'private' }))}
                className={`p-4 border rounded-lg transition-colors ${
                  formData.type === 'private'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-accent'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-medium">Prywatne</div>
                  <div className="text-sm opacity-70">Tylko z zaproszeniem</div>
                </div>
              </button>
            </div>
          </div>

          {/* Max Players */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Maksymalna liczba graczy: {formData.maxPlayers}
            </label>
            <input
              type="range"
              min="3"
              max="8"
              value={formData.maxPlayers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>3</span>
              <span>8</span>
            </div>
          </div>

          {/* Deck Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-card-foreground mb-4">
              Wybierz talie kart
            </label>
            <div className="grid grid-cols-1 gap-3">
              {availableDecks.map(deck => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => toggleDeck(deck.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    formData.selectedDecks.includes(deck.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{deck.name}</div>
                      <div className="text-sm opacity-70">{deck.description}</div>
                    </div>
                    <div className="text-xl">
                      {formData.selectedDecks.includes(deck.id) ? '✅' : '⬜'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/welcome')}
              className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || formData.selectedDecks.length === 0}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Tworzenie...' : 'Stwórz lobby'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLobby;