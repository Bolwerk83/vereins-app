# Mandanten-Trennung (Punkt #3) – Migrationsplan

Status: **Entwurf zur Freigabe.** Noch nichts am Live-System geändert.
Bezug: `supabase/schema-multitenant.sql` (Ziel-Schema, nicht aktiv).

## Problem heute

- Es gibt **einen** globalen Vereinscode (`JOIN_CODE` in `src/App.jsx`).
- Die RLS-Policy `members access app_data` erlaubt **jedem** eingelösten
  Mitglied Lese-/Schreibzugriff auf **alle** `app_data`-Zeilen.
- Damit kann jedes Mitglied irgendeines Vereins die Shards **aller**
  Vereine (`…__club_<cid>`) lesen → Datenleck bei mehreren Vereinen.
- Zusätzlich liegen `seasons`/`activeSeason` in der **globalen** Zeile,
  d. h. alle Vereine teilen sich aktuell **eine** Saison (latenter Bug,
  fällt erst bei >1 Verein auf).

Für eine **Ein-Vereins-Installation** ist das unkritisch. Für eine
**Mehr-Vereins-Plattform** ist es ein ernstes Datenschutz-/Isolations-Problem.

## Zielbild

1. **Mitgliedschaft pro Verein**: `app_members(user_id, cid)`.
2. **Geheimcode pro Verein**: `app_club_secret(cid, code_hash)`.
3. **RLS** auf `app_data`:
   - `…__global` (Verzeichnis + öffentlicher `liveEvents`-Index): für
     angemeldete Nutzer les-/schreibbar (nur wenig sensibel).
   - `…__club_<cid>`: **nur** für Mitglieder genau dieses Vereins.
   - Backups/`__dbtest`/Sonstiges: kein normaler API-Zugriff.
4. **SuperAdmin** greift server-seitig per **Service-Role** zu (RLS-Bypass),
   nicht mehr als „Mitglied das alles sieht".
5. `seasons`/`activeSeason` wandern in den **Vereins-Shard** (echte
   Trennung + behebt die geteilte-Saison-Sache).

## App-Änderungen (`src/App.jsx`)

1. **`redeem_code` aufrufen mit `(cid, code)`** statt nur `(code)`.
   - `auth.ensureMember()` wird zu `auth.ensureMember(cid)`.
   - Eingelöst wird **beim Betreten eines Vereins** (Directory → Verein
     wählen / Direktlink / Login), nicht mehr global beim Boot.
   - Mehrere Mitgliedschaften pro Gerät möglich (Trainer in mehreren
     Vereinen) – `app_members` ist (user_id, cid).
2. **Pro-Verein-Code verwalten**: im ClubAdmin/SuperAdmin ein Feld
   „Vereinscode" (setzt `app_club_secret`). Bisher war der Code fix im
   Code – künftig pro Verein in der DB.
3. **`seasons`/`activeSeason` in den Shard**: in `splitData`/`mergeData`
   als vereinsbezogen behandeln (nicht mehr global). Migration: bestehende
   globale Saison in jeden vorhandenen Verein kopieren.
4. **Besucher-Turnieransicht** (`TournamentPublic`): Gäste sind **keine**
   Mitglieder → dürfen den Shard nicht lesen. Lösung: die für Gäste nötigen
   Turnierdaten (Titel, Plan, Timer, Setup-Anzeigeteile) zusätzlich in den
   **öffentlichen `liveEvents`-Index** (globale Zeile) spiegeln und die
   öffentliche Ansicht NUR daraus speisen. Der Timer-Steuer-Schreibzugriff
   eines Zeitnehmers ohne Mitgliedschaft braucht dann eine kleine
   **Edge-Function/RPC** (schreibt nur das Timer-Feld, mit Steuer-Passwort).
5. **SuperAdmin-Bereich**: Lese-/Schreibzugriff auf alle Vereine über eine
   Server-Funktion mit Service-Role umstellen (heute: Member-Token im
   Browser). Bis dahin SuperAdmin nur über SQL-Editor/Service-Role nutzen.

## Phasen-Rollout (ohne Ausfall der laufenden Ein-Vereins-Installation)

**Phase 0 – Vorbereiten (kein Risiko):**
- Dieses Dokument + `schema-multitenant.sql` reviewen.
- `seasons` in die Shards ziehen (App + einmalige Datenmigration), parallel
  abwärtskompatibel lesen (Shard ODER global).

**Phase 1 – Schema additiv:**
- `app_club_secret` + `app_members(user_id,cid)` anlegen (neben dem Alten).
- Für jeden bestehenden Verein einen Code setzen.
- Bestehende Mitglieder backfillen: für jede vorhandene `app_members`-Zeile
  (altes Schema) Mitgliedschaft in **allen aktuell vorhandenen** cids
  eintragen ODER (sauberer) alle Geräte neu einlösen lassen.

**Phase 2 – App umstellen:**
- `redeem_code(cid, code)` + Einlösen beim Vereinseintritt ausrollen.
- Directory bleibt mit globaler Lesepolicy nutzbar.
- Besucheransicht auf `liveEvents`-Spiegel umstellen (+ Timer-RPC).

**Phase 3 – RLS verschärfen (der eigentliche Schnitt):**
- Neue Policy `tenant access app_data` aktivieren, alte entfernen.
- **Ab hier sind Vereine isoliert.** Vorher testen, dass alle Clients
  Phase 2 ausgerollt haben (sonst 403). Backup vorher ziehen.

**Phase 4 – Aufräumen:**
- Alte globale `app_secret.code_hash`/`redeem_code(text)` entfernen.
- SuperAdmin auf Service-Role-Funktion umgestellt.

## Risiken & Hinweise

- **Reihenfolge ist kritisch:** RLS erst verschärfen (Phase 3), wenn alle
  Clients per-Verein einlösen – sonst sperrt sich die App aus (403). Der
  bestehende `?dbtest` hilft beim Verifizieren.
- **Backups** vor Phase 3 zwingend (SuperAdmin → Backup).
- **Service-Role-Key** niemals in den Browser/Client – nur in
  Edge-Functions/Server.
- Aufwand grob: Schema klein; App-Umbau mittel (Auth-Flow, seasons-Shift,
  Besucher-Spiegel, SuperAdmin-Server-Funktion).

## Empfehlung

Wenn die App vorerst **pro Verein einzeln** betrieben wird (eigene
Supabase-Instanz je Verein), ist #3 **nicht nötig** – jede Instanz ist
schon isoliert. #3 lohnt erst, wenn **mehrere Vereine dieselbe Instanz**
teilen sollen. Bitte hier entscheiden, bevor wir Phase 1+ umsetzen.
