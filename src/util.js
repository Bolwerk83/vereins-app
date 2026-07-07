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

// Farbe um p% in Richtung Weiss aufhellen (p>0) bzw. Richtung Schwarz
// abdunkeln (p<0). Kanaele werden auf 0..255 begrenzt, sonst entsteht
// ungueltiges Hex (z. B. "#-6...") und der Browser verwirft die Farbe.
export const mix = (hex,p) => { let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); const m=c=>Math.min(255,Math.max(0,Math.floor(p>=0?c+(255-c)*(p/100):c*(1+p/100)))); return `#${m(r).toString(16).padStart(2,"0")}${m(g).toString(16).padStart(2,"0")}${m(b).toString(16).padStart(2,"0")}`; };

// ---- Passwort-Hashing (synchron, auch von SuperAdmin/Storage genutzt) ----
// Synchrone SHA-256-Implementierung (reines JS, kein async nötig – ersetzt 15+ synchrone Aufrufe ohne Umbau)
export const _sha256 = (ascii) => {
  function rightRotate(value, amount){ return (value>>>amount) | (value<<(32-amount)); }
  const mathPow = Math.pow; const maxWord = mathPow(2,32);
  let result = "";
  const words = []; const asciiBitLength = ascii.length*8;
  let hash = _sha256.h = _sha256.h || [];
  const k = _sha256.k = _sha256.k || [];
  let primeCounter = k.length; const isComposite = {};
  for(let candidate=2; primeCounter<64; candidate++){
    if(!isComposite[candidate]){
      for(let i=0;i<313;i+=candidate){ isComposite[i]=candidate; }
      hash[primeCounter] = (mathPow(candidate,.5)*maxWord)|0;
      k[primeCounter++] = (mathPow(candidate,1/3)*maxWord)|0;
    }
  }
  // frische Kopie der initialen Hash-Werte (hash darf nicht überschrieben bleiben)
  hash = hash.slice(0,8).slice();
  ascii += "\x80";
  while(ascii.length%64-56) ascii += "\x00";
  for(let i=0;i<ascii.length;i++){
    const j = ascii.charCodeAt(i);
    if(j>>8) return "";
    words[i>>2] |= j << ((3-i)%4)*8;
  }
  words[words.length] = (asciiBitLength/maxWord)|0;
  words[words.length] = asciiBitLength;
  for(let j=0;j<words.length;){
    const w = words.slice(j, j+=16);
    const oldHash = hash.slice(0,8);
    for(let i=0;i<64;i++){
      const w15 = w[i-15], w2 = w[i-2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e,6) ^ rightRotate(e,11) ^ rightRotate(e,25))
        + ((e&hash[5])^((~e)&hash[6]))
        + k[i]
        + (w[i] = (i<16) ? w[i]|0 : (
            w[i-16]
            + (rightRotate(w15,7) ^ rightRotate(w15,18) ^ (w15>>>3))
            + w[i-7]
            + (rightRotate(w2,17) ^ rightRotate(w2,19) ^ (w2>>>10))
          )|0
        );
      const temp2 = (rightRotate(a,2) ^ rightRotate(a,13) ^ rightRotate(a,22))
        + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));
      hash = [(temp1+temp2)|0].concat(hash);
      hash[4] = (hash[4]+temp1)|0;
    }
    for(let i=0;i<8;i++){ hash[i] = (hash[i]+oldHash[i])|0; }
  }
  for(let i=0;i<8;i++){
    for(let j=3;j+1;j--){
      const b = (hash[i]>>(j*8))&255;
      result += ((b<16) ? 0 : "") + b.toString(16);
    }
  }
  return result;
};
// Salt macht gleiche Passwörter zu unterschiedlichen Hashes schwerer pauschal angreifbar (clientseitig begrenzt, aber besser als ohne)
const _PW_SALT = "vapp.v1.";
export const hashPw = (pw) => "s" + _sha256(_PW_SALT + (pw||""));
// altes Verfahren nur noch zum Prüfen bestehender Passwörter
const _legacyHash = (pw) => { let h=0; for(let i=0;i<pw.length;i++){h=Math.imul(31,h)+pw.charCodeAt(i)|0;} return "h"+Math.abs(h).toString(36); };
export const checkPw = (input,stored) => {
  if(!stored) return false;
  const inp=(input||"").trim();
  if(stored.startsWith("s")) return hashPw(inp)===stored;       // neues SHA-256-Format
  if(stored.startsWith("h")) return _legacyHash(inp)===stored;  // altes Format (Abwärtskompatibilität)
  return inp===stored;                                          // Klartext-Fallback (z.B. unverschlüsselte Demo)
};
