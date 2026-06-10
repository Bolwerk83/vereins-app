# Aktivierungs-Anleitung (AWIN · Push · Mandanten-Trennung)

Schritt-für-Schritt zum Scharfschalten der drei vorbereiteten Bereiche.
Nichts davon ist „live" geschaltet – erst wenn du die Schritte ausführst.
Nach App-Code-Änderungen jeweils neu bauen/deployen (`npm run build` → Vercel).

---

## 1) AWIN / Affiliate scharf schalten

**Wo:** `src/App.jsx`, Konstante `AFFILIATE_IDS` (≈ Zeile 2346).

1. AWIN-**Publisher-ID** eintragen:
   ```js
   const AFFILIATE_IDS = {
     amazon: "deinname-21",   // Amazon Partnernet Tag (optional)
     owayo:  "DEINE-OWAYO-ID",
     awin:   "1234567",       // <-- DEINE AWIN Publisher-ID (Pflicht für AWIN-Links)
     hrs:    "",
     jako:   "",
     trainerakademie: "",
   };
   ```
2. **Advertiser freischalten** (in AWIN beim jeweiligen Advertiser bewerben). Pro
   Advertiser gibt es eine `awinmid`. Bereits hinterlegt: 11teamsports = `14589`.
   Für weitere (Decathlon, FlixBus …): in `AFFILIATES` (≈ Zeile 2403) den
   Direkt-Link durch den AWIN-Deeplink ersetzen:
   ```js
   // statt:  url:()=>`https://www.decathlon.de/sport/fussball`
   // dann:   url:()=>awinDeep(DECATHLON_MID, "players")   // mid aus AWIN
   ```
   (Der Helfer `awinDeep(mid, ref)` setzt automatisch deine `awin`-Publisher-ID ein.)
3. Empfohlene, brand-sichere Kategorien stehen oben im Kommentar bei `AFFILIATES`.
   Bewusst meiden: Erotik, Dating, Glücksspiel, Alkohol/Tabak, Finanzprodukte.
4. Build + Deploy. Test: in der App auf einen Werbe-Banner tippen → Ziel-Shop
   öffnet sich über den AWIN-Redirect.

**Hinweis:** Solange `awin` leer ist, zeigen die Links direkt auf den Shop
(funktionieren, aber ohne Provision).

---

## 2) Push-Benachrichtigungen scharf schalten

Voraussetzung iPhone: App einmal „Zum Home-Bildschirm" hinzufügen (iOS 16.4+).

1. **VAPID-Schlüsselpaar erzeugen** (einmalig), z. B. lokal:
   ```bash
   npx web-push generate-vapid-keys
   ```
   Liefert `Public Key` und `Private Key`.
2. **Public Key in die App**: `src/notifications.jsx`, Konstante
   `VAPID_PUBLIC_KEY` (≈ Zeile 10) auf den **Public Key** setzen. Build + Deploy.
3. **Edge-Function-Secrets** (Supabase → Edge Functions → Secrets):
   - `VAPID_PUBLIC_KEY` = Public Key
   - `VAPID_PRIVATE_KEY` = Private Key
   - `VAPID_EMAIL` = `mailto:deine@email`
   - `APP_DATA_KEY` = `vereinsapp_v14`
   (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` setzt Supabase automatisch.)
4. **SQL ausführen**: Inhalt von `supabase/notifications.sql` im SQL-Editor
   (legt Tabellen/Funktionen für Subscriptions an).
5. **Function deployen**: `supabase functions deploy notify`
   (oder Inhalt von `supabase/functions/notify/index.ts` im Dashboard einfügen).
6. **Täglicher Versand** (optional): Extensions `pg_cron` + `pg_net` aktivieren,
   dann den auskommentierten `cron.schedule(...)`-Block am Ende von
   `supabase/notifications.sql` einfügen – darin `DEIN-PROJEKT` und
   `DEIN-SERVICE-ROLE-KEY` ersetzen.
7. **Test**:
   ```bash
   curl -X POST https://DEIN-PROJEKT.supabase.co/functions/v1/notify \
     -H "Authorization: Bearer DEIN-SERVICE-ROLE-KEY" \
     -H "Content-Type: application/json" -d '{"mode":"test"}'
   ```
   Alle aktiven Subscriptions bekommen eine Test-Benachrichtigung.

---

## 3) Mandanten-Trennung (mehrere Vereine isoliert) scharf schalten

Voller Plan + Begründung: `docs/mandanten-trennung.md`. Ziel-Schema:
`supabase/schema-multitenant.sql`. **Reihenfolge ist kritisch** – sonst
sperrt sich die App aus. Vorher **Backup** ziehen (SuperAdmin → Backup).

> Nur nötig, wenn EINE Supabase-Instanz MEHRERE Vereine tragen soll. Bei je
> eigener Instanz pro Verein ist nichts zu tun (schon isoliert).

1. **Backup** erstellen.
2. **Schema additiv anlegen**: `supabase/schema-multitenant.sql` im SQL-Editor
   ausführen (legt `app_members(user_id,cid)`, `app_club_secret`, neue
   `redeem_code(cid,code)`, neue RLS-Policy an – die alte noch NICHT entfernen).
3. **Pro Verein einen Code setzen** (Beispiel-SQL steht in der Datei):
   ```sql
   insert into public.app_club_secret (cid, code_hash)
   values ('c_xxx', encode(digest('GEHEIM-CODE','sha256'),'hex'))
   on conflict (cid) do update set code_hash = excluded.code_hash;
   ```
4. **App umstellen**: `src/App.jsx`, `const MULTI_TENANT = false;` (≈ Zeile 627)
   auf `true`. Build + Deploy. Ab jetzt: Vereinscode-Eingabe beim Betreten,
   Saisons pro Verein, Besucher-Turnier liest aus dem öffentlichen Spiegel.
5. **Verifizieren**: mit `?dbtest` prüfen, dass Lesen/Schreiben/Einlösen klappt;
   sicherstellen, dass alle Geräte die neue App-Version haben.
6. **RLS verschärfen (der eigentliche Schnitt):** die alte Policy
   `members access app_data` entfernen (die neue `tenant access app_data` aus
   Schritt 2 ist dann allein aktiv). Ab jetzt sind Vereine isoliert.

### Noch offen für die volle Mehr-Vereins-Nutzung (eigene Schritte/Code)
- **SuperAdmin** greift derzeit mit dem Member-Token zu → unter scharfer RLS
  sieht er nicht mehr alle Vereine. Lösung: SuperAdmin-Lesen/Schreiben über eine
  **Service-Role-Edge-Function** (umgeht RLS). Bis dahin SuperAdmin nur über
  SQL-Editor/Service-Role nutzen.
- **Vereinscode-Verwaltung** im ClubAdmin (Code setzen/ändern) braucht eine
  privilegierte RPC – bis dahin per SQL setzen (Schritt 3).
- **Timer-Steuerung durch reine Gäste** ohne Mitgliedschaft schreibt aktuell in
  die globale Zeile (unter der vorgeschlagenen RLS erlaubt). Für strengere RLS
  ggf. kleine `set_timer`-RPC ergänzen.

---

## Reihenfolge-Empfehlung
1) AWIN (risikolos) → 2) Push (risikolos, additiv) → 3) Mandanten-Trennung
(nur bei Mehr-Vereins-Betrieb, mit Backup & in der genannten Reihenfolge).
