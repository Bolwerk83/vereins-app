import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Eigenständiges Sub-Projekt im Repo. Läuft mit `npm install && npm run dev`.
// /api wird an das Reporting-Backend (server/, Port 3001) weitergereicht —
// nötig für VITE_DATA_SOURCE=mssql und VITE_BI_SOURCE=claude.
export default defineConfig({
  plugins: [react()],
  // Bewusst EIN Bündel (kein Code-Splitting / kein dynamic import()):
  // Der Standalone-Demo-Build (scripts/build-standalone.mjs) bettet genau eine
  // JS-Datei als klassisches <script> in eine einzige HTML-Datei ein. Dynamic
  // import() von blob:/inline-Quellen führt auf Mobile Safari zur weißen Seite.
  // Daher kein React.lazy o. Ä. Die Bündelgröße ist mit ~383 KB gzip schnell;
  // wir heben nur die irreführende Roh-Größen-Warnung an.
  build: {
    chunkSizeWarningLimit: 1800
  },
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
