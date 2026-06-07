import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { NotifMount } from './notifications.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <NotifMount />
  </>
)
