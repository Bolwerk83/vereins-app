# Nestwerk

Der Familienkalender mit Gedächtnis – Gemeinschaftskalender, Outlook-artige
Terminanfragen, Familienlisten und ein Ende-zu-Ende-verschlüsseltes
„Merkzeug“ (digitales Gedächtnis) pro Person.

## Einmalige Einrichtung (2 Minuten)

1. **Datenbank anlegen:** Supabase-Dashboard öffnen → Projekt → *SQL Editor* →
   Inhalt von [`supabase/schema.sql`](supabase/schema.sql) einfügen → **Run**.
   Alle Tabellen tragen das Präfix `nw_` und stören die Vereins-App nicht.
2. Fertig. URL und Publishable-Key sind in `src/config.js` bereits eingetragen
   (per `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` überschreibbar).

> Tipp: Unter *Authentication → Sign In / Up* „Confirm email“ ausschalten,
> dann funktioniert die Registrierung ohne Bestätigungs-Mail – am einfachsten
> für den Familien-Start.

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

- **Konto & Familie:** Jede erwachsene Person registriert sich mit E-Mail und
  Passwort. Die erste Person gründet die Familie und wird Admin; weitere
  treten mit dem Einladungscode bei (steht unter *Familie*). Kinder werden
  ohne eigenen Login angelegt – sie sind Kalender-Personen mit Farbe.
- **Termine & Anfragen (Outlook-Regel):** Wer das Recht „trägt direkt ein“
  hat, dessen Termine für andere gelten sofort – außer der Platz ist belegt
  (±1 Stunde), dann wird automatisch eine Anfrage daraus. Ohne das Recht
  entsteht immer eine Anfrage, die die Zielperson mit ✓/✕ beantwortet.
  Diese Regel wird **serverseitig** (Trigger `nw_event_guard`) durchgesetzt.
- **Serientermine:** Häkchen setzen → die nächsten 8 Wochen werden angelegt.
- **Merkzeug (E2E):** Eigenes Gedächtnis-Passwort → daraus wird im Browser
  per PBKDF2 (310 000 Runden) ein AES-256-GCM-Schlüssel abgeleitet. Der
  Server speichert **nur Chiffretext** (`nw_memory`), Suche läuft lokal.
  Es gibt bewusst kein „Passwort vergessen“ – Passwort gut aufbewahren!
- **Trennung:** Row Level Security auf jeder Tabelle – jede Familie sieht
  ausschließlich sich selbst; das Merkzeug sieht ausschließlich sein Besitzer.

## Was als Nächstes kommt (siehe docs/familienapp-konzept.md)

Praxis-Modul (Kurse, Fristen), Dokumente & Abläufe im Merkzeug,
Push-Erinnerungen, Vereins-App-Verknüpfung per Team-Code, KI-Assistent.
