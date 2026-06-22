// =========================================================================
//  DETAILBERICHTE — granulare Listen zum Validieren im Einzelfall.
//  Hub mit allen Listen; Artikel-/Auftragsliste mit Plausibilitätsprüfung:
//  auffällige Werte werden markiert, „nur Auffälligkeiten" filtert, Klick auf
//  eine Zeile öffnet die Befund-Karte (Sprung in die Detailprüfung).
// =========================================================================
import React, { useState, useEffect } from 'react'
import { LISTEN, LEGENDE, artikelliste, auftragsliste, warenverbrauchliste, leasingliste, retourenliste, rechnungsliste, kundenliste, produktliste, rechnungsposliste, bestellkanalliste, chargenliste, auftragsbestandliste, lieferantenliste, bestellliste, offenepostenliste, inventurliste, historie, sammelBefunde, befundStatistik, verknuepfungenFuer } from '../../core/detailberichte.js'
import { downloadCsv } from '../../core/export.js'
import { ladeBookmarks, addBookmark, loescheBookmark, ladeLetzte, merkeLetzte } from '../../core/bookmarks.js'
import { glossarFuer, ausfuehrlich } from '../../core/kpiGlossar.js'

// Eingebaute Spalten-Ansichten (Fokus-Presets) je Liste.
const PRESETS = {
  artikel: [
    { name: 'Bestände', sichtbar: ['sku', 'artikel', 'status', 'lbEff', 'gesp', 'kom', 'lbVerf', 'aktiv'] },
    { name: 'Preise & Marge', sichtbar: ['sku', 'artikel', 'vk', 'ek', 'marge', 'margePct'] },
    { name: 'Einkauf', sichtbar: ['sku', 'artikel', 'gruppe', 'ek', 'einkaeufer'] }
  ],
  auftrag: [
    { name: 'Mengen', sichtbar: ['datum', 'kunde', 'auftrag', 'ab', 'ae', 'aeb', 'aet', 'abs'] },
    { name: 'Werte', sichtbar: ['datum', 'kunde', 'auftrag', 'vk', 'mek', 'ue'] }
  ],
  warenverbrauch: [
    { name: 'Bestandsfluss', sichtbar: ['sku', 'artikel', 'anfangsbestand', 'zugang', 'abgang', 'endbestand'] },
    { name: 'Verbrauch vs. Umsatz', sichtbar: ['sku', 'artikel', 'abgang', 'verbrauch', 'umsatzMenge'] }
  ],
  leasing: [
    { name: 'Nur Anzeigewert', sichtbar: ['vorgang', 'kunde', 'auftrag', 'anzeigeWert', 'fuehrend'] },
    { name: 'Alle Belege', sichtbar: ['vorgang', 'kunde', 'angebotW', 'kundeW', 'gesellW', 'anzeigeWert', 'fuehrend'] }
  ],
  retoure: [{ name: 'Kompakt', sichtbar: ['retoure', 'datum', 'kunde', 'wert', 'grund'] }],
  rechnung: [
    { name: 'Beträge', sichtbar: ['rechnung', 'datum', 'kunde', 'netto', 'mwst', 'brutto'] },
    { name: 'Zahlung', sichtbar: ['rechnung', 'kunde', 'brutto', 'bezahlt', 'status'] }
  ],
  kunde: [
    { name: 'Risiko', sichtbar: ['kundennr', 'name', 'offeneForderung', 'kreditlimit', 'status'] },
    { name: 'Kontakt', sichtbar: ['kundennr', 'name', 'email', 'land'] }
  ],
  produkt: [
    { name: 'Stammdaten', sichtbar: ['sku', 'name', 'gruppe', 'marke', 'status'] },
    { name: 'Preis & Versand', sichtbar: ['sku', 'name', 'vkBrutto', 'steuersatz', 'gewicht'] }
  ],
  rechnungpos: [{ name: 'Beträge', sichtbar: ['rechnung', 'pos', 'artikel', 'menge', 'einzelpreis', 'netto'] }],
  bestellkanal: [
    { name: 'Quoten', sichtbar: ['kanal', 'retourenQuote', 'stornoQuote'] },
    { name: 'Umsatz', sichtbar: ['kanal', 'bestellungen', 'umsatz', 'avgWarenkorb'] }
  ],
  charge: [{ name: 'MHD-Fokus', sichtbar: ['charge', 'artikel', 'menge', 'mhd', 'gesperrt'] }],
  auftragsbestand: [
    { name: 'Offene Mengen', sichtbar: ['auftrag', 'kunde', 'bestellt', 'geliefert', 'offen', 'liefertermin'] },
    { name: 'Werte', sichtbar: ['auftrag', 'kunde', 'offen', 'wert'] }
  ],
  lieferant: [
    { name: 'Qualität', sichtbar: ['lieferantNr', 'name', 'reklamationsQuote', 'lieferzeitTage', 'bewertung'] },
    { name: 'Status', sichtbar: ['lieferantNr', 'name', 'land', 'offeneBestellungen', 'status'] }
  ],
  bestellung: [
    { name: 'Status & Termin', sichtbar: ['bestellung', 'lieferant', 'artikel', 'status', 'liefertermin'] },
    { name: 'Werte', sichtbar: ['bestellung', 'sku', 'menge', 'ekPreis', 'wert'] }
  ],
  offeneposten: [
    { name: 'Mahnwesen', sichtbar: ['beleg', 'kunde', 'betrag', 'faellig', 'mahnstufe', 'status'] },
    { name: 'Bezug', sichtbar: ['beleg', 'kunde', 'rechnung', 'betrag'] }
  ],
  inventur: [
    { name: 'Differenzen', sichtbar: ['zaehlung', 'artikel', 'buchbestand', 'zaehlbestand', 'differenz'] },
    { name: 'Wert', sichtbar: ['zaehlung', 'artikel', 'lagerort', 'wertDifferenz'] }
  ]
}

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const inp = { padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13 }
const eur = (v) => v == null ? '' : v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v) => v == null ? '' : v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
const datum = (s) => s ? s.split('-').reverse().join('.') : ''
const SCHWERE = { fehler: { farbe: 'var(--amp-r)', soft: 'var(--amp-r-soft)', icon: '🔴', label: 'Fehler' }, warnung: { farbe: 'var(--amp-a)', soft: 'var(--amp-a-soft)', icon: '🟠', label: 'Warnung' }, hinweis: { farbe: 'var(--muted)', soft: 'var(--bg)', icon: '🔵', label: 'Hinweis' } }

const ART_COLS = [
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel (Detailliert)', al: 'left' },
  { key: 'status', label: 'Status', al: 'left' },
  { key: 'gruppe', label: 'Gruppe', al: 'left' },
  { key: 'lbEff', label: 'LB Eff', al: 'right' },
  { key: 'gesp', label: 'GESP', al: 'right' },
  { key: 'kom', label: 'KOM', al: 'right' },
  { key: 'lbVerf', label: 'LB Verf', al: 'right' },
  { key: 'ae', label: 'AE', al: 'right' },
  { key: 'fc', label: 'FC', al: 'right' },
  { key: 'vk', label: 'VK €', al: 'right', fmt: eur },
  { key: 'ek', label: 'EK €', al: 'right', fmt: eur },
  { key: 'marge', label: 'Marge €', al: 'right', fmt: eur },
  { key: 'margePct', label: 'Marge %', al: 'right', fmt: pct },
  { key: 'einkaeufer', label: 'Einkäufer', al: 'left' },
  { key: 'aktiv', label: 'Aktiv', al: 'center', fmt: (v) => (v ? 'Ja' : 'Nein') }
]
const ART_SUM = ['lbEff', 'gesp', 'kom', 'lbVerf', 'ae', 'fc']

const AUF_COLS = [
  { key: 'datum', label: 'Bestelldatum', al: 'left', fmt: datum },
  { key: 'kunde', label: 'Kunde', al: 'left' },
  { key: 'auftrag', label: 'Auftrag', al: 'left', mono: true },
  { key: 'status', label: 'Status', al: 'left' },
  { key: 'ab', label: 'Σ AB', al: 'right' },
  { key: 'vk', label: 'Σ VK', al: 'right' },
  { key: 'ae', label: 'Σ AE', al: 'right' },
  { key: 'aeb', label: 'Σ AEB', al: 'right' },
  { key: 'ret', label: 'Σ RET', al: 'right' },
  { key: 'aet', label: 'Σ AET', al: 'right' },
  { key: 'mek', label: 'Σ MEK', al: 'right' },
  { key: 'abs', label: 'ABS', al: 'right' },
  { key: 'ue', label: 'Σ UE', al: 'right', fmt: eur }
]
const AUF_SUM = ['ab', 'vk', 'ae', 'aeb', 'ret', 'aet', 'mek', 'abs', 'ue']

const WV_COLS = [
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel', al: 'left' },
  { key: 'gruppe', label: 'Gruppe', al: 'left' },
  { key: 'anfangsbestand', label: 'Anf.-Bestand', al: 'right' },
  { key: 'zugang', label: 'Zugang', al: 'right' },
  { key: 'abgang', label: 'Abgang', al: 'right' },
  { key: 'endbestand', label: 'End-Bestand', al: 'right' },
  { key: 'verbrauch', label: 'Verbrauch', al: 'right' },
  { key: 'umsatzMenge', label: 'Ums.-Menge', al: 'right' },
  { key: 'einkaeufer', label: 'Einkäufer', al: 'left' }
]
const WV_SUM = ['anfangsbestand', 'zugang', 'abgang', 'endbestand', 'verbrauch', 'umsatzMenge']

const LEAS_COLS = [
  { key: 'vorgang', label: 'Vorgang', al: 'left', mono: true },
  { key: 'kunde', label: 'Kunde', al: 'left' },
  { key: 'auftrag', label: 'Auftrag', al: 'left', mono: true },
  { key: 'angebotW', label: 'Angebot Leasing', al: 'right', fmt: eur },
  { key: 'kundeW', label: 'Kundenleasing', al: 'right', fmt: eur },
  { key: 'gesellW', label: 'Leasinggesellschaft', al: 'right', fmt: eur },
  { key: 'anzeigeWert', label: 'Anzeigewert (führend)', al: 'right', fmt: eur },
  { key: 'fuehrend', label: 'Führender Beleg', al: 'left' }
]
const LEAS_SUM = ['anzeigeWert']

const RET_COLS = [
  { key: 'retoure', label: 'Retoure', al: 'left', mono: true },
  { key: 'datum', label: 'Datum', al: 'left', fmt: datum },
  { key: 'kunde', label: 'Kunde', al: 'left' },
  { key: 'auftrag', label: 'Auftrag', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel', al: 'left' },
  { key: 'menge', label: 'Menge', al: 'right' },
  { key: 'wert', label: 'Wert €', al: 'right', fmt: eur },
  { key: 'originalWert', label: 'Orig.-Wert €', al: 'right', fmt: eur },
  { key: 'grund', label: 'Grund', al: 'left' }
]
const RET_SUM = ['menge', 'wert', 'originalWert']

const RECH_COLS = [
  { key: 'rechnung', label: 'Rechnung', al: 'left', mono: true },
  { key: 'datum', label: 'Datum', al: 'left', fmt: datum },
  { key: 'kunde', label: 'Kunde', al: 'left' },
  { key: 'auftrag', label: 'Auftrag', al: 'left', mono: true },
  { key: 'netto', label: 'Netto €', al: 'right', fmt: eur },
  { key: 'mwst', label: 'MwSt €', al: 'right', fmt: eur },
  { key: 'brutto', label: 'Brutto €', al: 'right', fmt: eur },
  { key: 'positionen', label: 'Pos.', al: 'right' },
  { key: 'bezahlt', label: 'Bezahlt', al: 'center', fmt: (v) => (v ? 'Ja' : 'Nein') },
  { key: 'status', label: 'Status', al: 'left' }
]
const RECH_SUM = ['netto', 'mwst', 'brutto']

const KUND_COLS = [
  { key: 'kundennr', label: 'Kunden-Nr', al: 'left', mono: true },
  { key: 'name', label: 'Name', al: 'left' },
  { key: 'email', label: 'E-Mail', al: 'left' },
  { key: 'land', label: 'Land', al: 'left' },
  { key: 'umsatzJahr', label: 'Umsatz/J €', al: 'right', fmt: eur },
  { key: 'offeneForderung', label: 'Offen €', al: 'right', fmt: eur },
  { key: 'kreditlimit', label: 'Limit €', al: 'right', fmt: eur },
  { key: 'status', label: 'Status', al: 'left' }
]
const KUND_SUM = ['umsatzJahr', 'offeneForderung', 'kreditlimit']

const PROD_COLS = [
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'name', label: 'Bezeichnung', al: 'left' },
  { key: 'gruppe', label: 'Gruppe', al: 'left' },
  { key: 'marke', label: 'Marke', al: 'left' },
  { key: 'ean', label: 'EAN', al: 'left', mono: true },
  { key: 'status', label: 'Status', al: 'left' },
  { key: 'vkBrutto', label: 'VK brutto €', al: 'right', fmt: eur },
  { key: 'steuersatz', label: 'USt %', al: 'right' },
  { key: 'gewicht', label: 'Gewicht kg', al: 'right' }
]
const PROD_SUM = ['vkBrutto', 'gewicht']

const RPOS_COLS = [
  { key: 'rechnung', label: 'Rechnung', al: 'left', mono: true },
  { key: 'pos', label: 'Pos', al: 'right' },
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel', al: 'left' },
  { key: 'menge', label: 'Menge', al: 'right' },
  { key: 'einzelpreis', label: 'Einzelpreis €', al: 'right', fmt: eur },
  { key: 'rabattPct', label: 'Rabatt %', al: 'right' },
  { key: 'netto', label: 'Netto €', al: 'right', fmt: eur },
  { key: 'mwst', label: 'MwSt €', al: 'right', fmt: eur }
]
const RPOS_SUM = ['menge', 'netto', 'mwst']

const KANAL_COLS = [
  { key: 'kanal', label: 'Kanal', al: 'left' },
  { key: 'bestellungen', label: 'Bestellungen', al: 'right' },
  { key: 'umsatz', label: 'Umsatz €', al: 'right', fmt: eur },
  { key: 'retourenQuote', label: 'Retouren %', al: 'right', fmt: pct },
  { key: 'stornoQuote', label: 'Storno %', al: 'right', fmt: pct },
  { key: 'avgWarenkorb', label: 'Ø Warenkorb €', al: 'right', fmt: eur }
]
const KANAL_SUM = ['bestellungen', 'umsatz']

const CHARGE_COLS = [
  { key: 'charge', label: 'Charge', al: 'left', mono: true },
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel', al: 'left' },
  { key: 'menge', label: 'Menge', al: 'right' },
  { key: 'mhd', label: 'MHD', al: 'left', fmt: datum },
  { key: 'wareneingang', label: 'Wareneingang', al: 'left', fmt: datum },
  { key: 'lieferant', label: 'Lieferant', al: 'left' },
  { key: 'gesperrt', label: 'QS-Sperre', al: 'center', fmt: (v) => (v ? 'gesperrt' : '') }
]
const CHARGE_SUM = ['menge']

const ABEST_COLS = [
  { key: 'auftrag', label: 'Auftrag', al: 'left', mono: true },
  { key: 'kunde', label: 'Kunde', al: 'left' },
  { key: 'datum', label: 'Datum', al: 'left', fmt: datum },
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel', al: 'left' },
  { key: 'bestellt', label: 'Bestellt', al: 'right' },
  { key: 'geliefert', label: 'Geliefert', al: 'right' },
  { key: 'offen', label: 'Offen', al: 'right' },
  { key: 'wert', label: 'Offen-Wert €', al: 'right', fmt: eur },
  { key: 'liefertermin', label: 'Liefertermin', al: 'left', fmt: datum }
]
const ABEST_SUM = ['bestellt', 'geliefert', 'offen', 'wert']

const LIEF_COLS = [
  { key: 'lieferantNr', label: 'Lief.-Nr', al: 'left', mono: true },
  { key: 'name', label: 'Name', al: 'left' },
  { key: 'land', label: 'Land', al: 'left' },
  { key: 'lieferzeitTage', label: 'Lieferzeit (Tage)', al: 'right' },
  { key: 'reklamationsQuote', label: 'Reklamation %', al: 'right', fmt: pct },
  { key: 'offeneBestellungen', label: 'Offene Best.', al: 'right' },
  { key: 'bewertung', label: 'Bewertung', al: 'center' },
  { key: 'status', label: 'Status', al: 'left' }
]
const LIEF_SUM = ['offeneBestellungen']

const BEST_COLS = [
  { key: 'bestellung', label: 'Bestellung', al: 'left', mono: true },
  { key: 'datum', label: 'Datum', al: 'left', fmt: datum },
  { key: 'lieferant', label: 'Lieferant', al: 'left' },
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel', al: 'left' },
  { key: 'menge', label: 'Menge', al: 'right' },
  { key: 'ekPreis', label: 'EK-Preis €', al: 'right', fmt: eur },
  { key: 'wert', label: 'Wert €', al: 'right', fmt: eur },
  { key: 'status', label: 'Status', al: 'left' },
  { key: 'liefertermin', label: 'Liefertermin', al: 'left', fmt: datum }
]
const BEST_SUM = ['menge', 'wert']

const OP_COLS = [
  { key: 'beleg', label: 'Beleg', al: 'left', mono: true },
  { key: 'kunde', label: 'Kunde', al: 'left' },
  { key: 'rechnung', label: 'Rechnung', al: 'left', mono: true },
  { key: 'betrag', label: 'Betrag €', al: 'right', fmt: eur },
  { key: 'faellig', label: 'Fällig', al: 'left', fmt: datum },
  { key: 'bezahltAm', label: 'Bezahlt am', al: 'left', fmt: datum },
  { key: 'mahnstufe', label: 'Mahnstufe', al: 'right' },
  { key: 'status', label: 'Status', al: 'left' }
]
const OP_SUM = ['betrag']

const INV_COLS = [
  { key: 'zaehlung', label: 'Zählung', al: 'left', mono: true },
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel', al: 'left' },
  { key: 'lagerort', label: 'Lagerort', al: 'left', mono: true },
  { key: 'buchbestand', label: 'Buchbestand', al: 'right' },
  { key: 'zaehlbestand', label: 'Zählbestand', al: 'right' },
  { key: 'differenz', label: 'Differenz', al: 'right' },
  { key: 'wertDifferenz', label: 'Wert-Diff. €', al: 'right', fmt: eur }
]
const INV_SUM = ['buchbestand', 'zaehlbestand', 'differenz', 'wertDifferenz']

// Sammel-Plausi-Cockpit: alle Befunde aller Listen gebündelt, filterbar, mit Absprung.
function Cockpit({ onBack, onOpen }) {
  const [fSchwere, setFSchwere] = useState(null)
  const [fListe, setFListe] = useState(null)
  const stat = befundStatistik()
  let items = sammelBefunde()
  if (fSchwere) items = items.filter((i) => i.schwere === fSchwere)
  if (fListe) items = items.filter((i) => i.listId === fListe)

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <button onClick={onBack} style={{ ...inp, cursor: 'pointer', marginBottom: 12 }}>← Detailberichte</button>
      <h2 style={{ margin: '0 0 4px' }}>🩺 Sammel-Plausi-Cockpit</h2>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>Alle Befunde aus {stat.proListe.length} Listen an einem Ort. Klick auf eine Zeile springt in die jeweilige Liste.</div>

      {/* Kennzahl-Kacheln je Schwere (klickbar als Filter) */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        {['fehler', 'warnung', 'hinweis'].map((s) => {
          const an = fSchwere === s
          return (
            <button key={s} onClick={() => setFSchwere(an ? null : s)}
              style={{ ...card, padding: '12px 16px', cursor: 'pointer', minWidth: 130, textAlign: 'left', borderColor: an ? SCHWERE[s].farbe : 'var(--line)', background: an ? SCHWERE[s].soft : 'var(--panel)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: SCHWERE[s].farbe }}>{stat.proSchwere[s]}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{SCHWERE[s].icon} {SCHWERE[s].label}</div>
            </button>
          )
        })}
        <div style={{ ...card, padding: '12px 16px', minWidth: 110 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{stat.gesamt}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>gesamt</div>
        </div>
      </div>

      {/* Filter je Liste */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <button onClick={() => setFListe(null)} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${!fListe ? 'var(--accent)' : 'var(--line)'}`, background: !fListe ? 'var(--accent-soft)' : 'var(--panel)', color: !fListe ? 'var(--accent)' : 'var(--ink)' }}>Alle Listen</button>
        {stat.proListe.map((l) => {
          const an = fListe === l.id
          return (
            <button key={l.id} onClick={() => setFListe(an ? null : l.id)} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--ink)' }}>
              {l.name} <b>{l.gesamt}</b>
            </button>
          )
        })}
      </div>

      {/* Befundtabelle */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Schwere', 'Liste', 'Datensatz', 'Befund'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Keine Befunde für diesen Filter. 👍</td></tr>}
            {items.map((it, i) => (
              <tr key={i} onClick={() => onOpen(it.listId, String(it.id))} title={`In ${it.listName} öffnen`} style={{ cursor: 'pointer', borderLeft: `3px solid ${SCHWERE[it.schwere].farbe}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-soft)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', color: SCHWERE[it.schwere].farbe, fontWeight: 700 }}>{SCHWERE[it.schwere].icon} {SCHWERE[it.schwere].label}</td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{it.listName}</td>
                <td className="mono" style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' }}>{it.id}<span style={{ color: 'var(--muted)' }}>{it.titel ? ' · ' + it.titel : ''}</span></td>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)' }}>{it.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Detailberichte({ startListe = null }) {
  const [aktiv, setAktiv] = useState(startListe)
  const [drillSuche, setDrillSuche] = useState('')
  // Liste öffnen (optional mit Vorfilter) — Basis für Cross-Drill & Cockpit.
  const oeffneListe = (t, s = '') => { setDrillSuche(s); setAktiv(t) }
  if (aktiv === 'artikel') return <Liste key={aktiv} typ="artikel" titel="Artikelliste" sub="Zeigt die SKU in einer Listen-Übersicht. Klick auf eine Zeile → Befund-Karte (inkl. E5-Historie)." cols={ART_COLS} sumKeys={ART_SUM} lade={artikelliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="sku" titelKey="artikel" />
  if (aktiv === 'auftrag') return <Liste key={aktiv} typ="auftrag" titel="Auftragsliste" sub="Zeigt die Aufträge in einer Listen-Übersicht." cols={AUF_COLS} sumKeys={AUF_SUM} lade={auftragsliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="auftrag" titelKey="kunde" />
  if (aktiv === 'plausiwv') return <Liste key={aktiv} typ="warenverbrauch" titel="Plausi: Warenverbrauch" sub="Prüft die Bestandsgleichung (Anfang + Zugang − Abgang = Ende) und findet unplausible Warenbewegungen." cols={WV_COLS} sumKeys={WV_SUM} lade={warenverbrauchliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="sku" titelKey="artikel" />
  if (aktiv === 'leasing') return <Liste key={aktiv} typ="leasing" titel="Leasingliste" sub="Entdopplung der 3 Belege (Angebot / Kundenleasing / Leasinggesellschaft): es zählt je Sicht genau EIN führender Wert — nie doppelt oder dreifach." cols={LEAS_COLS} sumKeys={LEAS_SUM} lade={leasingliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="vorgang" titelKey="kunde"
    optionen={[{ key: 'sicht', label: 'Sicht', default: 'auftrag', werte: [['auftrag', 'Auftragssicht (Kundenleasing führt)'], ['rechnung', 'Rechnungssicht (Leasinggesellschaft führt)']] }]} />
  if (aktiv === 'retoure') return <Liste key={aktiv} typ="retoure" titel="Retourenliste" sub="Retouren mit Plausi-Prüfung (Grund fehlt, Wert > Original, ohne Auftrag …)." cols={RET_COLS} sumKeys={RET_SUM} lade={retourenliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="retoure" titelKey="kunde" />
  if (aktiv === 'rechnung') return <Liste key={aktiv} typ="rechnung" titel="Rechnungsliste" sub="Rechnungen mit Plausi-Prüfung (Brutto ≠ Netto + MwSt, ohne Position, unbezahlt …)." cols={RECH_COLS} sumKeys={RECH_SUM} lade={rechnungsliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="rechnung" titelKey="kunde" />
  if (aktiv === 'kunde') return <Liste key={aktiv} typ="kunde" titel="Kundenliste" sub="Kunden mit Plausi-Prüfung (Kreditlimit überschritten, E-Mail, Umsatz …)." cols={KUND_COLS} sumKeys={KUND_SUM} lade={kundenliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="kundennr" titelKey="name" />
  if (aktiv === 'produkt') return <Liste key={aktiv} typ="produkt" titel="Produktliste" sub="Produktstammdaten mit Plausi (kein VK-Preis, EAN ungültig, gesperrt, Gewicht fehlt)." cols={PROD_COLS} sumKeys={PROD_SUM} lade={produktliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="sku" titelKey="name" />
  if (aktiv === 'rechnungpos') return <Liste key={aktiv} typ="rechnungpos" titel="Rechnungspositionsliste" sub="Einzelpositionen mit Plausi (Positionsnetto, Menge, hoher Rabatt)." cols={RPOS_COLS} sumKeys={RPOS_SUM} lade={rechnungsposliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="rechnung" titelKey="artikel" />
  if (aktiv === 'bestellkanal') return <Liste key={aktiv} typ="bestellkanal" titel="Bestellkanalliste" sub="Kanäle mit Plausi (hohe Retouren-/Stornoquote, Kanal ohne Bestellungen)." cols={KANAL_COLS} sumKeys={KANAL_SUM} lade={bestellkanalliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="kanal" titelKey="kanal" />
  if (aktiv === 'charge') return <Liste key={aktiv} typ="charge" titel="Chargenliste" sub="Chargen/MHD mit Plausi (MHD überschritten/bald, QS-Sperre, leere Charge)." cols={CHARGE_COLS} sumKeys={CHARGE_SUM} lade={chargenliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="charge" titelKey="artikel" />
  if (aktiv === 'auftragsbestand') return <Liste key={aktiv} typ="auftragsbestand" titel="Auftragsbestandsliste" sub="Offener Auftragsbestand mit Plausi (offene Menge inkonsistent, Liefertermin überschritten, Übermenge)." cols={ABEST_COLS} sumKeys={ABEST_SUM} lade={auftragsbestandliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="auftrag" titelKey="kunde" />
  if (aktiv === 'lieferant') return <Liste key={aktiv} typ="lieferant" titel="Lieferantenliste" sub="Lieferanten mit Plausi (hohe Reklamationsquote, lange Lieferzeit, gesperrt)." cols={LIEF_COLS} sumKeys={LIEF_SUM} lade={lieferantenliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="lieferantNr" titelKey="name" />
  if (aktiv === 'bestellung') return <Liste key={aktiv} typ="bestellung" titel="Bestellliste (Einkauf)" sub="Bestellungen mit Plausi (Menge ≤ 0, Bestellwert ≠ Menge×EK, Liefertermin überschritten)." cols={BEST_COLS} sumKeys={BEST_SUM} lade={bestellliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="bestellung" titelKey="artikel" />
  if (aktiv === 'offeneposten') return <Liste key={aktiv} typ="offeneposten" titel="Offene-Posten-Liste" sub="Debitoren-OP mit Plausi (höchste Mahnstufe, überfällig, Gutschrift)." cols={OP_COLS} sumKeys={OP_SUM} lade={offenepostenliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="beleg" titelKey="kunde" />
  if (aktiv === 'inventur') return <Liste key={aktiv} typ="inventur" titel="Inventurliste" sub="Inventur mit Plausi (negativer Buchbestand, Differenz inkonsistent, Inventurdifferenz)." cols={INV_COLS} sumKeys={INV_SUM} lade={inventurliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="zaehlung" titelKey="artikel" />

  if (aktiv === 'cockpit') return <Cockpit onBack={() => setAktiv(null)} onOpen={(id, suche) => oeffneListe(id, suche)} />

  // Hub
  const stat = befundStatistik()
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Detailberichte</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 640 }}>
          Granulare Listen für die Einzelfallprüfung — hier suchst du nach Falscheingaben und validierst Datenvorgänge
          (z. B. negativer Verfügbarbestand, negative Marge, gesperrte Bestände).
        </div>
      </div>

      {/* Einstieg ins Sammel-Plausi-Cockpit (alle Befunde gebündelt) */}
      <button onClick={() => setAktiv('cockpit')} style={{ ...card, width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 14, cursor: 'pointer',
        borderColor: stat.proSchwere.fehler ? SCHWERE.fehler.farbe : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>🩺 Sammel-Plausi-Cockpit</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Alle {stat.gesamt} Befunde aus allen Listen gebündelt — öffnen →</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['fehler', 'warnung', 'hinweis'].map((s) => (
            <span key={s} title={SCHWERE[s].label} style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 9px', borderRadius: 999, color: SCHWERE[s].farbe, background: SCHWERE[s].soft, whiteSpace: 'nowrap' }}>
              {SCHWERE[s].icon} {stat.proSchwere[s]}
            </span>
          ))}
        </div>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {LISTEN.map((l) => (
          <button key={l.id} disabled={!l.verfuegbar} onClick={() => l.verfuegbar && oeffneListe(l.id)}
            style={{ ...card, padding: '16px 14px', textAlign: 'left', cursor: l.verfuegbar ? 'pointer' : 'not-allowed', opacity: l.verfuegbar ? 1 : 0.5,
              borderColor: l.verfuegbar ? 'var(--accent)' : 'var(--line)' }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{l.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{l.verfuegbar ? 'Öffnen →' : 'in Vorbereitung'}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

const EBENEN_PFAD = ['E1 · Geschäftsführung', 'E2 · Fachbereich', 'E3 · Themenbereich', 'E4 · Details', 'E5 · Historisierung']

function Liste({ typ, titel, sub, cols, sumKeys, lade, onBack, onDrill, startSuche = '', idKey, titelKey, optionen = [] }) {
  const [suche, setSuche] = useState(startSuche)
  const [nurAuffaellig, setNurAuffaellig] = useState(false)
  const [legendeAuf, setLegendeAuf] = useState(false)
  const [detail, setDetail] = useState(null)
  const [opts, setOpts] = useState(() => Object.fromEntries(optionen.map((o) => [o.key, o.default])))
  const [sichtbar, setSichtbar] = useState(() => {
    const gemerkt = ladeLetzte(typ)
    const gueltig = gemerkt && gemerkt.filter((k) => cols.some((c) => c.key === k))
    return new Set(gueltig && gueltig.length ? gueltig : cols.map((c) => c.key))
  })
  const [panelAuf, setPanelAuf] = useState(true) // Auswahlfenster immer anzeigen (einklappbar)
  const [bmTick, setBmTick] = useState(0)
  const [hov, setHov] = useState(null)        // Spaltenkopf-Tooltip {key,x,y}
  const [infoKey, setInfoKey] = useState(null) // ausführliche KPI-Beschreibung
  const hideTimer = React.useRef(null)
  const zeigeHov = (e, key) => { if (!glossarFuer(key)) return; clearTimeout(hideTimer.current); const r = e.currentTarget.getBoundingClientRect(); setHov({ key, x: r.left, y: r.bottom }) }
  const planeHide = () => { clearTimeout(hideTimer.current); hideTimer.current = setTimeout(() => setHov(null), 160) }
  // Zuletzt genutzte Ansicht je Liste merken (Wiederherstellung beim Öffnen).
  useEffect(() => { merkeLetzte(typ, sichtbar) }, [sichtbar, typ])
  const data = lade({ suche, nurAuffaellig, ...opts })

  // Eingebaute + benutzerdefinierte Ansichten (Bookmarks).
  const builtin = [{ id: 'voll', name: 'Vollansicht', sichtbar: cols.map((c) => c.key), system: true }, ...(PRESETS[typ] || []).map((p, i) => ({ id: 'p' + i, ...p, system: true }))]
  const userBm = ladeBookmarks(typ)
  const bookmarks = [...builtin, ...userBm]
  const gleich = (arr) => arr.length === sichtbar.size && arr.every((k) => sichtbar.has(k))
  const wendeAn = (arr) => setSichtbar(new Set(arr.filter((k) => cols.some((c) => c.key === k))))
  const toggleSpalte = (key) => setSichtbar((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); if (n.size === 0) n.add(key); return n })
  const speichereAnsicht = () => { const name = prompt('Name für diese Ansicht (Bookmark):'); if (name && name.trim()) { addBookmark(typ, name, [...sichtbar]); setBmTick((t) => t + 1) } }
  const loesche = (id) => { loescheBookmark(typ, id); setBmTick((t) => t + 1) }
  const sichtCols = cols.filter((c) => sichtbar.has(c.key))
  // CSV-Export der aktuellen Ansicht: nur sichtbare Spalten + Befundspalte.
  const exportCsv = () => {
    const kopf = [...sichtCols.map((c) => c.label), 'Befund']
    const zeilen = data.rows.map((r) => [...sichtCols.map((c) => (c.fmt ? c.fmt(r[c.key]) : r[c.key] ?? '')), r.befunde.map((b) => b.text).join(' | ')])
    downloadCsv(`${typ}_${nurAuffaellig ? 'auffaellig' : 'ansicht'}`, [kopf, ...zeilen])
  }

  const zelle = (row, c) => {
    const dimmed = row._dim?.includes(c.key)
    const befund = !dimmed && row.befunde.find((b) => b.feld === c.key)
    const v = row[c.key]
    const text = c.fmt ? c.fmt(v) : v
    return (
      <td key={c.key} title={dimmed ? 'ignoriert (Dublette – nicht führend)' : befund ? befund.text : undefined}
        className={c.mono || c.al === 'right' ? 'mono' : undefined}
        style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: c.al, whiteSpace: c.key === 'artikel' || c.key === 'kunde' ? 'normal' : 'nowrap',
          maxWidth: c.key === 'artikel' ? 280 : undefined, overflow: 'hidden', textOverflow: 'ellipsis',
          background: befund ? SCHWERE[befund.schwere].soft : undefined,
          color: dimmed ? 'var(--muted)' : befund ? SCHWERE[befund.schwere].farbe : undefined,
          textDecoration: dimmed ? 'line-through' : undefined, opacity: dimmed ? 0.55 : 1,
          fontWeight: befund || c.key === 'anzeigeWert' ? 700 : 400 }}>
        {text}{befund ? ' ⚠' : ''}
      </td>
    )
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button onClick={onBack} title="Zurück" style={{ ...inp, cursor: 'pointer', padding: '6px 11px' }}>←</button>
        <div>
          <h2 style={{ margin: 0 }}>Business Report — {titel}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{sub}</div>
        </div>
      </div>
      {/* 5-Ebenen-Transparenz: diese Liste ist Ebene 4, E5-Historie je Zeile. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 2px' }}>
        {EBENEN_PFAD.map((e, i) => (
          <span key={e} style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999,
            background: i === 3 ? 'var(--accent)' : i === 4 ? 'var(--accent-soft)' : 'var(--bg)',
            color: i === 3 ? '#fff' : i === 4 ? 'var(--accent)' : 'var(--muted)', border: '1px solid var(--line)' }}>{e}</span>
        ))}
      </div>

      {/* Sichten-Umschalter (z. B. Leasing: Auftrag/Rechnung) */}
      {optionen.map((o) => (
        <div key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{o.label}:</span>
          <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {o.werte.map(([val, lbl]) => (
              <button key={val} onClick={() => setOpts((s) => ({ ...s, [o.key]: val }))}
                style={{ padding: '6px 11px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: opts[o.key] === val ? 'var(--accent)' : 'var(--panel)', color: opts[o.key] === val ? '#fff' : 'var(--muted)' }}>{lbl}</button>
            ))}
          </div>
        </div>
      ))}

      {/* Filterleiste */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="🔎 SKU / Artikel / Kunde / Einkäufer …" style={{ ...inp, minWidth: 260, flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer', color: data.auffaellig ? 'var(--amp-r)' : 'var(--muted)' }}>
          <input type="checkbox" checked={nurAuffaellig} onChange={(e) => setNurAuffaellig(e.target.checked)} />
          ⚠ nur Auffälligkeiten ({data.auffaellig})
        </label>
        <button onClick={() => setLegendeAuf((v) => !v)} style={{ ...inp, cursor: 'pointer', fontSize: 12 }}>Legende {legendeAuf ? '▴' : '▾'}</button>
        <button onClick={() => setPanelAuf((v) => !v)} title="Spalten ein-/ausblenden & Ansichten (Bookmarks)"
          style={{ ...inp, cursor: 'pointer', fontSize: 12, fontWeight: 600, borderColor: panelAuf ? 'var(--accent)' : 'var(--line)', color: panelAuf ? 'var(--accent)' : 'var(--ink)' }}>
          🔖 Spalten &amp; Ansichten ({sichtCols.length}/{cols.length})
        </button>
        <button onClick={exportCsv} title="Aktuelle Ansicht als CSV/Excel exportieren" style={{ ...inp, cursor: 'pointer', fontSize: 12 }}>⤓ CSV</button>
      </div>

      {/* Bookmark-/Spalten-Panel (auf-/zuklappbar wie das Burger-Menü) */}
      {panelAuf && (
        <div style={{ ...card, padding: 14, marginBottom: 12 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Ansichten (Bookmarks)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {bookmarks.map((b) => {
              const aktiv = gleich(b.sichtbar)
              return (
                <span key={b.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, padding: '4px 6px 4px 11px', borderRadius: 999, cursor: 'pointer',
                  border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent-soft)' : 'var(--panel)', color: aktiv ? 'var(--accent)' : 'var(--ink)' }}>
                  <span onClick={() => wendeAn(b.sichtbar)}>{b.system ? '' : '🔖 '}{b.name}</span>
                  {!b.system && <button onClick={() => loesche(b.id)} title="Bookmark löschen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, lineHeight: 1 }}>×</button>}
                </span>
              )
            })}
            <button onClick={speichereAnsicht} style={{ ...inp, padding: '4px 11px', cursor: 'pointer', fontSize: 12.5, borderStyle: 'dashed' }}>＋ Aktuelle Ansicht speichern</button>
          </div>

          <div style={{ ...cap, margin: '12px 0 8px' }}>Spalten ein-/ausblenden</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {cols.map((c) => {
              const an = sichtbar.has(c.key)
              return (
                <button key={c.key} onClick={() => toggleSpalte(c.key)}
                  style={{ fontSize: 12, padding: '4px 9px', borderRadius: 999, cursor: 'pointer',
                    border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--muted)' }}>
                  {an ? '✓ ' : '＋ '}{c.label}
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>Deine Spaltenauswahl wird je Liste gemerkt und beim nächsten Öffnen wiederhergestellt.</div>
        </div>
      )}

      {legendeAuf && (
        <div style={{ ...card, padding: 12, marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2px 16px' }}>
          {LEGENDE.map(([abk, text]) => (
            <div key={abk} style={{ fontSize: 12 }}><b className="mono">{abk}</b> <span style={{ color: 'var(--muted)' }}>= {text}</span></div>
          ))}
        </div>
      )}

      {/* Tabelle */}
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 1000 }}>
          <thead><tr>{sichtCols.map((c) => {
            const g = glossarFuer(c.key)
            return (
              <th key={c.key} onMouseEnter={(e) => zeigeHov(e, c.key)} onMouseLeave={planeHide}
                style={{ position: 'sticky', top: 0, background: 'var(--panel)', textAlign: c.al, padding: '8px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: g ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap', cursor: g ? 'help' : 'default' }}>
                {c.label}{g ? <span style={{ marginLeft: 3, fontSize: 9, opacity: 0.8 }}>ⓘ</span> : ''}
              </th>
            )
          })}<th style={{ padding: '8px 9px', borderBottom: '2px solid var(--line)' }} /></tr></thead>
          <tbody>
            {data.rows.length === 0 && <tr><td colSpan={sichtCols.length + 1} style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Keine Treffer.</td></tr>}
            {data.rows.map((row, i) => (
              <tr key={row[idKey] + i} onClick={() => setDetail(row)} style={{ cursor: 'pointer',
                borderLeft: `3px solid ${row.schwere ? SCHWERE[row.schwere].farbe : 'transparent'}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                {sichtCols.map((c) => zelle(row, c))}
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>{row.schwere ? SCHWERE[row.schwere].icon : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, background: 'var(--bg)' }}>
              {sichtCols.map((c, i) => (
                <td key={c.key} className={c.al === 'right' ? 'mono' : undefined} style={{ padding: '8px 9px', borderTop: '2px solid var(--line)', textAlign: c.al }}>
                  {i === 0 ? 'Gesamt' : sumKeys.includes(c.key) ? (data.summe[c.key]?.toLocaleString('de-DE')) : ''}
                </td>
              ))}<td style={{ borderTop: '2px solid var(--line)' }} />
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>{data.rows.length} von {data.gesamt} Zeilen · {data.auffaellig} auffällig · Klick auf eine Zeile öffnet die Befund-Karte.</div>

      {detail && <BefundModal typ={typ} row={detail} cols={cols} idKey={idKey} titelKey={titelKey} onClose={() => setDetail(null)} onDrill={onDrill} />}

      {/* KPI-Tooltip am Spaltenkopf: Vollname + Kurzerläuterung + Link */}
      {hov && glossarFuer(hov.key) && (
        <div onMouseEnter={() => clearTimeout(hideTimer.current)} onMouseLeave={planeHide}
          style={{ position: 'fixed', left: Math.min(hov.x, window.innerWidth - 320), top: hov.y + 6, zIndex: 95, width: 300, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', boxShadow: '0 10px 30px rgba(0,0,0,.18)', padding: '11px 13px' }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{glossarFuer(hov.key).name}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 8px' }}>{glossarFuer(hov.key).kurz}</div>
          {glossarFuer(hov.key).formelText && <div className="mono" style={{ fontSize: 11, background: 'var(--bg)', borderRadius: 4, padding: '4px 7px', marginBottom: 8 }}>{glossarFuer(hov.key).formelText}</div>}
          <button onClick={() => { setInfoKey(hov.key); setHov(null) }} style={{ border: 'none', background: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0 }}>Ausführliche Beschreibung →</button>
        </div>
      )}
      {infoKey && <GlossarModal eintrag={ausfuehrlich(infoKey)} onBack={() => setInfoKey(null)} />}
    </div>
  )
}

// Ausführliche KPI-/Spaltenbeschreibung mit Rücksprung.
function GlossarModal({ eintrag, onBack }) {
  if (!eintrag) return null
  const e = eintrag
  return (
    <div onClick={onBack} style={{ position: 'fixed', inset: 0, zIndex: 96, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(ev) => ev.stopPropagation()} style={{ width: 520, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', background: 'var(--panel)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', border: '1px solid var(--line)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} title="Zurück" style={{ ...inp, cursor: 'pointer', padding: '5px 10px' }}>←</button>
          <div>
            <div style={{ ...cap }}>KPI-Beschreibung</div>
            <h3 style={{ margin: '2px 0 0', fontSize: 17 }}>{e.name}</h3>
          </div>
        </div>
        <div style={{ padding: 18, fontSize: 13.5, lineHeight: 1.55 }}>
          <div style={{ marginBottom: 12 }}>{e.lang}</div>
          {e.formelText && <div style={{ marginBottom: 12 }}><div style={{ ...cap, marginBottom: 4 }}>Berechnung</div><div className="mono" style={{ background: 'var(--bg)', borderRadius: 6, padding: '8px 11px' }}>{e.formelText}</div></div>}
          {e.kpi && (
            <div style={{ marginTop: 6, padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', border: '1px solid var(--line)' }}>
              <div style={{ ...cap, marginBottom: 4, color: 'var(--accent)' }}>Verknüpfte Kennzahl · {e.kpi.id}</div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{e.kpi.name}</div>
              <div style={{ marginBottom: 8 }}>{e.kpi.beschreibung}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
                <span>Einheit: <b>{e.kpi.einheit}</b></span>
                {e.kpi.ziel != null && <span>Ziel: <b>{e.kpi.ziel}</b></span>}
                <span>Richtung: <b>{e.kpi.richtung === 'hoch_gut' ? 'höher = besser' : e.kpi.richtung === 'tief_gut' ? 'niedriger = besser' : '—'}</b></span>
                {e.kpi.abhaengig.length > 0 && <span>Abhängig von: <b>{e.kpi.abhaengig.join(', ')}</b></span>}
              </div>
            </div>
          )}
          <button onClick={onBack} style={{ marginTop: 16, ...inp, cursor: 'pointer', fontWeight: 600 }}>← Zurück zur Liste</button>
        </div>
      </div>
    </div>
  )
}

function BefundModal({ typ, row, cols, idKey, titelKey, onClose, onDrill }) {
  const hist = historie(typ, row)
  const links = verknuepfungenFuer(typ, row)
  const maxB = hist.kind === 'chart' ? Math.max(...hist.punkte.map((h) => h.wert), 1) : 0
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', background: 'var(--panel)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', border: '1px solid var(--line)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{row[idKey]}</div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17 }}>{row[titelKey]}</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>
        <div style={{ padding: 18 }}>
          {row.befunde.length === 0
            ? <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--amp-g-soft)', color: 'var(--amp-g)', fontSize: 13, fontWeight: 600 }}>✓ Keine Auffälligkeiten — Daten plausibel.</div>
            : (
              <>
                <div style={{ ...cap, marginBottom: 8 }}>Befunde ({row.befunde.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                  {row.befunde.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: SCHWERE[b.schwere].soft }}>
                      <span>{SCHWERE[b.schwere].icon}</span>
                      <div><div style={{ fontWeight: 600, fontSize: 13, color: SCHWERE[b.schwere].farbe }}>{b.text}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Feld: {b.feld} · {b.schwere}</div></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          {/* Referenzielle Verknüpfungen (Cross-Drill in verwandte Listen) */}
          {onDrill && links.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...cap, marginBottom: 6 }}>🔗 Verknüpfungen</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {links.map((l) => (
                  <button key={l.ziel + l.label} onClick={() => { onClose(); onDrill(l.ziel, l.suche) }}
                    title={`${l.anzahl} Treffer in ${l.zielName} (gefiltert auf „${l.suche}")`}
                    style={{ fontSize: 12.5, padding: '5px 11px', borderRadius: 999, cursor: 'pointer', border: '1px solid var(--accent)', background: 'var(--panel)', color: 'var(--accent)', fontWeight: 600 }}>
                    {l.label} <span style={{ background: 'var(--accent-soft)', borderRadius: 999, padding: '0 6px', fontSize: 11 }}>{l.anzahl}</span> →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ebene 5 · Historisierung */}
          <div style={{ ...cap, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 4, padding: '1px 6px' }}>E5</span> Historisierung
          </div>
          {hist.kind === 'chart' ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
                {hist.punkte.map((h) => (
                  <div key={h.label} title={`${h.label}: ${h.wert}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.wert}</div>
                    <div style={{ width: '100%', height: `${h.wert / maxB * 48}px`, minHeight: 2, background: 'var(--accent)', borderRadius: '3px 3px 0 0' }} />
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{hist.einheit} · letzte 6 Monate.</div>
            </div>
          ) : (
            <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {hist.punkte.map((h, i) => (
                <React.Fragment key={h.label + i}>
                  <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: h.warn ? 'var(--amp-r-soft)' : 'var(--accent-soft)', color: h.warn ? 'var(--amp-r)' : 'var(--accent)', fontWeight: 600 }}>
                    {h.label}<span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {datum(h.datum)}</span>
                  </span>
                  {i < hist.punkte.length - 1 && <span style={{ alignSelf: 'center', color: 'var(--muted)' }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          <div style={{ ...cap, marginBottom: 6 }}>Alle Werte (E4)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 14px' }}>
            {cols.map((c) => (
              <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--muted)' }}>{c.label}</span>
                <span className="mono" style={{ fontWeight: row.befunde.some((b) => b.feld === c.key) ? 700 : 400, color: row.befunde.some((b) => b.feld === c.key) ? 'var(--amp-r)' : 'var(--ink)' }}>{c.fmt ? c.fmt(row[c.key]) : String(row[c.key])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
