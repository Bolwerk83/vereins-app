// ----------------------------------------------------------------
// Reine UI-Helfer (ohne React/DOM) - isoliert testbar.
// Avatar-Farbe/Initialen aus Namen, Kontrast- und Aufhell-Berechnung
// fuer Vereinsfarben.
// ----------------------------------------------------------------
export const ACOLORS = ["#e74c3c","#e67e22","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00bcd4","#f59e0b","#8bc34a","#ff6b6b","#845ef7"];

// Stabile Avatar-Farbe aus einem Namen (gleicher Name -> gleiche Farbe).
export const acol = n => { n=n||""; let h=0; for(const c of n) h=c.charCodeAt(0)+((h<<5)-h); return ACOLORS[Math.abs(h)%ACOLORS.length]; };

// Initialen aus einem Namen (max. 2 Buchstaben, gross).
export const inits = n => (n||"").split(" ").map(w=>w[0]||"").join("").slice(0,2).toUpperCase();

// Lesbare Textfarbe (#111 oder #fff) fuer eine Hintergrundfarbe (Helligkeit).
export const contrast = hex => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return (r*299+g*587+b*114)/1000>145?"#111":"#fff"; };

// Farbe um p% in Richtung Weiss aufhellen (fuer dezente Tints).
export const mix = (hex,p) => { let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); const m=c=>Math.min(255,Math.floor(c+(255-c)*(p/100))); return `#${m(r).toString(16).padStart(2,"0")}${m(g).toString(16).padStart(2,"0")}${m(b).toString(16).padStart(2,"0")}`; };
