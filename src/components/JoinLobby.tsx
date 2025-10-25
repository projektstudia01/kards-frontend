import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useErrorStore } from "../store/errorStore";
import { useLobbyAPI } from "../hooks/useLobbyAPI";
import type { LobbySettings } from "../types/lobby";

const JoinLobby: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getPublicLobbies, joinLobby } = useLobbyAPI();
  const setError = useErrorStore((state) => state.setError);

  const [activeTab, setActiveTab] = useState<"public" | "invite">("public");
  const [inviteCode, setInviteCode] = useState("");
  const [qrScannerActive, setQrScannerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [publicLobbies, setPublicLobbies] = useState<LobbySettings[]>([]);

  // Sprawdź czy jest kod zaproszenia w URL
  useEffect(() => {
    const inviteToken = searchParams.get("invite");
    if (inviteToken) {
      setActiveTab("invite");
      setInviteCode(inviteToken);
    }
  }, [searchParams]);

  // Pobranie publicznych lobby
  useEffect(() => {
    const fetchPublicLobbies = async () => {
      try {
        const lobbies = await getPublicLobbies();
        setPublicLobbies(lobbies);
      } catch (error) {
        console.error("Error fetching public lobbies:", error);
        setError("lobby.errors.fetch_failed");
      }
    };

    if (activeTab === "public") {
      fetchPublicLobbies();
    }
  }, [activeTab, getPublicLobbies, setError]);

  const handleJoinPublicLobby = async (lobbyId: string) => {
    setIsLoading(true);
    try {
      const result = await joinLobby({ lobbyId });
      console.log("Joined lobby:", result);
      navigate(`/lobby/${lobbyId}`);
    } catch (error) {
      console.error("Error joining lobby:", error);
      setError("lobby.errors.join_failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinWithInvite = async () => {
    if (!inviteCode.trim()) {
      setError("lobby.errors.invite_required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await joinLobby({ invitationToken: inviteCode });
      console.log("Joined with invite:", result);
      navigate(`/lobby/${result.lobby.id}`);
    } catch (error) {
      console.error("Error joining with invite:", error);
      setError("lobby.errors.invalid_invite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrScan = () => {
    setQrScannerActive(true);
    // TODO: Implementacja skanera QR
    // Na razie symulacja
    setTimeout(() => {
      const mockQrCode = "invite123456";
      setInviteCode(mockQrCode);
      setQrScannerActive(false);
      setError(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Dołącz do gry
          </h1>
          <p className="text-muted-foreground">
            Wybierz sposób dołączenia do rozgrywki
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab("public")}
            className={`flex-1 py-3 px-6 font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === "public"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:bg-accent"
            }`}
          >
            🌍 Publiczne lobby
          </button>
          <button
            onClick={() => setActiveTab("invite")}
            className={`flex-1 py-3 px-6 font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === "invite"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:bg-accent"
            }`}
          >
            🎫 Kod zaproszenia
          </button>
        </div>

        {/* Public Lobbies Tab */}
        {activeTab === "public" && (
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-card-foreground mb-6">
              Dostępne lobby publiczne
            </h2>

            {publicLobbies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎮</div>
                <p className="text-muted-foreground mb-4">
                  Brak dostępnych lobby publicznych
                </p>
                <button
                  onClick={() => navigate("/create-lobby")}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Stwórz nowe lobby
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {publicLobbies.map((lobby) => (
                  <div
                    key={lobby.id}
                    className="border border-border rounded-lg p-6 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-card-foreground mb-2">
                          {lobby.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>
                            👥 {lobby.currentPlayers}/{lobby.maxPlayers} graczy
                          </span>
                          <span>🎴 {lobby.selectedDecks.length} talii</span>
                          <span className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Aktywne
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinPublicLobby(lobby.id)}
                        disabled={
                          isLoading || lobby.currentPlayers >= lobby.maxPlayers
                        }
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {lobby.currentPlayers >= lobby.maxPlayers
                          ? "Pełne"
                          : "Dołącz"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invite Tab */}
        {activeTab === "invite" && (
          <div className="bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-card-foreground mb-6">
              Dołącz z kodem zaproszenia
            </h2>

            <div className="space-y-6">
              {/* Manual Code Input */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Kod zaproszenia
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Wklej lub wpisz kod zaproszenia"
                  />
                  <button
                    onClick={handleJoinWithInvite}
                    disabled={isLoading || !inviteCode.trim()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Łączenie..." : "Dołącz"}
                  </button>
                </div>
              </div>

              {/* QR Code Scanner */}
              <div className="border-t pt-6">
                <div className="text-center">
                  <div className="text-2xl mb-4">📱</div>
                  <h3 className="text-lg font-medium text-card-foreground mb-2">
                    Skanuj kod QR
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Użyj kamery telefonu aby zeskanować kod QR z zaproszeniem
                  </p>

                  {qrScannerActive ? (
                    <div className="bg-accent rounded-lg p-8 mb-4">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-muted-foreground">
                        Skanowanie kodu QR...
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleQrScan}
                      disabled={isLoading}
                      className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                    >
                      📸 Rozpocznij skanowanie
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/welcome")}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors"
          >
            ← Powrót do menu głównego
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinLobby;
