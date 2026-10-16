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
enthält den Gedächtnispalast weiterhin nur verschlüsselt). Gelöschtes landet
30 Tage im 🗑️ Papierkorb (*Familie*), nichts geht aus Versehen verloren.

## Stufe 2: 🔗 Familien-Sync (alle Geräte, ein Stand)

Der Sync ist fertig eingebaut. Einmalig aktivieren:

1. [`supabase/sync.sql`](supabase/sync.sql) im Supabase-SQL-Editor ausführen
   (Projekt der Vereins-App, ~2 Minuten – Anleitung steht in der Datei).
2. In der App: *Familie → Familien-Sync einschalten* → Familien-Code teilen.
3. Andere Geräte: Startseite → *Familie beitreten (mit Sync-Code)*.

Danach wandern Änderungen automatisch auf alle Geräte (Push nach jeder
Änderung, Pull alle 30 s und beim App-Wechsel, Konflikte werden gemerged –
Löschungen setzen sich über den Papierkorb durch). Der Gedächtnispalast
bleibt dabei Ende-zu-Ende-verschlüsselt: Der Server sieht nur salt/iv/cipher.
Zugriff schützt der unerratbare Familien-Code (gleiche Idee wie der
Vereinscode der Vereins-App); direkter Tabellenzugriff ist per RLS zu.
Das ausführlichere Zeilen-Schema für später liegt in
[`supabase/schema.sql`](supabase/schema.sql).

## 📲 Als App aufs Handy (PWA)

Auf einer echten Domain (z. B. Vercel) ist Eselsohr installierbar: Safari/Chrome
→ „Zum Home-Bildschirm“. Eigenes Icon, Vollbild, funktioniert nach dem ersten
Besuch auch offline (Service Worker, Netz-zuerst-Strategie).

## Bedienung auf einen Blick

- **Heute** ist ein Familienplaner: links der Abreißkalender (Pfeil oder Wischen
  reißt das Blatt ab, Sonn- und Feiertage rot, mit Kalenderwoche), daneben die
  **Tageslage** – der Tag in ein paar Sätzen, wichtige Stellen markiert und
  anklickbar. Darunter eine **Spalte pro Person** mit Betreuungszeiten,
  offenen Kinderterminen und roter Jetzt-Linie; Klick in eine Spalte trägt für
  genau diese Person ein.
- **Am Handy: Heute auf einen Blick** – das Wichtigste passt auf den ersten
  Bildschirm, ohne zu scrollen: ein kleiner Abreißblock (Wischen über den Kopf
  blättert) mit einem Satz zum Tag („Noch 1 Termin heute, 2 geschafft.“), je Kind
  eine Kachel *wo es gerade ist* und wer es als Nächstes begleitet, die Tagesliste
  mit roter Jetzt-Linie und hervorgehobenem nächsten Termin („in 1:20 Std.“) und
  **Wartet auf dich**: Anfragen, Kindertermine ohne Begleitung und Geburtstage –
  jeweils mit einem Tipp erledigt. Familienplaner, Morgen, Vorschläge und die
  Wochen-Balance sind zugeklappt, verraten aber schon in der Zusammenfassung das
  Wichtigste; der Planer zeigt sich zugeklappt als **Tagesband** (wer ist wann belegt).
- **Suche (⌘K, Strg+K oder „/“)** – ein Feld für alles:
  - *Finden* trotz Tippfehlern, ß/ss und Umlauten, mit Synonymen
    („Doktor“ findet den Kinderarzt) und Markierung der Treffer.
  - *Fragen*: „Wo ist Emma gerade?“, „Wer holt Ben heute?“,
    „Wer hat Samstag um 15 Uhr Zeit?“, „Wann hat Oma Geburtstag?“, „Was ist morgen?“
  - *Eintragen*: „Ben Dienstag 17 Uhr Fußball“, „jeden Freitag 15:30 Klavier“,
    „Milch auf die Liste“, „Notiz: Reifen wechseln“ – die Outlook-Regel gilt auch hier.
  - Erkannte Namen, Tage und Uhrzeiten färben sich schon beim Tippen,
    Tab ergänzt Wörter. Der Gedächtnispalast wird nur durchsucht, solange er offen ist.
- **Dokumente – das papierlose Büro** (im Gedächtnispalast, Ende-zu-Ende-verschlüsselt):
  *Ablegen* nimmt Fotos, Scans und PDFs (auch mehrere auf einmal oder per Ziehen),
  schlägt aus dem Dateinamen Titel, Datum und Ordner vor und fragt
  **„Steuerrelevant?“** – mit Steuerjahr, Art (Handwerker & Haushalt,
  Kinderbetreuung, Werbungskosten, Krankheitskosten, Spenden, Vorsorge,
  Bescheinigungen) und Betrag. Die Liste ist nach Monaten gruppiert, filterbar
  nach Alle/Steuer, Jahr und Ordner; der **Steuerordner** zeigt Summen je Art.
  Einzelne Dokumente lassen sich *teilen* (Teilen-Menü des Geräts) und
  *herunterladen*; jede Auswahl – etwa „Steuer 2026“ – geht mit einem Tipp als
  **ZIP mit Übersicht.csv** an Steuerberatung oder ELSTER. Gelöschtes bleibt
  30 Tage im Papierkorb. Die Dateien liegen verschlüsselt in der
  Browser-Datenbank (bis 25 MB pro Datei) und kommen im Backup mit.
- **Eselsohr knicken:** Die Ecke einer Terminzeile umknicken merkt den Termin
  persönlich vor; das gelbe Eselsohr am Blatt führt zu allen gemerkten Terminen.
- **Kalender** mit Kalenderwochen, Feiertagen je Bundesland (unter *Familie*)
  und farbigen Belegungsstrichen pro Person; die Tagesansicht folgt dem
  Personen-Filter („Ich + Kinder“ zeigt genau diese Spalten).
- **Erscheinungsbild** automatisch, hell oder dunkel (im Profil); das ganze
  Design färbt sich nach der Profilfarbe.

Schriften: Bricolage Grotesque und Instrument Sans (SIL Open Font License,
liegen in `src/fonts/`) – die App braucht dafür keinen Internetzugang.
Die Einzeldatei-Demo entsteht mit `npm run build && node scripts/einzeldatei.mjs`.

## Tests

Siehe [`tests/`](tests/) – sieben Suiten: Such-Engine (läuft direkt in Node),
Oberfläche, Gedächtnispalast, Dokumente/Steuerordner, Betreuungszeiten,
Assistent/Demo/Geburtstage und Sync/Papierkorb/Serien (Playwright).

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
  nicht einmal Dateinamen liegen im Klartext. Die Dateien selbst liegen einzeln
  verschlüsselt in IndexedDB (`src/docstore.js`), Titel/Ordner/Steuer-Angaben
  im verschlüsselten Palast; der ZIP-Export (`src/zip.js`) braucht keine
  Fremdbibliothek. Dokumente werden nicht über den Familien-Sync verteilt
  (zu groß) – dafür ins Backup aufgenommen.

## Herkunft

Entstanden im Repo der Vereins-App (`Bolwerk83/vereins-app`, Branch
`claude/digitales-gedachtnis-usuo2h`) und von dort per `git subtree split`
mit voller Historie hierher umgezogen. Konzepte: siehe `docs/`.
