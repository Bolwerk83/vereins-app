# Supabase Edge Functions

Server-seitige Funktionen für den bolwerk24-Hub und das Controlling-Tool.
Beide brauchen die Rate-Limit-Infrastruktur aus `supabase/site.sql`
(`site_rate` + `rl_hit`) – diese also zuerst im SQL-Editor ausführen.

| Function | Zweck | Secrets |
|----------|-------|---------|
| `james`  | Proxy für den KI-Assistenten „James" (hält den Anthropic-Key serverseitig) | `ANTHROPIC_API_KEY` |
| `intake` | Öffentliche Inserts (Tracking/Newsletter/Bewertungen) mit Rate-Limit pro IP | – (nutzt die automatischen `SUPABASE_*`) |

## Deploy

```bash
# einmalig: Projekt verknüpfen
supabase link --project-ref phpkyzujpvrsypqqptlv

# Anthropic-Key hinterlegen (nur für james)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# beide Funktionen deployen
supabase functions deploy james  --no-verify-jwt
supabase functions deploy intake --no-verify-jwt
```

`--no-verify-jwt` ist nötig, weil die Funktionen aus dem Browser aufgerufen
werden (CORS-Preflight) und das Controlling-Tool auch ohne Login nutzbar
bleibt. Die Funktionen schützen sich selbst über:

- **Rate-Limit pro IP** (`rl_hit`, service_role) – james: 40/h, intake je
  Art: event 200/h, lead 5/h, review 10/h.
- **james:** Modell-Allowlist, `max_tokens`-Deckel, Größenlimit der Anfrage.
- **intake:** Feld-Whitelist + Längen-/Format-Validierung (spiegelt die
  DB-Constraints), Insert per service_role.

Ohne gesetzten `ANTHROPIC_API_KEY` antwortet `james` mit `503` →
das Controlling-Tool fällt automatisch in den Offline-Modus.

## Cutover: anon-Insert abschalten

Solange `intake` läuft, schreiben Hub-Besucher weiterhin auch direkt
(Übergangs-Fallback in `main.js`/`analytics.js`). Um den direkten Weg zu
schließen und das Rate-Limit verbindlich zu machen, **nach** dem Vercel-
Deploy des neuen `site/` einmalig `supabase/harden_inserts_cutover.sql`
ausführen (Details siehe Kopf der Datei).
