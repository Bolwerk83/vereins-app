import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)

// PWA: installierbar + offline. Nur registrieren, wo es einen Service Worker
// geben kann (echtes Deployment, https) – nicht in der Einzeldatei-Demo.
if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.claude) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline-Modus dann eben nicht */ })
  })
}
