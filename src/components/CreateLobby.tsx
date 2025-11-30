import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { createGame } from '../api/index';

interface FormData {
  name: string;
  maxPlayers: number;
}

const CreateLobby: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    maxPlayers: 6
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t('lobby.errors.name_required'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await createGame(formData.name, 'public', formData.maxPlayers);
      
      if (!response.isError) {
        const gameData = (response as any).data;
        
        // Backend returns: response.data.data with structure { game: { id: "..." } }
        const gameId = gameData?.game?.id || gameData?.id || gameData?.gameId;
        
        if (!gameId || typeof gameId !== 'string') {
          console.error('Invalid gameId from backend:', gameData);
          toast.error('Błąd: nie można odczytać ID gry z odpowiedzi backendu');
          return;
        }
        
        navigate(`/lobby/${gameId}`);
      } else {
        const errorResponse = response as any;
        
        // Handle specific error - user already in game
        if (errorResponse.key === 'backendErrors.user_already_in_game') {
          toast.error(t('backendErrors.user_already_in_game') + ' - Musisz najpierw opuścić poprzednią grę.');
        } else if (errorResponse.key) {
          toast.error(t(errorResponse.key));
        } else {
          toast.error(t('lobby.errors.create_failed'));
        }
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error(t('lobby.errors.create_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Stwórz nową grę</h1>
          <p className="text-muted-foreground">Nadaj nazwę i ustal liczbę graczy. Talie wybierzesz w lobby.</p>
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

          {/* Max Players */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Maksymalna liczba graczy: {formData.maxPlayers}
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={formData.maxPlayers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>2</span>
              <span>8</span>
            </div>
          </div>

          {/* Info */}
          <div className="mb-8 p-4 bg-accent rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              💡 Po utworzeniu lobby będziesz mógł wybrać talie kart i poczekać na graczy przed rozpoczęciem gry.
            </p>
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
              disabled={isLoading || !formData.name.trim()}
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