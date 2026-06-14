# Projekt-Hinweise für Claude

## Sprache
- **Immer auf Deutsch antworten.** Der gesamte Chatverlauf (Erklärungen,
  Zusammenfassungen, Rückfragen) ist auf Deutsch zu führen.
- Code, Bezeichner und Commit-Messages folgen dem bestehenden Stil im
  Repository (überwiegend deutschsprachige Texte/Commits).

## Projektüberblick
- `src/App.jsx` – die komplette VereinsApp (React + Vite).
- `site/` – Landingpage-Hub **bolwerk24.de** (statisch). App-Katalog in
  `site/assets/js/apps.js`.
- `vorsorge/` – eigenständige Landingpage für **vorsorge.bolwerk24.de**
  (statisch, teilt das Design-System mit `site/`).

## Arbeitsregeln (aus docs/backlog.md)
- Vor jedem Commit: `npm run build` UND `npm test` grün.
- Nichts Destruktives (kein Live-Schema/RLS/Edge-Function-Deploy).
- Bei Produktentscheidung/Unklarheit nicht raten, sondern nachfragen.
