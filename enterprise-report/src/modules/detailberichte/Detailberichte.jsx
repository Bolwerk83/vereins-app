// =========================================================================
//  DETAILBERICHTE — granulare Listen zum Validieren im Einzelfall.
//  Hub mit allen Listen; Artikel-/Auftragsliste mit Plausibilitätsprüfung:
//  auffällige Werte werden markiert, „nur Auffälligkeiten" filtert, Klick auf
//  eine Zeile öffnet die Befund-Karte (Sprung in die Detailprüfung).
// =========================================================================
import React, { useState, useEffect } from 'react'
import { LISTEN, LEGENDE, artikelliste, auftragsliste, warenverbrauchliste, leasingliste, retourenliste, rechnungsliste, kundenliste, produktliste, rechnungsposliste, bestellkanalliste, chargenliste, auftragsbestandliste, lieferantenliste, bestellliste, offenepostenliste, inventurliste, kontenliste, historie, sammelBefunde, befundStatistik, verknuepfungenFuer } from '../../core/detailberichte.js'
import { downloadCsv } from '../../core/export.js'
import { ladeBookmarks, addBookmark, loescheBookmark, ladeLetzte, merkeLetzte } from '../../core/bookmarks.js'
import { glossarFuer, ausfuehrlich } from '../../core/kpiGlossar.js'
import { ladeBemerkungen, addBemerkung, toggleErledigt, loescheBemerkung, aufgaben, PERSONEN } from '../../core/bemerkungen.js'
import { erkenntnisse } from '../../core/erkenntnisse.js'
import { preisvergleich } from '../../core/preisvergleich.js'
import { qualitaetUebersicht, qualitaetStats, setStatus, statusVon, ZUSTAND_LABEL } from '../../core/qualitaet.js'
import { radar } from '../../core/controllerRadar.js'
import { STRUKTUR, aggregiere, flach, alleIds } from '../../core/hierarchie.js'

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
  ],
  konto: [
    { name: 'Zuweisungen', sichtbar: ['kontoNr', 'bezeichnung', 'kostenart', 'kostenstelle', 'abstimmposition'] },
    { name: 'Abschluss', sichtbar: ['kontoNr', 'bezeichnung', 'klasse', 'guvBilanz', 'steuerschluessel', 'status'] }
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

const KONTO_COLS = [
  { key: 'kontoNr', label: 'Konto-Nr', al: 'left', mono: true },
  { key: 'bezeichnung', label: 'Bezeichnung', al: 'left' },
  { key: 'klasse', label: 'Klasse', al: 'right' },
  { key: 'guvBilanz', label: 'GuV/Bilanz', al: 'left' },
  { key: 'kostenart', label: 'Kostenart', al: 'left' },
  { key: 'kostenstelle', label: 'Kostenstelle', al: 'left', mono: true },
  { key: 'abstimmposition', label: 'Abstimmposition', al: 'left' },
  { key: 'steuerschluessel', label: 'Steuer', al: 'left' },
  { key: 'status', label: 'Status', al: 'left' },
  { key: 'saldo', label: 'Saldo €', al: 'right', fmt: eur }
]
const KONTO_SUM = ['saldo']

// Sammel-Plausi-Cockpit: alle Befunde aller Listen gebündelt, filterbar, mit Absprung.
function Cockpit({ onBack, onOpen }) {
  const [fSchwere, setFSchwere] = useState(null)
  const [fListe, setFListe] = useState(null)
  const stat = befundStatistik()
  let items = sammelBefunde()
  if (fSchwere) items = items.filter((i) => i.schwere === fSchwere)
  if (fListe) items = items.filter((i) => i.listId === fListe)

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
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

const AMPEL = { rot: 'var(--amp-r)', gelb: 'var(--amp-a)', blau: 'var(--accent)', gruen: 'var(--amp-g)' }

// Qualitätsdashboard: Datenqualität je Bereich + Status-Workflow je Befund
// (offen rot/gelb · in Bearbeitung blau · erledigt grün · Wiedervorlage) mit Log.
function Qualitaet({ onBack, onOpen }) {
  const [fBereich, setFBereich] = useState(null)
  const [fZustand, setFZustand] = useState(null)
  const [expand, setExpand] = useState(null)
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const stats = qualitaetStats()

  const zInfo = (it) => {
    if (it.wiedervorlage) return { key: 'wiedervorlage', label: 'Wiedervorlage', farbe: AMPEL.rot }
    if (it.zustand === 'bearbeitung') return { key: 'bearbeitung', label: 'In Bearbeitung', farbe: AMPEL.blau }
    if (it.zustand === 'erledigt') return { key: 'erledigt', label: 'Erledigt', farbe: AMPEL.gruen }
    return { key: 'offen', label: it.schwere === 'fehler' ? 'Offen (Fehler)' : 'Offen', farbe: it.schwere === 'fehler' ? AMPEL.rot : AMPEL.gelb }
  }
  let items = qualitaetUebersicht()
  if (fBereich) items = items.filter((i) => i.bereich === fBereich)
  if (fZustand) items = items.filter((i) => zInfo(i).key === fZustand)

  const erledigen = (id) => { const k = prompt('Erledigt — kurz kommentieren: Ursache / eingeleitete Maßnahme / Abschluss?'); if (k === null) return; setStatus(id, 'erledigt', { kommentar: k }); refresh() }
  const setze = (id, z) => { setStatus(id, z, {}); refresh() }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <button onClick={onBack} style={{ ...inp, cursor: 'pointer', marginBottom: 12 }}>← Detailberichte</button>
      <h2 style={{ margin: '0 0 4px' }}>✅ Qualitätsdashboard</h2>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>Alles grün = Daten sauber. Bei Auffälligkeiten (z. B. Artikelnummer statt Rechnung, extreme Abweichung) anklicken, Übeltäter im Vorsystem bereinigen oder Korrektur buchen, dann mit Kommentar abhaken. Am Folgetag wird neu geprüft — taucht der Fall erneut auf, zeigt das Log die Historie.</div>

      {/* Bereichskarten mit Ampel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 16 }}>
        {stats.proBereich.map((b) => {
          const an = fBereich === b.bereich
          return (
            <button key={b.bereich} onClick={() => setFBereich(an ? null : b.bereich)}
              style={{ ...card, padding: 14, cursor: 'pointer', textAlign: 'left', borderLeft: `4px solid ${AMPEL[b.ampel]}`, borderColor: an ? 'var(--accent)' : 'var(--line)', background: an ? 'var(--accent-soft)' : 'var(--panel)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: AMPEL[b.ampel], display: 'inline-block' }} />
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{b.bereich}</span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {b.offenFehler + b.offenWarnung > 0 && <span style={{ color: AMPEL.rot }}>{b.offenFehler + b.offenWarnung} offen</span>}
                {b.bearbeitung > 0 && <span style={{ color: AMPEL.blau }}>{b.bearbeitung} in Arbeit</span>}
                {b.wiedervorlage > 0 && <span style={{ color: AMPEL.rot }}>{b.wiedervorlage} Wiedervorl.</span>}
                {b.erledigt > 0 && <span style={{ color: AMPEL.gruen }}>{b.erledigt} erledigt</span>}
                {b.ampel === 'gruen' && b.bearbeitung === 0 && <span style={{ color: AMPEL.gruen }}>✓ sauber</span>}
              </div>
            </button>
          )
        })}
      </div>

      {/* Zustandsfilter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {[['', 'Alle'], ['offen', 'Offen'], ['bearbeitung', 'In Bearbeitung'], ['wiedervorlage', 'Wiedervorlage'], ['erledigt', 'Erledigt']].map(([k, l]) => {
          const an = (fZustand || '') === k
          return <button key={k} onClick={() => setFZustand(k || null)} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--ink)' }}>{l}</button>
        })}
        {fBereich && <button onClick={() => setFBereich(null)} style={{ fontSize: 12, padding: '4px 11px', borderRadius: 999, cursor: 'pointer', border: '1px dashed var(--line)', background: 'var(--panel)', color: 'var(--muted)' }}>Bereich „{fBereich}" ✕</button>}
      </div>

      {/* Befundliste mit Workflow */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {items.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--amp-g)', fontWeight: 600 }}>✓ Keine Qualitätsthemen für diesen Filter — alles sauber.</div> : items.map((it) => {
          const z = zInfo(it)
          const auf = expand === it.id
          return (
            <div key={it.id} style={{ borderBottom: '1px solid var(--line)', borderLeft: `4px solid ${z.farbe}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: z.farbe, minWidth: 110 }}>● {z.label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 130 }}>{it.bereich}</span>
                <span className="mono" style={{ fontSize: 12 }}>{it.listName} · {it.id}</span>
                <span style={{ fontSize: 12.5, flex: 1, minWidth: 200 }}>{it.text}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onOpen(it.listId, String(it.id))} title="Übeltäter ansehen" style={{ ...inp, padding: '4px 9px', cursor: 'pointer', fontSize: 12 }}>👁 Übeltäter</button>
                  {z.key !== 'bearbeitung' && z.key !== 'erledigt' && <button onClick={() => setze(it.id, 'bearbeitung')} style={{ padding: '4px 9px', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--accent)', cursor: 'pointer', fontSize: 12 }}>▶ In Arbeit</button>}
                  {z.key !== 'erledigt' && <button onClick={() => erledigen(it.id)} style={{ padding: '4px 9px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--amp-g)', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✓ Erledigt</button>}
                  {(z.key === 'erledigt' || z.key === 'bearbeitung') && <button onClick={() => setze(it.id, 'offen')} title="wieder öffnen" style={{ ...inp, padding: '4px 9px', cursor: 'pointer', fontSize: 12 }}>↺</button>}
                  {it.log.length > 0 && <button onClick={() => setExpand(auf ? null : it.id)} style={{ ...inp, padding: '4px 9px', cursor: 'pointer', fontSize: 12 }}>Log {it.log.length} {auf ? '▴' : '▾'}</button>}
                </span>
              </div>
              {auf && it.log.length > 0 && (
                <div style={{ padding: '4px 12px 12px 24px', background: 'var(--bg)' }}>
                  {it.log.map((g, i) => (
                    <div key={i} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                      <span className="mono" style={{ color: 'var(--muted)' }}>{new Date(g.ts).toLocaleString('de-DE')}</span> · <b>{g.aktor}</b> · {g.aktion}{g.kommentar ? <span style={{ color: 'var(--muted)' }}> — „{g.kommentar}"</span> : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Hierarchie-/Strukturbericht: auf-/zuklappbare Matrix (wie Power BI).
function Hierarchie({ onBack }) {
  const root = React.useMemo(() => aggregiere(STRUKTUR), [])
  const [offen, setOffen] = useState(() => new Set(['gesamt']))
  const [visuals, setVisuals] = useState(true)
  const rows = flach(root, offen)
  const toggle = (id) => setOffen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const cols = [
    { key: 'umsatz', label: 'Umsatz €', fmt: eur }, { key: 'db', label: 'DB €', fmt: eur },
    { key: 'dbProzent', label: 'DB %', fmt: (v) => pct(v) }, { key: 'anteil', label: 'Anteil %', fmt: (v) => pct(v), bar: true }, { key: 'menge', label: 'Menge', fmt: (v) => v.toLocaleString('de-DE') }
  ]
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <button onClick={onBack} style={{ ...inp, cursor: 'pointer', marginBottom: 12 }}>← Detailberichte</button>
      <h2 style={{ margin: '0 0 4px' }}>📂 Strukturbericht — Umsatz & Deckungsbeitrag</h2>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>Warenbereich → Warengruppe → Artikel. Zeilen mit ▸ auf-/zuklappen (wie eine Power-BI-Matrix); Elternwerte sind aggregiert.</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={() => setOffen(new Set(alleIds(STRUKTUR)))} style={{ ...inp, cursor: 'pointer', fontSize: 12 }}>⊞ Alle aufklappen</button>
        <button onClick={() => setOffen(new Set(['gesamt']))} style={{ ...inp, cursor: 'pointer', fontSize: 12 }}>⊟ Alle zuklappen</button>
        <button onClick={() => setVisuals((v) => !v)} style={{ ...inp, cursor: 'pointer', fontSize: 12, borderColor: visuals ? 'var(--accent)' : 'var(--line)', color: visuals ? 'var(--accent)' : 'var(--ink)' }}>📊 Visuals {visuals ? 'an' : 'aus'}</button>
      </div>
      <div style={{ ...card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>
            <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Struktur</th>
            {cols.map((c) => <th key={c.key} style={{ textAlign: 'right', padding: '8px 10px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{c.label}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => r.hatKinder && toggle(r.id)} style={{ cursor: r.hatKinder ? 'pointer' : 'default', background: r.tiefe === 0 ? 'var(--bg)' : undefined }}>
                <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', paddingLeft: 10 + r.tiefe * 20, fontWeight: r.hatKinder ? 700 : 400 }}>
                  <span style={{ display: 'inline-block', width: 16, color: 'var(--accent)' }}>{r.hatKinder ? (r.offen ? '▾' : '▸') : ''}</span>{r.name}
                </td>
                {cols.map((c) => {
                  const v = r[c.key]
                  const bar = visuals && c.bar
                  return (
                    <td key={c.key} className="mono" style={{ position: 'relative', padding: '7px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: r.hatKinder ? 600 : 400 }}>
                      {bar && <span aria-hidden style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: Math.max(2, v) + '%', background: 'var(--accent)', opacity: 0.13, borderRadius: 3 }} />}
                      <span style={{ position: 'relative' }}>{c.fmt(v)}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Controller-Radar: Ein-Klick-Analyse über alle Berichte, kritisch zuerst,
// mit Folgefehler-Erkennung (nur die Ursache wird gemeldet).
function Radar({ werte, onBack, onOpen }) {
  const [erg, setErg] = useState(null)
  const [openLog, setOpenLog] = useState(null)
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const erledige = (key) => { const k = prompt('Erledigt — kurz begründen: Ursache / Maßnahme / Abschluss?'); if (k === null) return; setStatus(key, 'erledigt', { kommentar: k }); refresh() }
  const setze = (key, z) => { let k = ''; if (z === 'bearbeitung') { k = prompt('In Bearbeitung — kurze Notiz (wer/was/warum):'); if (k === null) return } setStatus(key, z, { kommentar: k || '' }); refresh() }
  const mini = { ...inp, padding: '4px 9px', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }
  const Item = ({ x }) => {
    const st = statusVon(x.key)
    const zustand = st?.status || 'offen'
    const zf = zustand === 'erledigt' ? 'var(--amp-g)' : zustand === 'bearbeitung' ? 'var(--accent)' : SCHWERE[x.schwere].farbe
    const zl = zustand === 'erledigt' ? 'Erledigt' : zustand === 'bearbeitung' ? 'In Bearbeitung' : 'Offen'
    const auf = openLog === x.key
    return (
      <div style={{ borderBottom: '1px solid var(--line)', borderLeft: `4px solid ${zustand === 'erledigt' ? 'var(--amp-g)' : SCHWERE[x.schwere].farbe}`, opacity: zustand === 'erledigt' ? 0.72 : 1 }}>
        <div style={{ display: 'flex', gap: 12, padding: '11px 13px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: 16 }}>{x.art === 'KPI' ? '🎯' : SCHWERE[x.schwere].icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <b style={{ fontSize: 13.5 }}>{x.titel}</b>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{x.bereich} · {x.art}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: zf, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 999, padding: '1px 8px' }}>{zl}</span>
            </div>
            {x.text && <div style={{ fontSize: 12.5, marginTop: 2 }}>{x.text}</div>}
            {x.gruende && <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 12.5 }}>{x.gruende.map((g, i) => <li key={i} style={{ color: SCHWERE[g.schwere].farbe }}>{g.text}</li>)}</ul>}
            {x.wirktAuf?.length > 0 && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>↳ wirkt auf (Folgefehler): <b>{x.wirktAuf.join(', ')}</b></div>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {x.art === 'Detailliste' && <button onClick={() => onOpen(x.listId, String(x.id))} style={mini}>👁 Übeltäter</button>}
              {zustand !== 'bearbeitung' && zustand !== 'erledigt' && <button onClick={() => setze(x.key, 'bearbeitung')} style={{ ...mini, borderColor: 'var(--accent)', color: 'var(--accent)' }}>▶ In Arbeit</button>}
              {zustand !== 'erledigt' && <button onClick={() => erledige(x.key)} style={{ padding: '4px 9px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--amp-g)', color: '#fff', cursor: 'pointer', fontSize: 12 }}>✓ Erledigt</button>}
              {(zustand === 'erledigt' || zustand === 'bearbeitung') && <button onClick={() => setze(x.key, 'offen')} style={mini}>↺ Wieder öffnen</button>}
              {st?.log?.length > 0 && <button onClick={() => setOpenLog(auf ? null : x.key)} style={mini}>Log {st.log.length} {auf ? '▴' : '▾'}</button>}
            </div>
          </div>
        </div>
        {auf && st?.log?.length > 0 && (
          <div style={{ padding: '4px 12px 12px 40px', background: 'var(--bg)' }}>
            {st.log.map((g, i) => (
              <div key={i} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                <span className="mono" style={{ color: 'var(--muted)' }}>{new Date(g.ts).toLocaleString('de-DE')}</span> · <b>{g.aktor}</b> · {g.aktion}{g.kommentar ? <span style={{ color: 'var(--muted)' }}> — „{g.kommentar}"</span> : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <button onClick={onBack} style={{ ...inp, cursor: 'pointer', marginBottom: 12 }}>← Detailberichte</button>
      <h2 style={{ margin: '0 0 4px' }}>🎯 Controller-Radar</h2>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>Ein Klick wertet alle Berichte aus (Detaillisten + Kennzahlen), priorisiert die Auffälligkeiten — kritische zuerst — und erkennt Folgefehler über den Kennzahlen-Abhängigkeitsgraphen: gemeldet wird nur die Ursache.</div>

      {!erg ? (
        <div style={{ ...card, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧭</div>
          <button onClick={() => setErg(radar(werte))} style={{ padding: '13px 26px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Analyse starten →
          </button>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10 }}>Regelbasierte „KI"-Auswertung · erklärbar · der echte BI-Agent ist andockbar.</div>
        </div>
      ) : (
        <>
          <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '4px solid var(--accent)', background: 'var(--accent-soft)' }}>
            <div style={{ ...cap, marginBottom: 4, color: 'var(--accent)' }}>🤖 KI-Zusammenfassung · Stand {datum(erg.stand)}</div>
            <div style={{ fontSize: 13.5 }}>{erg.zusammenfassung}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: SCHWERE.fehler.farbe, background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>{erg.statistik.kritisch} kritisch</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: SCHWERE.warnung.farbe, background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>{erg.statistik.weitere} weitere</span>
              {erg.statistik.unterdrueckt > 0 && <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>{erg.statistik.unterdrueckt} Folgefehler ausgeblendet</span>}
              <button onClick={() => setErg(radar(werte))} style={{ ...inp, padding: '3px 10px', cursor: 'pointer', fontSize: 12 }}>↻ Neu auswerten</button>
            </div>
          </div>

          <div style={{ ...cap, margin: '0 0 6px', color: SCHWERE.fehler.farbe }}>🔴 Kritisch — zuerst prüfen ({erg.kritisch.length})</div>
          <div style={{ ...card, overflow: 'hidden', marginBottom: 16 }}>
            {erg.kritisch.length === 0 ? <div style={{ padding: 18, textAlign: 'center', color: 'var(--amp-g)', fontWeight: 600 }}>✓ Keine kritischen Punkte.</div> : erg.kritisch.map((x) => <Item key={x.key} x={x} />)}
          </div>

          <div style={{ ...cap, margin: '0 0 6px' }}>Weitere nach Priorität ({erg.weitere.length})</div>
          <div style={{ ...card, overflow: 'hidden' }}>
            {erg.weitere.map((x) => <Item key={x.key} x={x} />)}
          </div>
        </>
      )}
    </div>
  )
}

// Detaillisten nach Fachbereich gruppiert (Unterordner im Hub).
const KATEGORIEN = [
  { name: 'Finanzen & FiBu', ids: ['rechnung', 'rechnungpos', 'offeneposten', 'konto'] },
  { name: 'Bestand & Logistik', ids: ['artikel', 'produkt', 'charge', 'inventur', 'plausiwv'] },
  { name: 'Vertrieb & Auftrag', ids: ['auftrag', 'auftragsbestand', 'leasing', 'retoure', 'bestellkanal'] },
  { name: 'Einkauf', ids: ['bestellung', 'lieferant'] },
  { name: 'Stammdaten', ids: ['kunde'] }
]

export default function Detailberichte({ startListe = null, startSuche = '', werte = {} }) {
  const [aktiv, setAktiv] = useState(startListe)
  const [drillSuche, setDrillSuche] = useState(startSuche)
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
  if (aktiv === 'konto') return <Liste key={aktiv} typ="konto" titel="Kontenliste (DimKonto)" sub="Kontenstamm mit Zuweisungen (Kostenart, Kostenstelle, Abstimmposition, Steuer) + Plausi (Klassenkonflikt, fehlende Zuordnung, gesperrt mit Saldo)." cols={KONTO_COLS} sumKeys={KONTO_SUM} lade={kontenliste} onBack={() => oeffneListe(null)} onDrill={oeffneListe} startSuche={drillSuche} idKey="kontoNr" titelKey="bezeichnung" />

  if (aktiv === 'cockpit') return <Cockpit onBack={() => setAktiv(null)} onOpen={(id, suche) => oeffneListe(id, suche)} />
  if (aktiv === 'qualitaet') return <Qualitaet onBack={() => setAktiv(null)} onOpen={(id, suche) => oeffneListe(id, suche)} />
  if (aktiv === 'radar') return <Radar werte={werte} onBack={() => setAktiv(null)} onOpen={(id, suche) => oeffneListe(id, suche)} />
  if (aktiv === 'hierarchie') return <Hierarchie onBack={() => setAktiv(null)} />

  // Hub
  const stat = befundStatistik()
  const q = qualitaetStats().gesamt
  const cnt = Object.fromEntries(stat.proListe.map((l) => [l.id, l.gesamt]))
  const Tool = ({ on, titel, sub, kinder, primary }) => (
    <button onClick={on} style={{ ...card, padding: '13px 14px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4,
      borderColor: primary ? 'var(--accent)' : 'var(--line)', background: primary ? 'var(--accent-soft)' : 'var(--panel)' }}>
      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{titel}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
      <div style={{ marginTop: 2 }}>{kinder}</div>
    </button>
  )
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: '0 0 4px' }}>Berichte &amp; Analysen</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>Analyse-Werkzeuge (Radar, Cockpit, Qualität, Struktur) und Detaillisten für die Einzelfallprüfung — nach Bereich gruppiert.</div>
      </div>

      {/* Analyse-Werkzeuge — kompakt */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 24 }}>
        <Tool on={() => setAktiv('radar')} titel="Controller-Radar" sub="Ein-Klick-Analyse · kritisch zuerst" primary
          kinder={<span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>Analyse starten →</span>} />
        <Tool on={() => setAktiv('cockpit')} titel="Plausi-Cockpit" sub="Alle Befunde gebündelt"
          kinder={<span style={{ display: 'inline-flex', gap: 8 }}>{['fehler', 'warnung', 'hinweis'].map((s) => <span key={s} style={{ fontSize: 11.5, fontWeight: 700, color: SCHWERE[s].farbe }}>{stat.proSchwere[s]}</span>)}</span>} />
        <Tool on={() => setAktiv('qualitaet')} titel="Qualitätsdashboard" sub="Status-Workflow je Bereich"
          kinder={<span style={{ fontSize: 11, color: 'var(--muted)' }}>{q.offen} offen · {q.bearbeitung} in Arbeit · {q.erledigt} erledigt</span>} />
        <Tool on={() => setAktiv('hierarchie')} titel="Strukturbericht" sub="Umsatz/DB als auf-/zuklappbare Hierarchie"
          kinder={<span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>Matrix öffnen →</span>} />
      </div>

      {/* Listen nach Bereich gruppiert */}
      {KATEGORIEN.map((kat) => (
        <div key={kat.name} style={{ marginBottom: 18 }}>
          <div style={{ ...cap, marginBottom: 8 }}>{kat.name}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
            {kat.ids.map((id) => {
              const l = LISTEN.find((x) => x.id === id)
              if (!l) return null
              const n = cnt[l.id] || 0
              return (
                <button key={id} disabled={!l.verfuegbar} onClick={() => l.verfuegbar && oeffneListe(l.id)}
                  style={{ ...card, padding: '10px 13px', textAlign: 'left', cursor: l.verfuegbar ? 'pointer' : 'not-allowed', opacity: l.verfuegbar ? 1 : 0.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>{l.name}</span>
                  {n > 0 ? <span title={`${n} Auffälligkeit(en)`} style={{ fontSize: 11, fontWeight: 700, color: SCHWERE.fehler.farbe, background: SCHWERE.fehler.soft, borderRadius: 999, padding: '2px 8px' }}>{n}</span>
                    : <span style={{ fontSize: 13, color: 'var(--muted)' }}>→</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const EBENEN_PFAD = ['E1 · Geschäftsführung', 'E2 · Fachbereich', 'E3 · Themenbereich', 'E4 · Details', 'E5 · Historisierung']

function Liste({ typ, titel, sub, cols, sumKeys, lade, onBack, onDrill, startSuche = '', idKey, titelKey, optionen = [] }) {
  const [suche, setSuche] = useState(startSuche)
  const [nurAuffaellig, setNurAuffaellig] = useState(false)
  const [legendeAuf, setLegendeAuf] = useState(false)
  const [detail, setDetail] = useState(null)
  const [voll, setVoll] = useState(null)
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
  const [visuals, setVisuals] = useState(() => localStorage.getItem('er_visuals') !== '0') // Daten-Balken (global, Standard an)
  const [breiten, setBreiten] = useState({}) // ziehbare Spaltenbreiten je Spalte
  useEffect(() => { try { localStorage.setItem('er_visuals', visuals ? '1' : '0') } catch {} }, [visuals])
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
  // Spaltenbreiten (ziehbar). Standardbreite je Spaltentyp; Override per Drag.
  const defW = (c) => (['artikel', 'kunde', 'name', 'bezeichnung', 'lieferant', 'grund', 'email'].includes(c.key) ? 220 : c.al === 'right' ? 110 : c.al === 'center' ? 90 : 130)
  const colW = (c) => breiten[c.key] || defW(c)
  const starteResize = (e, key) => {
    e.preventDefault(); e.stopPropagation()
    const startX = e.clientX, th = e.currentTarget.parentElement
    const startW = breiten[key] || th.offsetWidth
    const move = (ev) => setBreiten((b) => ({ ...b, [key]: Math.max(56, startW + (ev.clientX - startX)) }))
    const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move); document.addEventListener('mouseup', up)
  }
  const tabBreite = sichtCols.reduce((n, c) => n + colW(c), 0) + 36
  // Spalten-Maxima für Daten-Balken (nur rechtsbündige Zahlenspalten).
  const colMax = {}
  if (visuals) for (const c of sichtCols) if (c.al === 'right') {
    const m = Math.max(0, ...data.rows.map((r) => (typeof r[c.key] === 'number' ? Math.abs(r[c.key]) : 0)))
    if (m > 0) colMax[c.key] = m
  }
  // CSV-Export der aktuellen Ansicht: nur sichtbare Spalten + Befundspalte.
  const exportCsv = () => {
    const kopf = [...sichtCols.map((c) => c.label), 'Befund']
    const zeilen = data.rows.map((r) => [...sichtCols.map((c) => (c.fmt ? c.fmt(r[c.key]) : r[c.key] ?? '')), r.befunde.map((b) => b.text).join(' | ')])
    downloadCsv(`${typ}_${nurAuffaellig ? 'auffaellig' : 'ansicht'}`, [kopf, ...zeilen])
  }

  if (voll) return <Vollansicht typ={typ} row={voll} cols={cols} idKey={idKey} titelKey={titelKey} titel={titel} onBack={() => setVoll(null)} onDrill={onDrill} />

  const zelle = (row, c) => {
    const dimmed = row._dim?.includes(c.key)
    const befund = !dimmed && row.befunde.find((b) => b.feld === c.key)
    const v = row[c.key]
    const text = c.fmt ? c.fmt(v) : v
    // Daten-Balken: proportional zum Spalten-Maximum; Befunde/negativ farbig.
    const balken = !dimmed && colMax[c.key] && typeof v === 'number' && v !== 0
    const pct = balken ? Math.max(2, Math.round(Math.abs(v) / colMax[c.key] * 100)) : 0
    const balkenFarbe = befund ? SCHWERE[befund.schwere].farbe : v < 0 ? 'var(--amp-r)' : 'var(--accent)'
    return (
      <td key={c.key} title={dimmed ? 'ignoriert (Dublette – nicht führend)' : befund ? befund.text : undefined}
        className={c.mono || c.al === 'right' ? 'mono' : undefined}
        style={{ position: 'relative', padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: c.al, whiteSpace: c.key === 'artikel' || c.key === 'kunde' ? 'normal' : 'nowrap',
          maxWidth: c.key === 'artikel' ? 280 : undefined, overflow: 'hidden', textOverflow: 'ellipsis',
          background: befund ? SCHWERE[befund.schwere].soft : undefined,
          color: dimmed ? 'var(--muted)' : befund ? SCHWERE[befund.schwere].farbe : undefined,
          textDecoration: dimmed ? 'line-through' : undefined, opacity: dimmed ? 0.55 : 1,
          fontWeight: befund || c.key === 'anzeigeWert' ? 700 : 400 }}>
        {balken && <span aria-hidden style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: pct + '%', background: balkenFarbe, opacity: befund ? 0.22 : 0.14, borderRadius: 3 }} />}
        <span style={{ position: 'relative' }}>{text}{befund ? ' ⚠' : ''}</span>
      </td>
    )
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
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
        <button onClick={() => setVisuals((v) => !v)} title="Daten-Balken in Zahlenspalten ein-/ausblenden"
          style={{ ...inp, cursor: 'pointer', fontSize: 12, fontWeight: 600, borderColor: visuals ? 'var(--accent)' : 'var(--line)', color: visuals ? 'var(--accent)' : 'var(--ink)' }}>📊 Visuals {visuals ? 'an' : 'aus'}</button>
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
        <table style={{ tableLayout: 'fixed', width: tabBreite, borderCollapse: 'collapse', fontSize: 12.5 }}>
          <colgroup>{sichtCols.map((c) => <col key={c.key} style={{ width: colW(c) }} />)}<col style={{ width: 36 }} /></colgroup>
          <thead><tr>{sichtCols.map((c) => {
            const g = glossarFuer(c.key)
            return (
              <th key={c.key} onMouseEnter={(e) => zeigeHov(e, c.key)} onMouseLeave={planeHide}
                style={{ position: 'sticky', top: 0, background: 'var(--panel)', textAlign: c.al, padding: '8px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: g ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: g ? 'help' : 'default' }}>
                {c.label}{g ? <span style={{ marginLeft: 3, fontSize: 9, opacity: 0.8 }}>ⓘ</span> : ''}
                <span onMouseDown={(e) => starteResize(e, c.key)} title="Spaltenbreite ziehen"
                  style={{ position: 'absolute', top: 0, right: 0, width: 7, height: '100%', cursor: 'col-resize', userSelect: 'none' }} />
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

      {detail && <BefundModal typ={typ} row={detail} cols={cols} idKey={idKey} titelKey={titelKey} onClose={() => setDetail(null)} onDrill={onDrill} onVoll={() => { const r = detail; setDetail(null); setVoll(r) }} />}

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

const ERK_STIL = { positiv: { farbe: 'var(--amp-g)', soft: 'var(--amp-g-soft)', icon: '✅' }, risiko: { farbe: 'var(--amp-r)', soft: 'var(--amp-r-soft)', icon: '⚠️' }, hinweis: { farbe: 'var(--accent)', soft: 'var(--accent-soft)', icon: '💡' } }

// Vollansicht eines Datensatzes: Grafik, KI-Erkenntnisse, Stammdaten,
// Bemerkungen mit Personen-Zuweisung (Aufgaben), Artikelkarte + Preisvergleich.
function Vollansicht({ typ, row, cols, idKey, titelKey, titel, onBack, onDrill }) {
  const [bem, setBem] = useState(() => ladeBemerkungen(typ, row[idKey]))
  const [text, setText] = useState('')
  const [person, setPerson] = useState('')
  const hist = historie(typ, row)
  const maxB = hist.kind === 'chart' ? Math.max(...hist.punkte.map((h) => h.wert), 1) : 0
  const erk = erkenntnisse(typ, row)
  const links = verknuepfungenFuer(typ, row)
  const istArtikel = typ === 'artikel' || typ === 'produkt'
  const pv = istArtikel ? preisvergleich({ sku: row.sku, vk: row.vk ?? row.vkBrutto }) : null
  const speichern = () => { if (!text.trim()) return; setBem(addBemerkung(typ, row[idKey], { text, zuweisung: person })); setText(''); setPerson('') }

  const Karte = ({ titel: t, children, span }) => (
    <div style={{ ...card, padding: 16, gridColumn: span ? '1 / -1' : undefined }}>
      <div style={{ ...cap, marginBottom: 10 }}>{t}</div>{children}
    </div>
  )

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <button onClick={onBack} title="Zurück zur Liste" style={{ ...inp, cursor: 'pointer', padding: '6px 11px' }}>←</button>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{titel} · {row[idKey]}</div>
          <h2 style={{ margin: '2px 0 0' }}>{row[titelKey]}</h2>
        </div>
        <span style={{ fontSize: 10.5, padding: '3px 9px', borderRadius: 999, background: 'var(--accent)', color: '#fff' }}>VOLLANSICHT</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* KI-Erkenntnisse */}
        <Karte titel="🤖 Automatische Erkenntnisse" span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
            {erk.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: ERK_STIL[e.art].soft }}>
                <span>{ERK_STIL[e.art].icon}</span><span style={{ fontSize: 12.5, color: ERK_STIL[e.art].farbe, fontWeight: 600 }}>{e.text}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 8 }}>Regelbasierte Analyse aus Plausi-Befunden und Fachheuristiken — erklärbar und nachvollziehbar.</div>
        </Karte>

        {/* Artikelkarte mit Bild (falls vorhanden) */}
        {istArtikel && (
          <Karte titel="🖼️ Artikelkarte">
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 92, height: 92, borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 30 }}>📦</div>
              <div style={{ fontSize: 12.5 }}>
                <div style={{ fontWeight: 600 }}>{row.name || row.artikel}</div>
                <div style={{ color: 'var(--muted)', marginTop: 2 }}>{row.gruppe}{row.marke ? ' · ' + row.marke : ''}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 6 }}>Kein Produktbild hinterlegt — Bild-Upload folgt in einer späteren Iteration.</div>
              </div>
            </div>
          </Karte>
        )}

        {/* Konkurrenz-Preisvergleich (Preispiranha) */}
        {pv && (
          <Karte titel="🐟 Konkurrenz-Preisvergleich">
            <div style={{ fontSize: 12, marginBottom: 8 }}>
              Eigener VK <b className="mono">{eur(pv.eigenerVk)} €</b> · Marktposition <b>{pv.position}/{pv.anzahl}</b>
              {pv.unterbietetUns > 0 ? <span style={{ color: 'var(--amp-r)' }}> · {pv.unterbietetUns} Anbieter günstiger</span> : <span style={{ color: 'var(--amp-g)' }}> · günstigster Anbieter</span>}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}><tbody>
              {pv.wettbewerber.map((w) => (
                <tr key={w.haendler}>
                  <td style={{ padding: '4px 0', borderBottom: '1px solid var(--line)' }}>{w.haendler}</td>
                  <td className="mono" style={{ padding: '4px 0', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{eur(w.preis)} €</td>
                  <td className="mono" style={{ padding: '4px 0 4px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: w.delta < 0 ? 'var(--amp-r)' : 'var(--amp-g)' }}>{w.delta > 0 ? '+' : ''}{w.delta} %</td>
                </tr>
              ))}
            </tbody></table>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 8 }}>Quelle: {pv.quelle} · Stand {datum(pv.stand)}</div>
          </Karte>
        )}

        {/* Grafik / Historie */}
        <Karte titel="📈 Verlauf (E5)" span={!istArtikel}>
          {hist.kind === 'chart' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
                {hist.punkte.map((h) => (
                  <div key={h.label} title={`${h.label}: ${h.wert}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.wert}</div>
                    <div style={{ width: '100%', height: `${h.wert / maxB * 64}px`, minHeight: 2, background: 'var(--accent)', borderRadius: '3px 3px 0 0' }} />
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{hist.einheit} · letzte 6 Monate.</div>
            </>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {hist.punkte.map((h, i) => (
                <React.Fragment key={h.label + i}>
                  <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: h.warn ? 'var(--amp-r-soft)' : 'var(--accent-soft)', color: h.warn ? 'var(--amp-r)' : 'var(--accent)', fontWeight: 600 }}>{h.label}<span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {datum(h.datum)}</span></span>
                  {i < hist.punkte.length - 1 && <span style={{ alignSelf: 'center', color: 'var(--muted)' }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </Karte>

        {/* Stammdaten */}
        <Karte titel="Stammdaten (E4)" span={istArtikel}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 14px' }}>
            {cols.map((c) => (
              <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--muted)' }}>{c.label}</span>
                <span className="mono">{c.fmt ? c.fmt(row[c.key]) : String(row[c.key])}</span>
              </div>
            ))}
          </div>
          {links.length > 0 && onDrill && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {links.map((l) => <button key={l.ziel + l.label} onClick={() => onDrill(l.ziel, l.suche)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: '1px solid var(--accent)', background: 'var(--panel)', color: 'var(--accent)', fontWeight: 600 }}>🔗 {l.label} {l.anzahl} →</button>)}
            </div>
          )}
        </Karte>

        {/* Bemerkungen mit Personen-Zuweisung */}
        <Karte titel="📝 Bemerkungen & Zuweisungen" span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 12 }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Bemerkung erfassen … (wird der zugewiesenen Person als Aufgabe angezeigt)"
              style={{ ...inp, flex: 1, minWidth: 260, minHeight: 38, resize: 'vertical' }} />
            <select value={person} onChange={(e) => setPerson(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              <option value="">— ohne Zuweisung —</option>
              {PERSONEN.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <button onClick={speichern} disabled={!text.trim()} style={{ padding: '9px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: text.trim() ? 'var(--accent)' : 'var(--line)', color: '#fff', fontWeight: 600, cursor: text.trim() ? 'pointer' : 'not-allowed' }}>Speichern</button>
          </div>
          {bem.length === 0 ? <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>Noch keine Bemerkungen.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {bem.map((n) => (
                <div key={n.nid} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', opacity: n.erledigt ? 0.55 : 1 }}>
                  <input type="checkbox" checked={n.erledigt} onChange={() => setBem(toggleErledigt(typ, row[idKey], n.nid))} title="erledigt" style={{ marginTop: 3, cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, textDecoration: n.erledigt ? 'line-through' : undefined }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {n.zuweisung ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>👤 {n.zuweisung}</span> : 'nicht zugewiesen'} · {new Date(n.erstellt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <button onClick={() => setBem(loescheBemerkung(typ, row[idKey], n.nid))} title="löschen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 15 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </Karte>
      </div>
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

function BefundModal({ typ, row, cols, idKey, titelKey, onClose, onDrill, onVoll }) {
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
        {onVoll && (
          <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--line)' }}>
            <button onClick={onVoll} style={{ width: '100%', padding: '9px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              📋 Vollansicht öffnen — Grafiken · KI-Erkenntnisse · Bemerkungen →
            </button>
          </div>
        )}
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
