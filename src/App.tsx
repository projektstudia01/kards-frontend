// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import Welcome from './components/Welcome';
import Lobby from './components/Lobby';
import CreateLobby from './components/CreateLobby';
import JoinLobby from './components/JoinLobby';
import QRCodeDemo from './components/QRCodeDemo';
import ThemeToggle from './components/ThemeToggle';
import ErrorBanner from './components/ErrorBanner';
import UsernamePopup from './components/UsernamePopup';

function App() {
  return (
    <div className="bg-background text-foreground w-full min-h-screen">
      <ErrorBanner />
      <ThemeToggle />
      
      <Routes>
        {/* Strona główna (po zalogowaniu) */}
        <Route path="/welcome" element={<Welcome />} />
        {/* Tworzenie lobby */}
        <Route path="/create-lobby" element={<CreateLobby />} />
        {/* Dołączanie do gry */}
        <Route path="/join-lobby" element={<JoinLobby />} />
        {/* Konkretne lobby */}
        <Route path="/lobby/:lobbyId" element={<Lobby />} />
        {/* QR Code Demo (for testing) */}
        <Route path="/qr-demo" element={<QRCodeDemo />} />
        {/* Ścieżka Logowania */}
        <Route path="/login" element={<Login />} />
        {/* Ścieżka Rejestracji */}
        <Route path="/register" element={<Registration />} />
        {/* Przekierowanie głównej ścieżki / na /register */}
        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
      
      {/* Username Popup - Global overlay */}
      <UsernamePopup />
    </div>
  )
}

export default App