// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import Lobby from './components/Lobby';
import ThemeToggle from './components/ThemeToggle';
import ErrorBanner from './components/ErrorBanner';
import UsernamePopup from './components/UsernamePopup';

function App() {
  return (
    <div className="bg-background text-foreground w-full min-h-screen">
      <ErrorBanner />
      <ThemeToggle />
      
      <Routes>
        {/* Ścieżka Lobby (główna strona po zalogowaniu) */}
        <Route path="/lobby" element={<Lobby />} />
        {/* Ścieżka Logowania */}
        <Route path="/login" element={<Login />} />
        {/* Ścieżka Rejestracji */}
        <Route path="/register" element={<Registration />} />
        {/* Przekierowanie głównej ścieżki / na /register */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        {/* Weryfikacja e-mail (modal w Registration) - trasa usunięta */}
      </Routes>
      
      {/* Username Popup - Global overlay */}
      <UsernamePopup />
    </div>
  )
}

export default App