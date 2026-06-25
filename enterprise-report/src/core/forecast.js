// =========================================================================
//  FORECAST / HOCHRECHNUNG — projiziert das Jahresende aus dem YTD-Ist und
//  dem Restjahr-Plan. Zwei Methoden: „Run-Rate" (Restjahr mit der bisherigen
//  Plan-Erreichung fortgeschrieben) und „Plan-treu" (Restjahr trifft den Plan).
//  Liefert zusaetzlich die Forecast-Bruecke (Wasserfall) Jahresplan -> YTD-
//  Abweichung -> Restjahr-Abweichung -> Forecast. Reine Lesefunktionen.
// =========================================================================
import { SERIEN, MONATE, letzterIstMonat, ampel } from './quartalsbericht.js'

const ALLE = MONATE.map((_, i) => i)
const sum = (arr, idx) => idx.reduce((n, i) => n + arr[i], 0)

export const FORECAST_METHODEN = [
  { id: 'runrate', name: 'Run-Rate', beschreibung: 'Restjahr mit der bisherigen Plan-Erreichung (YTD-Leistungsindex) fortgeschrieben.' },
  { id: 'plantreu', name: 'Plan-treu', beschreibung: 'Restjahr trifft den Plan; nur die bisherige Ist-Abweichung bleibt erhalten.' }
]

/** Hochrechnung Jahresende fuer eine Umsatzserie. faktor = Profit-Center-Anteil. */
export function forecast(serieId, { faktor = 1, methode = 'runrate' } = {}) {
  const s = SERIEN[serieId]
  const bis = letzterIstMonat(serieId)
  const istIdx = ALLE.filter((i) => i <= bis && s.ist[i] > 0)
  const restIdx = ALLE.filter((i) => i > bis)
  const ytdIst = sum(s.ist, istIdx) * faktor
  const ytdPlan = sum(s.plan, istIdx) * faktor
  const restPlan = sum(s.plan, restIdx) * faktor
  const jahresplan = sum(s.plan, ALLE) * faktor
  const jahresVj = sum(s.vj, ALLE) * faktor
  const leistungsindex = ytdPlan ? ytdIst / ytdPlan : 1
  const restForecast = methode === 'plantreu' ? restPlan : restPlan * leistungsindex
  const fc = ytdIst + restForecast
  const ytdAbw = ytdIst - ytdPlan
  const restAbw = restForecast - restPlan
  const abwForecast = fc - jahresplan
  const abwForecastPct = jahresplan ? abwForecast / jahresplan * 100 : 0
  return {
    bisMonat: bis, monatName: MONATE[bis], methode,
    ytdIst, ytdPlan, ytdAbw, leistungsindex: +leistungsindex.toFixed(3),
    restPlan, restForecast, restAbw,
    jahresplan, jahresVj, forecast: fc,
    abwForecast, abwForecastPct: +abwForecastPct.toFixed(1),
    erreichungPct: jahresplan ? +(fc / jahresplan * 100).toFixed(1) : 0,
    vsVjPct: jahresVj ? +((fc - jahresVj) / jahresVj * 100).toFixed(1) : 0,
    status: ampel(abwForecastPct)
  }
}

/** Forecast-Bruecke (Wasserfall) als Schritte fuer eine Visualisierung. */
export function forecastBruecke(serieId, opts) {
  const f = forecast(serieId, opts)
  return {
    ...f,
    schritte: [
      { label: 'Jahresplan', wert: f.jahresplan, typ: 'basis' },
      { label: `YTD-Abweichung (bis ${f.monatName})`, wert: f.ytdAbw, typ: 'delta' },
      { label: 'Restjahr-Abweichung', wert: f.restAbw, typ: 'delta' },
      { label: 'Forecast Jahresende', wert: f.forecast, typ: 'summe' }
    ]
  }
}

/** Monatsreihe: Ist bis zum aktuellen Monat, danach Forecast-Werte (fuer Charts). */
export function forecastReihe(serieId, { faktor = 1, methode = 'runrate' } = {}) {
  const s = SERIEN[serieId]
  const bis = letzterIstMonat(serieId)
  const istIdx = ALLE.filter((i) => i <= bis && s.ist[i] > 0)
  const li = methode === 'plantreu' ? 1 : (sum(s.plan, istIdx) ? sum(s.ist, istIdx) / sum(s.plan, istIdx) : 1)
  return ALLE.map((i) => ({
    label: MONATE[i],
    ist: i <= bis ? s.ist[i] * faktor : null,
    forecast: i > bis ? s.plan[i] * faktor * li : (i === bis ? s.ist[i] * faktor : null), // an bisMonat anknuepfen
    plan: s.plan[i] * faktor
  }))
}
