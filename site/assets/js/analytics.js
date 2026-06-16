/* =====================================================================
   bolwerk24 — anonymes First-Party-Tracking
   ---------------------------------------------------------------------
   Erfasst NUR anonyme, aggregierbare Ereignisse für den SuperAdmin:
     • page_view   – ein Seitenaufruf
     • app_view    – eine App-Kachel wurde sichtbar (1× je Sitzung/App)
     • app_open    – Klick auf "Öffnen"
     • app_notify  – Klick auf "Vormerken"
     • affiliate_click – Klick auf einen Affiliate-/Partner-Link

   Es werden KEINE personenbezogenen Daten und KEINE dauerhaften
   Identifikatoren gespeichert. Die "session_id" liegt nur im
   sessionStorage (verschwindet beim Schließen des Tabs) und dient
   ausschließlich dazu, Aufrufe einer Sitzung grob zu bündeln.

   Wenn Supabase nicht konfiguriert ist, passiert hier nichts (no-op).
   ===================================================================== */
(function () {
  "use strict";

  function sb() { return window.bwSupabase ? window.bwSupabase() : null; }
  if (!window.bwSupabaseReady || !window.bwSupabaseReady()) return; // nichts zu tun

  // --- grobe, nicht-personenbezogene Hilfswerte ---
  function sessionId() {
    try {
      let id = sessionStorage.getItem("bw24-sid");
      if (!id) {
        id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
        sessionStorage.setItem("bw24-sid", id);
      }
      return id;
    } catch { return null; }
  }
  function device() { return window.matchMedia("(max-width: 760px)").matches ? "mobil" : "desktop"; }
  function refHost() {
    try {
      if (!document.referrer) return "";
      const u = new URL(document.referrer);
      if (u.hostname === location.hostname) return ""; // interne Navigation ignorieren
      return u.hostname;
    } catch { return ""; }
  }

  const sid = sessionId();
  const base = () => ({ session_id: sid, path: location.pathname, device: device() });

  // Ereignis senden (Fehler werden bewusst verschluckt – Tracking darf nie stören)
  async function track(type, extra) {
    const ev = { type, ...base(), ...(extra || {}) };
    // Bevorzugt über die Edge Function `intake` (server-seitiges Rate-Limit).
    try {
      if (window.bwIntake) {
        const res = await window.bwIntake("event", ev);
        if (res.handled) return; // vom Backend angenommen/verworfen
      }
    } catch { /* -> Direkt-Fallback */ }
    // Übergangs-Fallback (Function nicht deployed / vor Cutover):
    const client = sb();
    if (!client) return;
    try {
      await client.from("site_events").insert([ev]);
    } catch { /* ignorieren */ }
  }
  window.bwTrack = track; // auch von main.js nutzbar

  // --- page_view (einmal pro Laden) ---
  track("page_view", { referrer: refHost() });

  // --- app_view per Sichtbarkeit (1× je Sitzung/App) ---
  function observeAppViews() {
    if (!("IntersectionObserver" in window)) return;
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const card = en.target;
        const id = card.getAttribute("data-app-id");
        if (!id || seen.has(id)) return;
        seen.add(id);
        track("app_view", { app_id: id });
        io.unobserve(card);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll("[data-app-id]").forEach((c) => io.observe(c));
  }

  // App-Karten werden von main.js erst nach DOMContentLoaded gerendert.
  // Wir beobachten daher etwas verzögert bzw. erneut nach dem Rendern.
  document.addEventListener("DOMContentLoaded", () => setTimeout(observeAppViews, 400));
  window.addEventListener("bw24:apps-rendered", () => setTimeout(observeAppViews, 50));

  // --- globale Klick-Erfassung für Öffnen / Affiliate ---
  document.addEventListener("click", (e) => {
    const openEl = e.target.closest("[data-app-open]");
    if (openEl) track("app_open", { app_id: openEl.getAttribute("data-app-open") });
    const aff = e.target.closest("[data-affiliate]");
    if (aff) track("affiliate_click", { app_id: aff.getAttribute("data-affiliate") });
  }, { capture: true });
})();
