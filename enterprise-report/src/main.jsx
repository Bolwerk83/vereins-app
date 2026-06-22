import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { SpracheProvider } from './core/i18n.jsx'
import './design/tokens.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SpracheProvider>
      <App />
    </SpracheProvider>
  </React.StrictMode>
)
