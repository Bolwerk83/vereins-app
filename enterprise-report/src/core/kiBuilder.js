// =========================================================================
//  KI-REPORT-BUILDER — Datenkatalog + (mock-)KI, die zu ausgewählten
//  Kennzahlen passende Darstellungen vorschlägt und per Knopfdruck einen
//  Berichtsentwurf erzeugt. Respektiert den KI-Schalter (kiEinstellungen).
// =========================================================================

// Auswählbare, bereits vorhandene Kennzahlen/Daten (Katalog).
export const KATALOG = [
  { id: 'umsatz', name: 'Umsatz Ist/Plan/VJ', art: 'zeitreihe', einheit: '€', dim: 'Periode' },
  { id: 'db', name: 'Deckungsbeitrag %', art: 'kennzahl', einheit: '%' },
  { id: 'roce', name: 'ROCE', art: 'kennzahl', einheit: '%' },
  { id: 'ekquote', name: 'Eigenkapitalquote', art: 'kennzahl', einheit: '%' },
  { id: 'liquiditaet', name: 'Liquiditätsgrade 1–3', art: 'gruppe', einheit: '%' },
  { id: 'umsatz_kanal', name: 'Umsatz nach Kanal', art: 'anteil', einheit: '€', dim: 'Kanal' },
  { id: 'umsatz_land', name: 'Umsatz nach Land', art: 'verteilung', einheit: '€', dim: 'Land' },
  { id: 'versanddeckung', name: 'Versand-Deckungsquote', art: 'kennzahl', einheit: '%' },
  { id: 'auftragseingang', name: 'Auftragseingang nach Kategorie', art: 'anteil', einheit: '€', dim: 'Kategorie' },
  { id: 'bcg', name: 'Portfolio (Wachstum × DB)', art: 'streu', einheit: '%' },
  { id: 'preisentwicklung', name: 'Ø-Verkaufspreis 2021–2025', art: 'zeitreihe', einheit: '€', dim: 'Jahr' }
]
export const katalogItem = (id) => KATALOG.find((k) => k.id === id)

// Welche Darstellung passt zu welcher Datenart (KI-Heuristik).
const VIS_FUER = {
  zeitreihe: { viz: 'Linie', icon: '📈', warum: 'Verlauf über die Zeit' },
  kennzahl: { viz: 'KPI-Karte + Tacho', icon: '🎯', warum: 'Einzelwert gegen Zielband' },
  gruppe: { viz: 'KPI-Kacheln', icon: '🔢', warum: 'mehrere verwandte Werte' },
  anteil: { viz: 'Donut', icon: '🍩', warum: 'Anteile am Ganzen' },
  verteilung: { viz: 'Balken', icon: '📊', warum: 'Vergleich je Ausprägung' },
  streu: { viz: 'Blasenmatrix', icon: '🫧', warum: 'zwei Maße + Größe' }
}
export const visFuer = (art) => VIS_FUER[art] || VIS_FUER.kennzahl

// Mock-„Insight" je Item (wie eine KI-Kurzaussage).
const INSIGHTS = {
  umsatz: 'YTD 9,2 Mio € unter Plan — Nachfrageschwäche, Gegenmaßnahmen im Vertrieb.',
  db: 'Deckungsbeitrag stabil; Teile/Zubehör tragen überproportional.',
  roce: 'ROCE 9,6 % — unter Zielband (12 %); Kapitalbindung senken.',
  ekquote: 'Eigenkapitalquote 35 % — solide finanziert.',
  liquiditaet: 'Liquidität 2. Grades mit 79 % angespannt — Working Capital prüfen.',
  umsatz_kanal: 'Online wächst über Plan, stationär verliert — Omnichannel stärken.',
  umsatz_land: 'Auslandsgeschäft wächst schneller (NL, Skandinavien).',
  versanddeckung: 'Versand nur 62 % gedeckt — Freigrenze/Sperrgut-Zuschlag prüfen.',
  auftragseingang: 'Gravel trägt 40 % des Absatzes; Spitzentag Donnerstag.',
  bcg: 'Cash Cows tragen den Gewinn, wenige Question Marks mit Potenzial.',
  preisentwicklung: 'Preisniveau sinkt — vor allem durch Rabattaktionen.'
}

/** KI-Vorschlag je Item: Darstellung + Begründung + Kurz-Insight. */
export function vorschlag(id) {
  const it = katalogItem(id); if (!it) return null
  const v = visFuer(it.art)
  return { id, name: it.name, art: it.art, viz: v.viz, icon: v.icon, warum: v.warum, insight: INSIGHTS[id] || '' }
}

/** Aus der Auswahl einen Berichtsentwurf erzeugen (Titel + Blöcke + Summary). */
export function generiereBericht(ids) {
  const bloecke = ids.map(vorschlag).filter(Boolean)
  const themen = bloecke.map((b) => b.name.split(' ')[0])
  const titel = bloecke.length
    ? `Bericht: ${[...new Set(themen)].slice(0, 3).join(', ')}${themen.length > 3 ? ' u. a.' : ''}`
    : 'Leerer Bericht'
  const summary = bloecke.length
    ? `KI-Entwurf aus ${bloecke.length} Kennzahl(en): ${bloecke.slice(0, 2).map((b) => b.insight).filter(Boolean).join(' ')}`
    : 'Bitte mindestens eine Kennzahl auswählen.'
  return { titel, bloecke, summary }
}
