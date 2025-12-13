import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const JoinLobby: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const [gameId, setGameId] = useState("");

  // Sprawdź czy jest gameId w URL
  useEffect(() => {
    const gameIdFromUrl = searchParams.get("gameId");
    if (gameIdFromUrl) {
      setGameId(gameIdFromUrl);
    }
  }, [searchParams]);

  const handleJoin = () => {
    if (!gameId.trim()) {
      toast.error(t("lobby.errors.game_id_required"));
      return;
    }

    // Po prostu przekieruj do lobby - WebSocket połączy się automatycznie
    navigate(`/lobby/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Dołącz do gry
          </h1>
          <p className="text-muted-foreground">
            Wprowadź kod gry aby dołączyć
          </p>
        </div>

        {/* Join Form */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
          <div className="mb-6">
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Kod gry (Game ID)
            </label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
              placeholder="np. abc123..."
            />
            <p className="text-sm text-muted-foreground mt-2">
              Poproś właściciela gry o kod lub użyj linku zaproszenia
            </p>
          </div>

          <button
            onClick={handleJoin}
            disabled={!gameId.trim()}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/80 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            Dołącz do gry
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/welcome")}
              className="text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              ← Powrót do menu głównego
            </button>
          </div>

          <div className="mt-8 p-4 bg-accent rounded-lg border border-border hover:scale-[1.02] transition-all duration-200">
            <h3 className="text-sm font-medium text-card-foreground mb-2">
              Jak dołączyć?
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Poproś właściciela gry o kod</li>
              <li>• Możesz też utworzyć własną grę</li>
              <li>• Wszystkie gry są publiczne - wystarczy kod</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/create-lobby")}
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 hover:scale-105 transition-all duration-200 cursor-pointer shadow-md"
            >
              + Lub stwórz nową grę
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinLobby;
