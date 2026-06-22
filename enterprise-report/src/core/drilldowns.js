// =========================================================================
//  DRILL-/AUSWERTUNGSOBJEKTE — die möglichen Sprungpunkte auf Ebene 4.
//  Ein Berichtsknoten bietet NUR die fachlich sinnvollen Perspektiven an
//  (z. B. Verkauf: Artikel/Kunde/Verkaufsrechnung — NICHT Einkaufsrechnung).
// =========================================================================
export const DRILL = {
  artikel:          { name: 'Artikel', icon: '▦' },
  produkt:          { name: 'Produktgruppe', icon: '▣' },
  auftrag:          { name: 'Auftrag', icon: '▤' },
  kunde:            { name: 'Kunde', icon: '☺' },
  lieferant:        { name: 'Lieferant', icon: '⚙' },
  verkaufsrechnung: { name: 'Verkaufsrechnung', icon: '🧾' },
  einkaufsrechnung: { name: 'Einkaufsrechnung', icon: '🧾' },
  bestellung:       { name: 'Bestellung', icon: '📦' },
  profitcenter:     { name: 'Profit-Center', icon: '◉' },
  kostenstelle:     { name: 'Kostenstelle', icon: '◈' },
  konto:            { name: 'Konto', icon: '№' },
  lager:            { name: 'Lagerort', icon: '🏬' },
  kanal:            { name: 'Kanal', icon: '🛒' },
  kampagne:         { name: 'Kampagne', icon: '📣' },
  mitarbeiter:      { name: 'Mitarbeiter', icon: '👥' },
  maschine:         { name: 'Maschine/Linie', icon: '🛠' },
  tranche:          { name: 'Finanztranche', icon: '🏦' },
  standort:         { name: 'Standort', icon: '📍' }
}

export const drillName = (code) => DRILL[code]?.name || code
