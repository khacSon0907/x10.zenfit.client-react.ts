// Polyfill global for browser environment (required by sockjs-client)
if (typeof window !== 'undefined' && !(window as unknown as { global: unknown }).global) {
  (window as unknown as { global: unknown }).global = window;
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
