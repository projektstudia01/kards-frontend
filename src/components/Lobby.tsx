import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useErrorStore } from "../store/errorStore";
import { useLobbyAPI } from "../hooks/useLobbyAPI";
import QRCodeGenerator from "./QRCodeGenerator";
import type { LobbySettings, Player, Invitation } from "../types/lobby";

const Lobby: React.FC = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  //Podmianka na toaster
  const setError = useErrorStore((state) => state.setError);
  const { getLobby, generateInvitation, leaveLobby, startGame } = useLobbyAPI();

  const [lobby, setLobby] = useState<LobbySettings | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isHost = lobby && user && lobby.createdBy === user.email;
  const canGenerateInvite = lobby?.type === "private" && isHost;

  useEffect(() => {
    if (!lobbyId) {
      navigate("/welcome");
      return;
    }

    const fetchLobbyData = async () => {
      try {
        const data = await getLobby(lobbyId);
        setLobby(data.lobby);
        setPlayers(data.players);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching lobby:", error);
        setError("lobby.errors.not_found");
        navigate("/welcome");
      }
    };

    fetchLobbyData();
  }, [lobbyId, getLobby, navigate, setError]);

  const generateInvite = async () => {
    if (!lobby) return;

    setIsLoading(true);
    try {
      const newInvitation = await generateInvitation(lobby.id);
      setInvitation(newInvitation);
      setShowInviteModal(true);
    } catch (error) {
      console.error("Error generating invitation:", error);
      setError("lobby.errors.invite_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!invitation) return;

    const inviteUrl = `${window.location.origin}/join-lobby?invite=${invitation.token}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setError(null);
      // TODO: Show success message instead of alert
      alert("Link skopiowany do schowka!");
    });
  };

  const handleStartGame = async () => {
    if (!lobby || !isHost) return;

    if (players.length < 3) {
      setError("lobby.errors.min_players");
      return;
    }

    setIsLoading(true);
    try {
      const gameData = await startGame(lobby.id);
      console.log("Game started:", gameData);
      navigate(`/game/${gameData.gameId}`);
    } catch (error) {
      console.error("Error starting game:", error);
      setError("lobby.errors.start_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (!lobby) return;

    try {
      await leaveLobby(lobby.id);
      navigate("/welcome");
    } catch (error) {
      console.error("Error leaving lobby:", error);
      setError("lobby.errors.leave_failed");
      navigate("/welcome"); // Navigate anyway
    }
  };

  if (isLoading && !lobby) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Ładowanie lobby...</p>
        </div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Lobby nie znalezione
          </h1>
          <p className="text-muted-foreground mb-4">
            Podane lobby nie istnieje lub zostało usunięte
          </p>
          <button
            onClick={() => navigate("/welcome")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Powrót do menu głównego
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">{lobby.name}</h1>
          <div className="flex items-center justify-center space-x-4 text-muted-foreground">
            <span className="flex items-center">
              {lobby.type === "private" ? "🔒" : "🌍"}
              {lobby.type === "private" ? "Prywatne" : "Publiczne"}
            </span>
            <span>
              👥 {players.length}/{lobby.maxPlayers} graczy
            </span>
            <span>🎴 {lobby.selectedDecks.length} talii</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-card-foreground mb-4">
                Gracze w lobby
              </h2>

              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 bg-accent rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">
                          {player.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {player.username}
                          {player.isHost && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                              HOST
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Dołączył:{" "}
                          {new Date(player.joinedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-muted-foreground">
                        Online
                      </span>
                    </div>
                  </div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: lobby.maxPlayers - players.length }).map(
                  (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="flex items-center p-4 bg-secondary/50 rounded-lg border-2 border-dashed border-border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-muted-foreground">?</span>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            Oczekiwanie na gracza...
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Lobby Controls */}
          <div className="space-y-6">
            {/* Game Settings */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-4">
                Ustawienia gry
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Wybrane talie:
                  </span>
                  <div className="mt-1 space-y-1">
                    {lobby.selectedDecks.map((deck) => (
                      <div
                        key={deck}
                        className="text-sm bg-accent px-3 py-1 rounded"
                      >
                        🎴 {deck}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invite Section - Only for private lobbies and hosts */}
            {canGenerateInvite && (
              <div className="bg-card rounded-lg p-6 border border-border">
                <h3 className="text-lg font-bold text-card-foreground mb-4">
                  Zaproszenia
                </h3>

                <button
                  onClick={generateInvite}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-info text-info-foreground rounded-lg font-medium hover:bg-info/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Generowanie..." : "📨 Wygeneruj zaproszenie"}
                </button>

                {invitation && (
                  <div className="mt-4 p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Aktywne zaproszenie:
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={copyInviteLink}
                        className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                      >
                        📋 Skopiuj link
                      </button>
                      <div className="text-center">
                        <QRCodeGenerator
                          text={`${window.location.origin}/join-lobby?invite=${invitation.token}`}
                          size={80}
                          className="mx-auto"
                          alt="Kod QR zaproszenia do lobby"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Kod QR
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Game Actions */}
            <div className="space-y-3">
              {isHost ? (
                <button
                  onClick={handleStartGame}
                  disabled={isLoading || players.length < 3}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {players.length < 3
                    ? `Potrzeba ${3 - players.length} więcej graczy`
                    : "🎮 Rozpocznij grę"}
                </button>
              ) : (
                <div className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium text-center">
                  ⏳ Oczekiwanie na hosta...
                </div>
              )}

              <button
                onClick={handleLeaveLobby}
                className="w-full px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
              >
                🚪 Opuść lobby
              </button>
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && invitation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 border border-border">
              <h3 className="text-lg font-bold text-card-foreground mb-4">
                Zaproszenie wygenerowane
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Link zaproszenia:
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={`${window.location.origin}/join-lobby?invite=${invitation.token}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-border rounded-l-lg bg-background text-foreground text-sm"
                    />
                    <button
                      onClick={copyInviteLink}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-r-lg hover:bg-primary/90"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <QRCodeGenerator
                    text={`${window.location.origin}/join-lobby?invite=${invitation.token}`}
                    size={128}
                    className="mx-auto mb-2"
                    alt="Kod QR zaproszenia do lobby"
                  />
                  <p className="text-sm text-muted-foreground">
                    Zeskanuj kodem QR lub udostępnij link
                  </p>
                </div>

                <button
                  onClick={() => setShowInviteModal(false)}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
