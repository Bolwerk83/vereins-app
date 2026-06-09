import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build-Zeitstempel (Europe/Berlin) als Versionsmarke. Aendert sich bei
// jedem Build automatisch -> in der App sichtbar zur Kontrolle, ob die
// aktuelle Version geladen ist.
const buildId = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Berlin',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit',
}).format(new Date()).replace(' ', ' ');

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
})
