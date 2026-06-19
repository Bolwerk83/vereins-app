// Zentrale Format- und Statushelfer. EIN Ort für Zahlenformatierung & Ampelfarben,
// damit alle Module identisch aussehen.

export const AMPEL_FARBE = {
  g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)', n: 'var(--amp-n)'
}
export const AMPEL_SOFT = {
  g: 'var(--amp-g-soft)', a: 'var(--amp-a-soft)', r: 'var(--amp-r-soft)', n: 'transparent'
}
export const AMPEL_LABEL = {
  g: 'Im Ziel', a: 'Beobachtung', r: 'Handlung nötig', n: 'Kein Ziel'
}

// Einheitliche Zahlenformate (de-DE).
const nf = (opts) => new Intl.NumberFormat('de-DE', opts)
export function formatWert(wert, format) {
  if (wert == null || Number.isNaN(wert)) return '–'
  switch (format) {
    case 'eur_mio':  return nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(wert) + ' Mio €'
    case 'eur':      return nf({ maximumFractionDigits: 0 }).format(wert) + ' €'
    case 'percent':  return nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(wert) + ' %'
    case 'percent0': return nf({ maximumFractionDigits: 0 }).format(wert) + ' %'
    case 'days':     return nf({ maximumFractionDigits: 0 }).format(wert) + ' Tg'
    case 'count':    return nf({ maximumFractionDigits: 0 }).format(wert)
    default:         return String(wert)
  }
}

export const TREND_ICON = { up: '▲', down: '▼', flat: '▬' }
