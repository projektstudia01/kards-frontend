// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'; // <--- DODAJ TEN IMPORT

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* OPAKOWANIE APLIKACJI W BROWSERROUTER */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)