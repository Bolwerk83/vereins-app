# Backlog – Vereins-App

Gemeinsam priorisierte Aufgabenliste für (teil-)autonomes Arbeiten.
Reihenfolge = Priorität. Claude arbeitet von oben nach unten, ein Commit
je Aufgabe, Build + Tests müssen grün sein.

## Regeln (verbindlich für unbeaufsichtigte Läufe)
- Nichts Destruktives: kein Live-Schema/RLS/Edge-Function-Deploy.
- Alles rückwärtskompatibel, neue Verhaltensänderungen hinter Flags (Default aus).
- Vor jedem Commit: `npm run build` UND `npm test` grün.
- Bei Produktentscheidung/Unklarheit: NICHT raten – als „BLOCKIERT (Rückfrage)"
  markieren und zur nächsten Aufgabe gehen.
- Pro Aufgabe ein klarer Commit + diese Datei aktualisieren (erledigt → ✅).

## Status-Legende
- [ ] offen   ◐ in Arbeit   ✅ erledigt   ⛔ blockiert (Rückfrage/Backend nötig)

---

## A. Stabilität & Qualität (laufend)
- ◐ Mehr Tests für Kernlogik: Event-/Frist-Helfer ✅ (`src/logic.js` + `logic.test.js`, 10 Tests).
  Offen: Vote-Logik, Saison-Helfer (clubSeasons/activeSid).
- [ ] Tiefes Bug-Audit weiterer Komponenten (Chat, Onboarding, SuperAdmin) – Befunde fixen.
- ◐ Reine Helfer ausgelagert: `data.js` (split/merge) + `logic.js` (Event/Frist).
  Offen: Datum-Helfer (now/addD/fmtD), Farb-Helfer.
- [ ] Defensive Guards (`ev.votes||{}` etc.) an verbliebenen ungeschützten Stellen.

## B. Mandanten-Trennung (#3) – App-seitig, hinter MULTI_TENANT
- ✅ Auth-Fundament (per-Verein Beitritt, Gate)
- ✅ Saisons pro Verein
- ✅ Besucher-Spiegel (liveEvents.pub) – Gäste ohne Shard-Zugriff
- [ ] Vereinscode-Verwaltung im ClubAdmin (UI) – ⛔ braucht privilegierte RPC/Service-Role
- [ ] SuperAdmin auf Service-Role-Server-Funktion – ⛔ braucht Edge Function (Datei beilegen)
- [ ] Timer-Steuer-RPC für Gäste – ⛔ optional, sonst globaler Write (vorhanden)

## C. DSGVO (#2) – Feinschliff
- ✅ Einwilligungs-Nachweis (Spieler) + „Meine Daten"-Export/Löschantrag
- ✅ Inbox-Kennzeichnung für DSGVO-Löschanträge (Badge + Hinweis-Banner im Posteingang)
- ◐ Rechtstexte: bestehender „Vorlage"-Hinweis vorhanden; echte Verantwortlichen-Daten/anwaltliche Pruefung bleiben Aufgabe des Betreibers.

## D. Features (zu besprechen/priorisieren)
- ✅ Turnier: Ergebnis-Eingabe + Tabelle (Besucher lesen nur)
- ✅ Turnier: Team-Aufteilung (zugesagte Spieler zufaellig auf N Teams)
- ✅ Turnier: Statistiken (Stats-Tab zeigt jetzt die Tabelle)
- [ ] Affiliate: echte AWIN-mids/Publisher-ID eintragen, sobald Programme bestätigt
- [ ] Push-Benachrichtigungen finalisieren (VAPID/Edge-Function/Cron laut README)

## E. Ideen-Parkplatz (noch nicht eingeplant)
- (hier sammeln wir neue Wünsche)
