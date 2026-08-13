# Digitales Gedächtnis – Konzept

Ein persönliches „zweites Gedächtnis" als App: Menschen, Gespräche, Abläufe und
Dokumente an einem Ort, miteinander vernetzt, blitzschnell durchsuchbar und
komplett gesichert. Im ersten Schritt nur für eine Person (dich) gedacht.

## Das Kernproblem

- Vornamen und Details von Bekannten gehen verloren („Wie hieß nochmal die Frau
  von …? Was haben wir letztes Mal besprochen?").
- Small Talk fällt schwer, wenn die Anknüpfungspunkte fehlen.
- Wichtige Abläufe (wie mache ich X nochmal?) müssen jedes Mal neu
  rekonstruiert werden.
- Dokumente liegen verstreut und sind nicht mit Personen/Themen verknüpft.

Die App löst das nicht durch „mehr Notizen", sondern durch **schnelles
Wiederfinden im richtigen Moment**: 10 Sekunden vor dem Gespräch aufs Handy
schauen und vorbereitet sein.

## Die vier Bausteine

### 1. Personen (das Herzstück)

Pro Person eine Karteikarte:

- Name, Foto, Woher kenne ich sie/ihn (Verein, Nachbarschaft, Arbeit …)
- **Familie & Umfeld**: Partner, Kinder (mit Vornamen!), Haustiere
- **Interessen & Themen**: Hobbys, Lieblingsverein, Urlaubsziele
- **Gesprächsaufhänger**: offene Fäden aus dem letzten Gespräch
  („wollte im Mai nach Kroatien", „Tochter macht Abi", „baut gerade um")
- Wichtige Termine: Geburtstag, Jubiläen → mit Erinnerung

**Spickzettel-Ansicht („Vor dem Treffen")**: Person antippen → eine kompakte
Seite mit Namen der Familie, letzten Themen und 2–3 vorgeschlagenen
Einstiegsfragen. Das ist die Small-Talk-Hilfe.

**Schnellerfassung („Nach dem Gespräch")**: In unter 30 Sekunden festhalten,
was besprochen wurde – als Stichpunkte oder Sprachnotiz. Wird automatisch der
Person und dem Datum zugeordnet.

### 2. Abläufe (Checklisten & How-tos)

Wiederkehrende Prozesse Schritt für Schritt festhalten: „Beamer im Vereinsheim
anschließen", „Steuerunterlagen zusammenstellen", „Router neu einrichten".
Mit Fotos pro Schritt. Beim Abarbeiten abhakbar.

### 3. Dokumente

Upload von PDFs, Fotos, Scans. Jedes Dokument bekommt Schlagworte und kann mit
Personen und Abläufen verknüpft werden („Vertrag ↔ Person X ↔ Ablauf
Kündigung"). Ablage nach Themen, aber gefunden wird über die Suche.

### 4. Vernetzung & Suche (macht daraus ein Gedächtnis)

- Alles kann mit allem verknüpft werden: Person ↔ Notiz ↔ Dokument ↔ Ablauf
  ↔ Thema (Tags).
- **Eine einzige Suchleiste** über alles: „kroatien" findet die Person, die
  dahin fährt, die Notiz dazu und die Buchungsbestätigung.
- Später ausbaubar mit KI: semantische Suche („wer hat einen Hund?") und
  automatisch vorgeschlagene Gesprächsfragen aus den Notizen.

## Technik (bewusst wie die Vereins-App)

Gleicher Stack wie gewohnt – nichts Neues lernen, alles wiederverwendbar:

| Baustein | Lösung |
|---|---|
| App | React + Vite, als **PWA** installierbar auf dem Handy |
| Daten | **Supabase** (Postgres) – Personen, Notizen, Abläufe, Verknüpfungen |
| Dateien | Supabase **Storage** für Dokumente/Fotos |
| Zugang | Supabase Auth, ein einzelner Account, alle Tabellen mit RLS abgesichert |
| Offline | Lokaler Cache (PWA), damit der Spickzettel auch ohne Netz aufgeht |
| Hosting | Vercel, automatisches Deploy bei Push |

### Komplett-Sicherung (nichts geht verloren)

1. Supabase sichert die Datenbank automatisch (tägliche Backups).
2. Zusätzlich ein **Export-Knopf** in der App: alles als ZIP (JSON + Dokumente)
   herunterladen – dein Gedächtnis gehört dir, unabhängig vom Anbieter.
3. Optional später: automatischer wöchentlicher Export.

### Privatsphäre

Nur für dich: ein Account, Row Level Security auf jeder Tabelle, Dokumente in
einem privaten Storage-Bucket. Keine Mandanten, keine Freigaben – das kann in
einem späteren Schritt kommen, ist aber bewusst nicht Teil des MVP.

## Datenmodell (Skizze)

```
person      (id, name, foto, kontext, geburtstag, notizen_fest …)
notiz       (id, person_id?, text, audio_url?, datum)
ablauf      (id, titel)  →  ablauf_schritt (id, ablauf_id, pos, text, foto_url?)
dokument    (id, titel, datei_url, mime)
tag         (id, name)
verknuepfung(von_typ, von_id, zu_typ, zu_id)   -- vernetzt alles mit allem
```

Volltextsuche über eine Postgres-`tsvector`-Spalte je Tabelle, gebündelt in
einer Such-View – eine Abfrage, alle Treffer.

## Ausbaustufen

**Stufe 1 – MVP (der eigentliche Nutzen):**
Personen mit Spickzettel-Ansicht, Schnellerfassung von Notizen, globale Suche,
PWA installierbar. → Damit ist das Small-Talk-Problem bereits gelöst.

**Stufe 2 – Dokumente & Abläufe:**
Upload + Verschlagwortung, Checklisten mit Fotos, Verknüpfungen zwischen allem.

**Stufe 3 – Erinnern & Sichern:**
Geburtstags-/Follow-up-Erinnerungen (Push, wie in der Vereins-App),
Export-Knopf (ZIP-Vollbackup).

**Stufe 4 – KI-Unterstützung (optional):**
Sprachnotiz → automatisch Stichpunkte; vorgeschlagene Gesprächsfragen pro
Person; semantische Suche.

## Offene Entscheidungen

1. **Eigenes Repo oder Ordner hier?** Empfehlung: eigenes Repo
   (`digitales-gedaechtnis`), da es fachlich nichts mit dem Verein zu tun hat –
   Code-Bausteine (PWA-Setup, Supabase-Anbindung, Push) übernehmen wir.
2. **Eigenes Supabase-Projekt** (Empfehlung, saubere Trennung der privaten
   Daten) oder das bestehende mitnutzen.
3. Start mit Stufe 1 sofort möglich.
