// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login'; // Załóżmy, że tworzysz ten komponent
import ThemeToggle from './components/ThemeToggle';
import ErrorBanner from './components/ErrorBanner';

function App() {
  return (
    <div className="bg-background text-foreground w-full min-h-screen">
      <ErrorBanner />
      <ThemeToggle />
      
      <Routes>
        {/* Ścieżka Logowania */}
        <Route path="/login" element={<Login />} />
        {/* Ścieżka Rejestracji */}
        <Route path="/register" element={<Registration />} />
  {/* Przekierowanie głównej ścieżki / na /register */}
  <Route path="/" element={<Navigate to="/register" replace />} />
  {/* Weryfikacja e-mail (modal w Registration) - trasa usunięta */}
      </Routes>
    </div>
  )
}

export default App