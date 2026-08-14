# Eselsohr-Tests

End-zu-End-Tests mit Playwright gegen den Produktions-Build.

```bash
npm run build
npx vite preview --port 4173 &   # Testserver
npm i -D playwright-core          # einmalig (nutzt vorhandenes Chromium)
node tests/betreuung.test.mjs     # 🏫 Betreuungszeiten
node tests/assistent.test.mjs     # ✨ Assistent, Wizards, Demo, 🎂 Geburtstage
node tests/sync.test.mjs          # 🔗 Familien-Sync, 🗑️ Papierkorb, ↻ Serien-Wächter
```

Chromium: Die Tests erwarten einen Browser unter `/opt/pw-browsers/chromium`
(`executablePath` in den Dateien anpassen, falls er woanders liegt – z. B.
`npx playwright install chromium` und Pfad aus `npx playwright install --dry-run`).

Der Sync-Test braucht **keine** echte Datenbank: Er baut die drei
RPC-Antworten von `supabase/sync.sql` als Mock nach und prüft damit
Anlegen → Pushen → Beitreten → Merge → Konflikt-Verhalten.
