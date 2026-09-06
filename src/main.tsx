import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { sanitizeBrowserStorage } from './lib/safeStorage'

// Immediately purge any unauthorized or legacy keys from localStorage / sessionStorage
sanitizeBrowserStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
