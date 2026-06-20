// =========================================================================
//  QUERCHECKS / DATENVALIDIERUNG — die "Vertrauensschicht" des Controllings.
//
//  Encodiert Abstimm- und Plausibilitätsregeln ÜBER die Bereiche hinweg
//  (z. B. GuV-Abgleich, FiBu↔Controlling-Abgrenzung, Kapazitätsgrenzen).
//  Ein Head of Controlling beantwortet damit zwei Fragen automatisch:
//  "Stimmen die Zahlen untereinander?" und "Wo muss ich hinschauen?"
//
//  schwere: 'hart'  = muss aufgehen (Abstimmfehler), 'weich' = Plausibilität.
// =========================================================================
import { KPI } from './kpiRegistry.js'
import { formatWert } from '../design/theme.js'

const nah = (a, b, tol) => Math.abs(a - b) <= tol
const da = (w, ...ids) => ids.every((id) => w[id] != null)

export const REGELN = [
  {
    id: 'guv_abgleich', titel: 'GuV-Abgleich: Gesamtkosten = Nettoumsatz − EBIT',
    bereich: 'KLR', schwere: 'hart',
    pruef: (w) => da(w, 'gesamtkosten', 'nettoumsatz', 'ebit') && {
      ok: nah(w.gesamtkosten, w.nettoumsatz - w.ebit, 0.1),
      ist: `${w.gesamtkosten.toFixed(1)} Mio €`, soll: `${(w.nettoumsatz - w.ebit).toFixed(1)} Mio €`,
      hinweis: 'KLR-Gesamtkosten müssen zum GuV-Ergebnis passen.'
    }
  },
  {
    id: 'abgrenzung', titel: 'Abgrenzung: Betriebsergebnis (Controlling) = EBIT',
    bereich: 'FIBU', schwere: 'hart',
    pruef: (w) => da(w, 'betrieblichesErgebnis', 'ebit') && {
      ok: nah(w.betrieblichesErgebnis, w.ebit, 0.05),
      ist: `${w.betrieblichesErgebnis.toFixed(2)} Mio €`, soll: `${w.ebit.toFixed(2)} Mio €`,
      hinweis: 'Die FiBu→Controlling-Überleitung muss aufs operative EBIT führen.'
    }
  },
  {
    id: 'db1_check', titel: 'Deckungsbeitrag I = Nettoumsatz − Wareneinsatz',
    bereich: 'FIN', schwere: 'hart',
    pruef: (w) => da(w, 'db1', 'nettoumsatz', 'wareneinsatz') && {
      ok: nah(w.db1, w.nettoumsatz - w.wareneinsatz, 0.05),
      ist: `${w.db1.toFixed(1)} Mio €`, soll: `${(w.nettoumsatz - w.wareneinsatz).toFixed(1)} Mio €`,
      hinweis: 'Margenbasis-Konsistenz.'
    }
  },
  {
    id: 'kapazitaet_plan', titel: 'Produktionsplan ≤ Kapazität',
    bereich: 'PP', schwere: 'hart',
    pruef: (w) => da(w, 'produktionsplan', 'kapazitaet') && {
      ok: w.produktionsplan <= w.kapazitaet,
      ist: formatWert(w.produktionsplan, 'count'), soll: `≤ ${formatWert(w.kapazitaet, 'count')}`,
      hinweis: 'Plan darf die verfügbare Kapazität nicht überschreiten (sonst Engpass).'
    }
  },
  {
    id: 'kapazitaet_ist', titel: 'Produktionsmenge ≤ Kapazität',
    bereich: 'PP', schwere: 'hart',
    pruef: (w) => da(w, 'produktionsmenge', 'kapazitaet') && {
      ok: w.produktionsmenge <= w.kapazitaet,
      ist: formatWert(w.produktionsmenge, 'count'), soll: `≤ ${formatWert(w.kapazitaet, 'count')}`,
      hinweis: 'Ist-Fertigung kann nicht über der Kapazität liegen — Datenfehler prüfen.'
    }
  },
  {
    id: 'ueberbestand_check', titel: 'Überbestand ≤ Lagerbestand',
    bereich: 'SCC', schwere: 'hart',
    pruef: (w) => da(w, 'ueberbestand', 'lagerbestand') && {
      ok: w.ueberbestand <= w.lagerbestand,
      ist: `${w.ueberbestand.toFixed(1)} Mio €`, soll: `≤ ${w.lagerbestand.toFixed(1)} Mio €`,
      hinweis: 'Überbestand ist eine Teilmenge des Gesamtbestands.'
    }
  },
  {
    id: 'eigenkapital_check', titel: 'Eigenkapital ≤ Bilanzsumme',
    bereich: 'FIBU', schwere: 'hart',
    pruef: (w) => da(w, 'eigenkapital', 'bilanzsumme') && {
      ok: w.eigenkapital <= w.bilanzsumme,
      ist: `${w.eigenkapital.toFixed(1)} Mio €`, soll: `≤ ${w.bilanzsumme.toFixed(1)} Mio €`,
      hinweis: 'Bilanzielle Grundkonsistenz.'
    }
  },
  {
    id: 'wareneinsatzquote_plausibel', titel: 'Wareneinsatzquote im plausiblen Band (50–70 %)',
    bereich: 'GF', schwere: 'weich',
    pruef: (w) => da(w, 'wareneinsatzquote') && {
      ok: w.wareneinsatzquote >= 50 && w.wareneinsatzquote <= 70,
      ist: `${w.wareneinsatzquote.toFixed(1)} %`, soll: '50–70 %',
      hinweis: 'Werte außerhalb deuten auf Mapping-/Periodenfehler hin.'
    }
  },
  {
    id: 'forecast_plausibel', titel: 'Umsatzprognose ≥ Auftragsbestand',
    bereich: 'FC', schwere: 'weich',
    pruef: (w) => da(w, 'umsatzprognose', 'auftragsbestand') && {
      ok: w.umsatzprognose >= w.auftragsbestand,
      ist: `${w.umsatzprognose.toFixed(1)} Mio €`, soll: `≥ ${w.auftragsbestand.toFixed(1)} Mio €`,
      hinweis: 'Das Orderbuch ist ein Teil der erwarteten Umsätze.'
    }
  },
  {
    id: 'personalkosten_check', titel: 'Personalkosten ≤ Gesamtkosten',
    bereich: 'PC', schwere: 'hart',
    pruef: (w) => da(w, 'personalkosten', 'gesamtkosten') && {
      ok: w.personalkosten <= w.gesamtkosten,
      ist: `${w.personalkosten.toFixed(1)} Mio €`, soll: `≤ ${w.gesamtkosten.toFixed(1)} Mio €`,
      hinweis: 'Personalkosten sind ein Teil der Gesamtkosten.'
    }
  },
  {
    id: 'liquiditaet_check', titel: 'Freie Liquidität = Liquide Mittel + Kreditlinie',
    bereich: 'LIQ', schwere: 'hart',
    pruef: (w) => da(w, 'freieLiquiditaet', 'liquideMittel', 'kreditlinie') && {
      ok: nah(w.freieLiquiditaet, w.liquideMittel + w.kreditlinie, 0.01),
      ist: `${w.freieLiquiditaet.toFixed(1)} Mio €`, soll: `${(w.liquideMittel + w.kreditlinie).toFixed(1)} Mio €`,
      hinweis: 'Liquiditätsreserve = Kasse + freie Linie.'
    }
  },
  {
    id: 'cashflow_plausibel', titel: 'Operativer Cashflow plausibel (≤ EBITDA + Bestandsabbau)',
    bereich: 'LIQ', schwere: 'weich',
    pruef: (w) => da(w, 'operativerCashflow', 'ebitda') && {
      ok: w.operativerCashflow <= w.ebitda + 4.0,
      ist: `${w.operativerCashflow.toFixed(1)} Mio €`, soll: `≈ EBITDA ${w.ebitda.toFixed(1)} ± WC`,
      hinweis: 'Operativer Cashflow folgt grob dem EBITDA, korrigiert um Working Capital.'
    }
  }
]

/** Alle Regeln gegen einen Wertesatz prüfen. */
export function pruefeAlle(werte) {
  return REGELN.map((r) => {
    const res = r.pruef(werte)
    if (!res) return { ...r, status: 'na', ist: '–', soll: '–' }   // Daten fehlen
    return { ...r, status: res.ok ? 'ok' : (r.schwere === 'hart' ? 'fehler' : 'warnung'), ...res }
  })
}

/** Kompakte Zusammenfassung (für Badge/Topbar). */
export function validierungsZusammenfassung(werte) {
  const e = pruefeAlle(werte)
  return {
    gesamt: e.length,
    ok: e.filter((x) => x.status === 'ok').length,
    warnungen: e.filter((x) => x.status === 'warnung').length,
    fehler: e.filter((x) => x.status === 'fehler').length,
    na: e.filter((x) => x.status === 'na').length,
    ergebnisse: e
  }
}
