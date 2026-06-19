import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Eigenständiges Sub-Projekt im Repo. Läuft mit `npm install && npm run dev`.
// /api wird an das Reporting-Backend (server/, Port 3001) weitergereicht —
// nötig für VITE_DATA_SOURCE=mssql und VITE_BI_SOURCE=claude.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    open: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
