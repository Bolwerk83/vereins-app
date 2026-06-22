# 09 · Agenten-Beirat (beratende Bots)

Definiert in `src/core/agentBoard.js`. Das Konzept: nicht **ein** Bot
antwortet, sondern ein **Beirat** mit klaren Mandaten — geführt vom
**Controller-Lead** (deiner Sicht), der alles auf das Unternehmensziel
zurückführt und Mehrwert erzeugt.

## Die Besetzung

| Bot | Mandat | Fokus-KPIs |
|-----|--------|------------|
| **Controller-Lead** (führt) | Ergebnis- UND Liquiditätssicht, roter Faden, Priorisierung | EBIT, DB-Quote, Wareneinsatzquote, Cash Conversion, Lagerbestand |
| Vertriebs-Berater | Umsatzqualität, Kanalmix, Retouren | Nettoumsatz, Online-Anteil, Retourenquote |
| Einkaufs-Berater | Einstandspreise, Klumpenrisiko → Hebel #1 | Einkaufsvolumen, Liefertreue, Wareneinsatzquote |
| Produktions-Berater | Ausschuss, Stückkosten → Hebel #1 | Ausschuss, Auslastung |
| Logistik-Berater | Bestände, Reichweite → Hebel #2 (Liquidität) | Lagerbestand, Reichweite, Cash Conversion |
| Finanz-Berater | GuV, Working Capital, Cash-Wirkung | EBIT, Cash Conversion, DB-Quote |

Das **Unternehmensziel** (`UNTERNEHMENSZIEL`) und der rote Faden sind eine
einzige Konstante — alle Bots teilen sie, damit Beiträge konsistent bleiben.

## Heute vs. Ausbaustufe

**Heute (umgesetzt):** Ein Controller-Lead-Aufruf (`claude-opus-4-8`)
**repräsentiert den Beirat intern** und synthetisiert die Fachperspektiven in
einem strukturierten Bericht. Günstig, schnell, ein Aufruf.

**Ausbaustufe (echter Multi-Agent):** Pro relevantem Bereich ein eigener
Berater-Aufruf (parallel), dann ein Controller-Lead-Aufruf, der die
Einzelvoten **zusammenführt und gewichtet** — sichtbar als echte „Diskussion".
Vorbereitet durch:
- `relevanteBerater(bereiche)` wählt die betroffenen Berater,
- jeder Berater hat eine eigene `perspektive` (Systemprompt-Fragment),
- der Bericht-Vertrag hat bereits ein `beirat[]`-Feld für die Einzelstimmen.

Für den Multi-Agent-Ausbau bietet sich die **Claude-Agent-Plattform**
(Managed Agents: ein Coordinator delegiert an Sub-Agenten) an — oder ein
einfacher Fan-out/Fan-in im Backend (mehrere `messages.create`-Aufrufe).

## Leitplanken

- **Controller-Sicht ist nicht optional** — sie ist der Systemprompt, nicht
  ein Hinweis. Jede Anforderung wird auf Ergebnis & Liquidität abgebildet.
- **Keine erfundenen Zahlen** — die Bots nutzen nur die übergebenen
  KPI-Werte; Fehlendes wird als Annahme/Risiko ausgewiesen.
- **Jede Maßnahme trägt Wirkung** (Ergebnis, Liquidität, Aufwand) — sonst ist
  sie kein Mehrwert, sondern nur eine Beobachtung.
