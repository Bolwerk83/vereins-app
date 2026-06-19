# 08 · Self-Service BI

Modul `src/modules/self-service-bi/`. Der Anwender beschreibt eine
**Anforderung in natürlicher Sprache**; ein **Controller-geführter Beirat**
erzeugt daraus einen Bericht mit Befunden und **konkreten, mit Wirkung
versehenen Maßnahmen** — immer aus Sicht des Unternehmenscontrollers.

## Zwei Engines (dieselbe Naht wie mock|mssql)

`src/core/biProvider.js` schaltet über `VITE_BI_SOURCE`:

| Engine | Wann | Wie |
|--------|------|-----|
| `heuristik` (Default) | **läuft sofort**, ohne API-Key | `biHeuristik.js`: Stichwort→KPI-Matching + Hebel-Logik, deterministisch |
| `claude` | echte KI-Auswertung | Backend `server/biAgents.js` ruft **claude-opus-4-8** |

Die UI kennt nur `erzeugeBiBericht(anforderung, werte)` — der Wechsel ist
ein Einzeiler. Beide liefern **denselben Bericht-Vertrag**
(`src/core/agentBoard.js → BI_REPORT_FELDER`):

```
titel · anforderung · controllerSicht · relevanteKpis[] · befunde[] ·
massnahmen[] (mit Ergebnis- & Liquiditätswirkung) · risiken[] · beirat[]
```

## Claude-Backend aktivieren

1. `cd server && npm install` (zieht `@anthropic-ai/sdk`).
2. In `server/.env`: `ANTHROPIC_API_KEY=…` setzen.
3. Backend starten: `node index.js` (Port 3001) — bedient `POST /api/bi`.
4. Frontend mit Claude-Engine: `VITE_BI_SOURCE=claude npm run dev`
   (Vite-Dev-Proxy `/api` → `http://localhost:3001` einrichten).

**Sicherheit:** Der `ANTHROPIC_API_KEY` liegt **nur** im Backend; er verlässt
den Browser nie. Die Object-Level-Security (z. B. Personalkosten) greift in
der BI-Ansicht genauso wie im Baum.

## Technik (Backend)

`server/biAgents.js` nutzt:
- Modell **`claude-opus-4-8`** (aktuellstes Opus), **adaptives Denken**
  (`thinking: {type: 'adaptive'}`).
- **Strukturierte Ausgabe** (`output_config.format` mit JSON-Schema) →
  garantiert exakt den UI-Vertrag, kein Parsing-Risiko.
- Systemprompt = **Controller-Lead** mit dem Unternehmensziel und dem roten
  Faden; der Beirat wird intern als Fachperspektiven synthetisiert
  (Details und Ausbau zum echten Multi-Agent: `09-agenten-beirat.md`).

## Warum das zum Fundament passt

Das BI ist kein Fremdkörper: Es liest dieselbe **KPI-Registry** (Ziele,
Ampel, Abhängigkeiten), denselben **Werte-Provider** und dieselben
**Design-Tokens**. Es ist nur eine weitere **Sicht** auf den Kern — und
lässt sich daher mit den übrigen Modulen zusammenführen.
