import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Eigenständiges Sub-Projekt im Repo. Läuft mit `npm install && npm run dev`.
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, open: false }
})
