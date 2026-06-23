// =========================================================================
//  DATENARCHITEKTUR — In-App-Konzeptseite zur Daten- & Performance-Architektur
//  (Begleittext zu PERFORMANCE.md). Beschreibt die Schichten von der Quelle bis
//  zum Browser, das Sternschema, den Profit-Center-Baum als Dimension, die
//  Sicherheit (RLS/OLS-Pushdown) und die Einbindung externer Daten (ELT).
//  Reiner Inhalt (keine Laufzeitdaten) — strukturiert für Anzeige & Test.
// =========================================================================

// Verarbeitungsschichten von der Quelle bis zum Browser (Pipeline).
export const SCHICHTEN = [
  { id: 'quellen', icon: '🗄', name: 'Quellen', text: 'MSSQL/WaWi (Fakten & Stammdaten), Google Ads/Analytics, Geo-/PLZ- und Marktdaten. Heute Mock — Umstieg über denselben Provider-SEAM.' },
  { id: 'elt', icon: '🔄', name: 'ELT / Staging', text: 'Externe Daten inkrementell laden, in conformte Dimensionen/Fakten überführen (Matching auf interne Schlüssel). Kein Live-Join im Browser.' },
  { id: 'star', icon: '✳️', name: 'Sternschema', text: 'Schlanke Faktentabellen (nur Keys + Measures), ringsum kurze Dimensionen; Snowflake nur für tiefe Hierarchien (Outrigger).' },
  { id: 'preagg', icon: '📦', name: 'Pre-Aggregate', text: 'Materialisierte Sichten je sinnvollem Korn (z. B. Monat × Profit-Center × Warengruppe) — neben den Rohdaten, nicht statt ihnen.' },
  { id: 'security', icon: '🛡', name: 'Sicherheit (RLS/OLS)', text: 'Zeilen-/Spaltenfilter als Prädikat in der Abfrage (pc_key-Roll-up); sensible Spalten serverseitig maskiert. Cache je Sicherheitskontext.' },
  { id: 'api', icon: '⚙️', name: 'Auslieferung', text: 'Server filtert & paginiert (Keyset-Cursor), liefert nur die sichtbare Seite + KPIs aus gecachten Aggregaten.' },
  { id: 'browser', icon: '🖥', name: 'Browser', text: 'Virtualisierte Tabellen (nur ~50 Zeilen im DOM), Lazy-Drill bis zum Einzelbeleg on-demand. Es wird nie alles auf einmal geladen.' }
]

// Sternschema-Visual: zentrale Fakten + umgebende Dimensionen.
export const STERN = {
  fakten: [
    { id: 'umsatz', name: 'FactUmsatz', measures: 'Menge, Erlös, DB' },
    { id: 'auftrag', name: 'FactAuftrag', measures: 'Auftragswert, Status' }
  ],
  dimensionen: [
    { id: 'zeit', name: 'DimZeit', hierarchie: 'Tag → Monat → Quartal → Jahr' },
    { id: 'pc', name: 'DimProfitCenter', hierarchie: 'Geschäftsbereich / Kanal / Land' },
    { id: 'artikel', name: 'DimArtikel', hierarchie: 'SKU → Warengruppe → Sortiment' },
    { id: 'kunde', name: 'DimKunde', hierarchie: 'Kunde → Segment' },
    { id: 'region', name: 'DimRegion', hierarchie: 'PLZ → Bundesland → Land' }
  ]
}

// Tragende Prinzipien (warum das schnell & konsistent bleibt).
export const PRINZIPIEN = [
  { titel: 'Anzeige ≠ Datenmenge', text: 'Aggregate sind klein, Listen laden nur die sichtbare Seite, der Drill genau einen Datensatz. Niemand lädt „alle Zeilen".' },
  { titel: 'Eine Dimension, ein Filter', text: 'Der Profit-Center-Baum ist eine Dimensionshierarchie — Kanäle sind Knoten. Derselbe Filter wirkt (per Roll-up) über alle Berichte.' },
  { titel: 'Additiv vs. nicht-additiv', text: 'Summen/Mengen rollen frei auf; Quoten & Durchschnitte werden am Zielkorn neu berechnet — nie aus Teilquoten gemittelt.' },
  { titel: 'Sicherheit im Pushdown', text: 'Berechtigung gehört in die Abfrage (RLS), nicht in den Browser. Das verkleinert die Treffermenge — kostet also nichts.' },
  { titel: 'Rohdaten bleiben granular', text: 'Pre-Aggregate beschleunigen die KPI-Schicht, ersetzen aber nie die Rohdaten — Drill bis zum Einzelbeleg bleibt jederzeit möglich.' }
]

// Konkrete Richtwerte.
export const RICHTWERTE = [
  '100–500 Zeilen je API-Seite (Keyset-Cursor statt OFFSET)',
  'Drill-Calls < 50 ms (Index/Partition vorausgesetzt)',
  'Virtualisierung: nur ~50 DOM-Zeilen, Anzeige praktisch unbegrenzt',
  'Count begrenzen: „1–500 von vielen" statt exaktem Gesamt > 10.000',
  'Pre-Aggregat-Korn so grob wie möglich, so fein wie nötig'
]

export function uebersicht() {
  return { schichten: SCHICHTEN, stern: STERN, prinzipien: PRINZIPIEN, richtwerte: RICHTWERTE }
}
