// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Registration from "./components/Registration";
import Login from "./components/Login";
import Welcome from "./components/Welcome";
import LobbyPage from "./pages/LobbyPage";
import CreateLobby from "./components/CreateLobby";
import JoinLobby from "./components/JoinLobby";
import QRCodeDemo from "./components/QRCodeDemo";
import ThemeToggle from "./components/ThemeToggle";
import UsernamePopup from "./components/UsernamePopup";
import Decks from "./components/Decks";
import DeckEditor from "./components/DeckEditor";
import { Toaster } from "sonner";
import { useAuthStore } from "./store/authStore";

function App() {
  const { isLoggedIn } = useAuthStore();
  return (
    <div className="bg-background text-foreground w-full min-h-screen">
      <Toaster />
      <ThemeToggle />

      <Routes>
        {/* Strona główna (po zalogowaniu) */}
        <Route
          path="/welcome"
          element={isLoggedIn ? <Welcome /> : <Navigate to="/login" replace />}
        />
        {/* Tworzenie lobby */}
        <Route
          path="/create-lobby"
          element={
            isLoggedIn ? <CreateLobby /> : <Navigate to="/login" replace />
          }
        />
        {/* Dołączanie do gry */}
        <Route
          path="/join-lobby"
          element={
            isLoggedIn ? <JoinLobby /> : <Navigate to="/login" replace />
          }
        />
        {/* Decks */}
        <Route
          path="/decks"
          element={isLoggedIn ? <Decks /> : <Navigate to="/login" replace />}
        />
        {/* Deck Editor */}
        <Route
          path="/deck/:deckId/edit"
          element={
            isLoggedIn ? <DeckEditor /> : <Navigate to="/login" replace />
          }
        />
        {/* Konkretne lobby */}
        <Route
          path="/lobby/:lobbyId"
          element={isLoggedIn ? <LobbyPage /> : <Navigate to="/login" replace />}
        />
        {/* QR Code Demo (for testing) */}
        <Route
          path="/qr-demo"
          element={
            isLoggedIn ? <QRCodeDemo /> : <Navigate to="/login" replace />
          }
        />
        {/* Ścieżka Logowania */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/welcome" replace /> : <Login />}
        />
        {/* Ścieżka Rejestracji */}
        <Route
          path="/register"
          element={
            isLoggedIn ? <Navigate to="/welcome" replace /> : <Registration />
          }
        />
        {/* Przekierowanie głównej ścieżki / na /register */}
        <Route
          path="/"
          element={isLoggedIn ? <Welcome /> : <Navigate to="/login" replace />}
        />
      </Routes>

      {/* Username Popup - Global overlay */}
      <UsernamePopup />
    </div>
  );
}

export default App;
