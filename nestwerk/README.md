# Nestwerk

Der Familienkalender mit Gedächtnis – Gemeinschaftskalender, Outlook-artige
Terminanfragen, Familienlisten und ein Ende-zu-Ende-verschlüsseltes
„Merkzeug“ (digitales Gedächtnis) pro Person.

## Stufe 1: läuft komplett ohne Datenbank

Keine Einrichtung nötig: Alle Daten liegen im Browser (localStorage), das
Merkzeug darin ausschließlich als AES-256-Chiffretext. Unter *Familie →
Sicherung* gibt es Backup-Export und -Import (der Export enthält das Merkzeug
weiterhin nur verschlüsselt).

Die Cloud-Synchronisierung über Supabase ist **Stufe 2** und liegt fertig
vorbereitet in [`supabase/schema.sql`](supabase/schema.sql) – sie ersetzt dann
nur `src/store.js`, der Rest der App bleibt gleich.

## Lokal starten

```bash
cd nestwerk
npm install
npm run dev
```

## Deploy (Vercel)

Neues Vercel-Projekt auf dieses Repo zeigen lassen, **Root Directory:
`nestwerk`** – Vite wird automatisch erkannt (Build `npm run build`,
Output `dist`).

## So funktioniert es

- **Familie & Profile:** Beim ersten Start wird die Familie gegründet; der
  Gründer ist Admin. Mitglieder (Erwachsene und Kinder) werden unter
  *Familie* mit Name und Farbe angelegt – Profilwechsel per Tipp oben rechts.
  Kinder sehen nur Heute, Kalender und Listen.
- **Termine & Anfragen (Outlook-Regel):** Wer das Recht „trägt direkt ein“
  hat, dessen Termine für andere gelten sofort – außer der Platz ist belegt
  (±1 Stunde), dann wird automatisch eine Anfrage daraus. Ohne das Recht
  entsteht immer eine Anfrage, die die Zielperson mit ✓/✕ beantwortet.
  Termine für Kinder gelten immer sofort.
- **Serientermine:** Häkchen setzen → die nächsten 8 Wochen werden angelegt.
- **Merkzeug (E2E):** Eigenes Gedächtnis-Passwort pro Person → daraus wird im
  Browser per PBKDF2 (310 000 Runden) ein AES-256-GCM-Schlüssel abgeleitet.
  Gespeichert wird **nur Chiffretext**, Suche läuft lokal. Es gibt bewusst
  kein „Passwort vergessen“ – Passwort gut aufbewahren!

## Was als Nächstes kommt (siehe docs/familienapp-konzept.md)

Praxis-Modul (Kurse, Fristen), Dokumente & Abläufe im Merkzeug,
Push-Erinnerungen, Vereins-App-Verknüpfung per Team-Code, KI-Assistent.
