// =========================================================================
//  NAV-CONTEXT — globale Sprungziele, damit JEDE Kennzahl (egal in welchem
//  Modul) in Themenbericht (Baum), Detailliste oder Strukturbericht springen
//  kann, ohne Props durch alle Ebenen zu reichen.
// =========================================================================
import React, { createContext, useContext } from 'react'

const Ctx = createContext(null)
export function NavProvider({ value, children }) { return <Ctx.Provider value={value}>{children}</Ctx.Provider> }
export function useNav() { return useContext(Ctx) }
