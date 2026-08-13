// Ende-zu-Ende-Verschlüsselung für das Digitale Gedächtnis.
// Schlüssel wird per PBKDF2 aus dem Gedächtnis-Passwort abgeleitet und
// verlässt das Gerät nie; gespeichert wird nur AES-GCM-Chiffretext.

const te = new TextEncoder()
const td = new TextDecoder()

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))

export function newSalt() {
  return b64(crypto.getRandomValues(new Uint8Array(16)))
}

export async function deriveKey(password, saltB64) {
  const base = await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: unb64(saltB64), iterations: 310000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptJson(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj)))
  return { iv: b64(iv), cipher: b64(ct) }
}

export async function decryptJson(key, ivB64, cipherB64) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(ivB64) }, key, unb64(cipherB64))
  return JSON.parse(td.decode(pt))
}
