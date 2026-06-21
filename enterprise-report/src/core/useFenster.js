// =========================================================================
//  useFenster — leichte Zeilen-Virtualisierung ohne externe Abhängigkeit.
//
//  Rendert bei großen Tabellen nur die sichtbaren Zeilen (+ Overscan) und
//  hält den Scrollbalken über Platzhalterhöhen korrekt. Unter der Schwelle
//  bleibt alles unverändert (volle DOM-Liste, druckbar). Beim Drucken wird
//  die Virtualisierung automatisch abgeschaltet, damit ALLE Zeilen im PDF
//  landen.
// =========================================================================
import { useState, useRef, useEffect, useCallback } from 'react'

export function useFenster({ anzahl, zeilenHoehe = 34, hoehe = 460, overscan = 8, schwelle = 60 }) {
  const refContainer = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [drucken, setDrucken] = useState(false)

  // Beim Drucken vollständige Liste rendern (sonst fehlen Zeilen im PDF).
  useEffect(() => {
    const vor = () => setDrucken(true)
    const nach = () => setDrucken(false)
    window.addEventListener('beforeprint', vor)
    window.addEventListener('afterprint', nach)
    return () => { window.removeEventListener('beforeprint', vor); window.removeEventListener('afterprint', nach) }
  }, [])

  const onScroll = useCallback((e) => setScrollTop(e.currentTarget.scrollTop), [])

  const aktiv = anzahl > schwelle && !drucken
  if (!aktiv) {
    return { aktiv: false, refContainer, onScroll, start: 0, ende: anzahl, vorHoehe: 0, nachHoehe: 0, gesamtHoehe: 0 }
  }
  const sichtbar = Math.ceil(hoehe / zeilenHoehe)
  const start = Math.max(0, Math.floor(scrollTop / zeilenHoehe) - overscan)
  const ende = Math.min(anzahl, start + sichtbar + overscan * 2)
  return {
    aktiv: true, refContainer, onScroll, start, ende, zeilenHoehe, hoehe,
    vorHoehe: start * zeilenHoehe,
    nachHoehe: (anzahl - ende) * zeilenHoehe,
    gesamtHoehe: anzahl * zeilenHoehe
  }
}
