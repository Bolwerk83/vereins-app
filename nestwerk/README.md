# Eselsohr 📖

Der Familienkalender mit Gedächtnis – Gemeinschaftskalender mit Outlook-artigen
Terminanfragen, Praxis-Modul für die Hebammenarbeit, Familienlisten und ein
Ende-zu-Ende-verschlüsselter „Gedächtnispalast“ (digitales Gedächtnis mit
OneNote-artigen Abschnitten, Seiten und Dokumentenarchiv) pro Person.
Wie das Eselsohr im Buch: umknicken, wiederfinden, nichts vergessen.

## Stufe 1: läuft komplett ohne Datenbank

Keine Einrichtung nötig: Alle Daten liegen im Browser (localStorage), der
Gedächtnispalast darin ausschließlich als AES-256-Chiffretext – ohne das richtige
Passwort unkenntlich, ein „Passwort vergessen“ gibt es bewusst nicht.
Unter *Familie → Sicherung* gibt es Backup-Export und -Import (der Export
enthält den Gedächtnispalast weiterhin nur verschlüsselt).

Die Cloud-Synchronisierung über Supabase ist **Stufe 2** und liegt fertig
vorbereitet in [`supabase/schema.sql`](supabase/schema.sql) – sie ersetzt dann
nur `src/store.js`, der Rest der App bleibt gleich.

## Lokal starten

```bash
npm install
npm run dev
```

## Deploy (Vercel)

Neues Vercel-Projekt auf dieses Repo zeigen lassen – Vite wird automatisch
erkannt (Build `npm run build`, Output `dist`).

## So funktioniert es

- **Familie & Profile:** Beim ersten Start wird die Familie angelegt; wer sie
  anlegt, ist Admin. Mitglieder (Erwachsene und Kinder) bekommen Name und
  Farbe – Profilwechsel per Tipp oben rechts, Direktstart per `?u=Name`.
  Kinder sehen nur Heute, Kalender und Listen.
- **Termine & Anfragen (Outlook-Regel):** Wer „trägt direkt ein“ darf, dessen
  Termine für andere gelten sofort – außer der Platz ist belegt (±1 Stunde),
  dann wird automatisch eine Anfrage daraus. Ohne das Recht entsteht immer
  eine Anfrage, die die Zielperson mit ✓/✕ beantwortet. Termine für Kinder
  gelten immer sofort. Serientermine: Häkchen → 8 Wochen.
- **Suche:** Eine Suchleiste im Kalender findet Termine über alle Tage –
  nach Name, Typ oder Ort.
- **Praxis:** Klientinnen als Kontaktformular (Name, Telefon, Adresse) mit
  🚗 Anfahrt und 📞 Anruf per Knopfdruck, Termin-Typen (Nachsorge, Vorsorge,
  Beratung, Kursstunde, Wochenbettbesuch), Soll-/Ist-Zeiten mit Historie
  pro Klientin und Dokumente aus Vorlagen mit automatischer Namenszuordnung.
- **Arbeitskalender:** `.ics`-Datei aus Outlook/Office365 importieren – die
  Termine erscheinen mit 💼, erneuter Import aktualisiert alles. Die Datei
  bleibt auf dem Gerät.
- **Vereins-App-Sync:** Team verknüpfen (zeigt Trainer und Spieler zur
  Kontrolle) – Trainings, Spiele und Turniere landen automatisch im
  Familienkalender und bleiben aktuell, Absagen inklusive. Ohne Passwort.
- **Gedächtnispalast (E2E):** Eigenes Gedächtnis-Passwort pro Person → PBKDF2
  (310 000 Runden) → AES-256-GCM im Browser. Personen-Spickzettel und
  Dokumentenarchiv (Scans/PDFs) werden vor dem Speichern verschlüsselt;
  nicht einmal Dateinamen liegen im Klartext.

## Herkunft

Entstanden im Repo der Vereins-App (`Bolwerk83/vereins-app`, Branch
`claude/digitales-gedachtnis-usuo2h`) und von dort per `git subtree split`
mit voller Historie hierher umgezogen. Konzepte: siehe `docs/`.
