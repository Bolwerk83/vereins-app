/* =====================================================================
   bolwerk24.de — Interaktion & Rendering
   ===================================================================== */
(function () {
  "use strict";
  const { CATEGORIES, CONFIG } = window.BOLWERK || { CATEGORIES: [], CONFIG: {} };
  let APPS = (window.BOLWERK && window.BOLWERK.APPS) || [];
  const NL = (CONFIG && CONFIG.newsletter) || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Funktionsschalter (per SuperAdmin änderbar) + Bewertungs-Zusammenfassung
  let FEATURES = { ratings: true, comments: true, construction: true };
  let REVIEWS = {}; // app_id -> { avg, count }
  let rateValue = 0; // aktuell im Modal gewählte Sterne

  // Sterne-Block einer App-Karte (echte Daten statt Fake)
  function ratingHtml(a) {
    if (FEATURES.ratings === false) return "";
    const s = REVIEWS[a.id];
    const rateBtn = `<button class="rate-btn" data-rate="${a.id}">Bewerten</button>`;
    if (s && s.count > 0 && s.avg != null) {
      const full = Math.round(s.avg);
      const word = s.count === 1 ? "Bewertung" : "Bewertungen";
      return `<div class="app-rating"><span class="stars">${"★".repeat(full)}${"☆".repeat(5 - full)}</span> ${Number(s.avg).toFixed(1)} <span style="color:var(--text-3);font-weight:500">· ${s.count} ${word}</span>${rateBtn}</div>`;
    }
    return `<div class="app-rating"><span class="none">Noch keine Bewertungen</span>${rateBtn}</div>`;
  }

  /* ---------- SVG-Icon-Helfer ---------- */
  const ICON = {
    arrow:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
    bell:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>',
    plus:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  };

  /* ---------- App-Karten rendern ---------- */
  function appCard(a) {
    const live = a.status === "live";
    const soft = hexToRgba(a.color, 0.12);
    const shadow = hexToRgba(a.color, 0.45);
    const rating = ratingHtml(a);
    const action = live
      ? `<a class="btn btn-primary" href="${a.url}" target="_blank" rel="noopener" data-app-open="${a.id}" style="background:${a.color};box-shadow:0 8px 22px -8px ${shadow}">Öffnen ${ICON.arrow}</a>`
      : `<button class="btn btn-soft notify-btn" data-app="${a.name}" data-app-id="${a.id}">Vormerken ${ICON.bell}</button>`;
    return `
    <article class="app-card reveal" data-cat="${a.category}" data-app-id="${a.id}" style="--app:${a.color};--app-soft:${soft};--app-shadow:${shadow}">
      <div class="app-top">
        <div class="app-icon">${a.icon}</div>
        <div class="app-meta">
          <div class="app-name">${a.name} <span class="badge ${live ? "badge-live" : "badge-soon"}">${live ? "Live" : "Bald"}</span></div>
          <div class="app-cat">${a.tagline}</div>
        </div>
      </div>
      ${rating}
      <p class="app-desc">${a.desc}</p>
      <div class="app-tags">${a.tags.map((t) => `<span class="t">${t}</span>`).join("")}</div>
      <div class="app-actions">${action}</div>
    </article>`;
  }

  function renderApps() {
    const grid = $("#apps-grid");
    if (grid) {
      grid.innerHTML = APPS.map(appCard).join("");
      // dem Tracking signalisieren, dass die Karten jetzt im DOM sind
      window.dispatchEvent(new Event("bw24:apps-rendered"));
    }

    const filters = $("#filters");
    if (filters) {
      filters.innerHTML = CATEGORIES.map(
        (c, i) => `<button class="chip${i === 0 ? " active" : ""}" data-cat="${c.id}">${c.label}</button>`
      ).join("");
      filters.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;
        $$(".chip", filters).forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        const cat = chip.dataset.cat;
        $$(".app-card", grid).forEach((card) => {
          const show = cat === "all" || card.dataset.cat === cat;
          card.classList.toggle("is-hidden", !show);
        });
      });
    }

    // Vormerken -> sanft zum Newsletter scrollen
    document.addEventListener("click", (e) => {
      const b = e.target.closest(".notify-btn");
      if (!b) return;
      if (window.bwTrack && b.dataset.appId) window.bwTrack("app_notify", { app_id: b.dataset.appId });
      const nl = $("#newsletter");
      const input = $("#nl-email");
      if (nl) nl.scrollIntoView({ behavior: "smooth", block: "center" });
      if (input) {
        input.dataset.app = b.dataset.app;
        setTimeout(() => input.focus(), 600);
      }
    });
  }

  /* ---------- Spotlight (Featured) ---------- */
  function renderSpotlight() {
    const el = $("#spotlight");
    const a = APPS.find((x) => x.featured) || APPS[0];
    if (!el || !a) return;
    const live = a.status === "live";
    const soft = hexToRgba(a.color, 0.16);
    el.style.setProperty("--app", a.color);
    el.style.setProperty("--app-soft", soft);
    el.innerHTML = `
      <div class="spotlight-text">
        <span class="eyebrow">★ Empfohlen</span>
        <div class="s-icon" style="margin-top:18px">${a.icon}</div>
        <h2>${a.name}</h2>
        <p>${a.desc}</p>
        <ul class="feature-list">
          ${(a.features || a.tags).map((f) => `<li><span class="ck">${ICON.check}</span><span>${f}</span></li>`).join("")}
        </ul>
        ${
          live
            ? `<a class="btn btn-primary btn-lg" href="${a.url}" target="_blank" rel="noopener" style="background:${a.color}">${a.name} öffnen ${ICON.arrow}</a>`
            : `<button class="btn btn-primary btn-lg notify-btn" data-app="${a.name}">Vormerken ${ICON.bell}</button>`
        }
      </div>
      <div class="spotlight-visual">
        <div class="device" style="--device-accent:${a.color}">
          <div class="device-screen" style="background:linear-gradient(170deg, ${soft}, var(--bg-subtle))">
            <div class="device-title">${a.name}</div>
            <div class="device-sub">${a.tagline}</div>
            <div class="device-apps">
              ${[...a.tags, "✓", "✓"].slice(0, 6).map((t, i) => `
                <div class="mini-app" style="animation-delay:${0.1 * i}s">
                  <div class="ico" style="background:${i % 2 ? a.color : hexToRgba(a.color, 0.7)}">${["📅","✅","💬","🔔","👥","⚙️"][i] || "•"}</div>
                  <div class="nm">${typeof t === "string" && t.length < 12 ? t : ""}</div>
                </div>`).join("")}
            </div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Hero-Mockup mit allen Apps ---------- */
  function renderHeroMockup() {
    const wrap = $("#hero-apps");
    if (!wrap) return;
    wrap.innerHTML = APPS.slice(0, 6).map((a, i) => `
      <div class="mini-app" style="animation-delay:${0.12 * i + 0.3}s">
        <div class="ico" style="background:${a.color}">${a.icon}</div>
        <div class="nm">${a.name}</div>
      </div>`).join("");
  }

  /* ---------- Theme (Dark/Light) ---------- */
  function initTheme() {
    const KEY = "bw24-theme";
    const saved = localStorage.getItem(KEY);
    const sys = matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved || (sys ? "dark" : "light"));
    $("#theme-toggle")?.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      setTheme(next);
      localStorage.setItem(KEY, next);
    });
    function setTheme(t) {
      document.documentElement.dataset.theme = t;
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.content = t === "dark" ? "#0a0a0c" : "#ffffff";
    }
  }

  /* ---------- Mobile-Navigation ---------- */
  function initNav() {
    const toggle = $("#nav-toggle");
    const links = $("#nav-links");
    toggle?.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    $$("#nav-links a").forEach((a) => a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    }));
    // Header-Schatten beim Scrollen
    const header = $("#site-header");
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll-Reveal ---------- */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    $$(".faq-item").forEach((item) => {
      const q = $(".faq-q", item);
      const a = $(".faq-a", item);
      q.addEventListener("click", () => {
        const open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", open);
        a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
      });
    });
  }

  /* ---------- Zähler-Animation für Hero-Stats ---------- */
  function initCounters() {
    const stats = $$("[data-count]");
    if (!stats.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target, target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "";
        let cur = 0; const step = target / 38;
        const tick = () => { cur += step; if (cur < target) { el.textContent = Math.floor(cur) + suffix; requestAnimationFrame(tick); } else el.textContent = target + suffix; };
        tick(); io.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach((s) => io.observe(s));
  }

  /* ---------- Newsletter (Brevo + lokaler Fallback) ---------- */
  function initNewsletter() {
    const form = $("#nl-form");
    if (!form) return;
    const input = $("#nl-email");
    const btn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        input.focus();
        return;
      }
      const app = input.dataset.app || "";

      // Immer (zusätzlich) im SuperAdmin sichtbar machen, falls Supabase aktiv ist.
      saveLeadToSupabase(email, app);

      if (NL.brevoFormUrl) {
        // An Brevo senden. sibforms erlaubt kein CORS-Auslesen -> no-cors:
        // Wir gehen bei erfolgreichem Absenden von Erfolg aus (DOI-Mail folgt).
        if (btn) { btn.disabled = true; btn.textContent = "Sende …"; }
        try {
          const body = new URLSearchParams();
          body.set(NL.emailField || "EMAIL", email);
          if (app && NL.sourceField) body.set(NL.sourceField, app);
          await fetch(NL.brevoFormUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
          });
        } catch {
          /* Netzwerkfehler ignorieren — DOI-Mail entscheidet final */
        }
        form.classList.add("done");
        return;
      }

      // Fallback ohne konfiguriertes Backend: lokal merken (Demo).
      try {
        const list = JSON.parse(localStorage.getItem("bw24-leads") || "[]");
        list.push({ email, app, at: Date.now() });
        localStorage.setItem("bw24-leads", JSON.stringify(list));
      } catch {}
      form.classList.add("done");
    });
  }

  /* ---------- Cookie-Consent (für Werbung/Affiliate, GDPR) ---------- */
  function initCookies() {
    const KEY = "bw24-consent";
    const bar = $("#cookie");
    if (!bar) return;
    if (!localStorage.getItem(KEY)) setTimeout(() => bar.classList.add("show"), 900);
    const close = (val) => { localStorage.setItem(KEY, val); bar.classList.remove("show"); if (val === "all") loadAds(); };
    $("#cookie-accept")?.addEventListener("click", () => close("all"));
    $("#cookie-decline")?.addEventListener("click", () => close("essential"));
    if (localStorage.getItem(KEY) === "all") loadAds();
  }

  /* ---------- Werbung laden (Platzhalter -> hier echten Code einsetzen) ---------- */
  function loadAds() {
    // Erst NACH Cookie-Einwilligung. Hier deinen Awin-/AdSense-Code einsetzen.
    // Beispiel AdSense: (adsbygoogle = window.adsbygoogle || []).push({});
    $$(".ad-slot").forEach((s) => s.setAttribute("data-consent", "granted"));
    renderAffiliate(); // im SuperAdmin gepflegte Partner-Empfehlungen anzeigen
  }

  /* ---------- Affiliate-Partner aus dem SuperAdmin anzeigen ---------- */
  async function renderAffiliate() {
    const client = window.bwSupabase && window.bwSupabase();
    if (!client) return;
    let partners = [];
    try {
      const { data } = await client.from("site_config").select("value").eq("key", "affiliate").maybeSingle();
      // Globaler Schalter aus dem SuperAdmin: nur anzeigen, wenn ausdrücklich aktiviert.
      if (!data || !data.value || data.value.enabled !== true) return;
      const today = new Date().toISOString().slice(0, 10);
      const list = Array.isArray(data.value.partners) ? data.value.partners : [];
      partners = list.filter((p) => p && p.active && p.url && /^https?:\/\//i.test(p.url)
        && (!p.from || p.from <= today) && (!p.until || p.until >= today));
    } catch { return; }
    if (!partners.length) return;
    const slot = $(".ad-rectangle");
    if (!slot) return;
    slot.classList.add("affiliate-filled");
    slot.innerHTML =
      '<div class="aff-head">Partner-Empfehlungen <span>Anzeige</span></div>' +
      partners.slice(0, 5).map((p) => `
        <a class="aff-item" href="${p.url}" target="_blank" rel="sponsored noopener"
           data-affiliate="${escapeAttr(p.id || p.name || "partner")}">
          <span class="aff-name">${escapeHtml(p.name || "Partner")}</span>
          ${p.note ? `<span class="aff-note">${escapeHtml(p.note)}</span>` : ""}
          <span class="aff-go">→</span>
        </a>`).join("");
  }

  /* ---------- Newsletter-Lead in Supabase ablegen (optional) ---------- */
  async function saveLeadToSupabase(email, app) {
    const client = window.bwSupabase && window.bwSupabase();
    if (!client) return;
    try {
      await client.from("site_leads").insert([{ email, app: app || null, source: "landing" }]);
    } catch { /* Tracking/Lead darf nie stören */ }
  }

  /* ---------- App-Katalog aus dem SuperAdmin laden (überschreibt apps.js) ---------- */
  async function loadCatalogOverride() {
    const client = window.bwSupabase && window.bwSupabase();
    if (!client) return;
    try {
      const { data } = await client.from("site_config").select("value").eq("key", "apps").maybeSingle();
      if (data && Array.isArray(data.value) && data.value.length) APPS = data.value;
    } catch { /* Fallback: APPS aus apps.js */ }
  }

  /* ---------- Funktionsschalter (Sterne/Kommentare/Aufbau) laden ---------- */
  async function loadSiteFeatures() {
    const client = window.bwSupabase && window.bwSupabase();
    if (!client) return;
    try {
      const { data } = await client.from("site_config").select("value").eq("key", "features").maybeSingle();
      if (data && data.value && typeof data.value === "object") FEATURES = Object.assign(FEATURES, data.value);
    } catch { /* Standardwerte behalten */ }
  }
  function applyConstructionBanner() {
    const b = $("#construction-banner");
    if (b && FEATURES.construction === false) b.style.display = "none";
  }

  /* ---------- Bewertungs-Übersicht (Sterne-Schnitt + Anzahl je App) ---------- */
  async function loadReviewSummary() {
    const client = window.bwSupabase && window.bwSupabase();
    if (!client) return;
    try {
      const { data } = await client.rpc("site_review_summary");
      (data || []).forEach((r) => { REVIEWS[r.app_id] = { avg: r.avg == null ? null : Number(r.avg), count: Number(r.count) }; });
    } catch { /* keine Bewertungen */ }
  }
  function updateCardRating(appId) {
    const a = APPS.find((x) => x.id === appId);
    if (!a) return;
    $$(`.app-card[data-app-id="${appId}"] .app-rating`).forEach((el) => { el.outerHTML = ratingHtml(a); });
  }

  /* ---------- Bewertungs-Dialog ---------- */
  function ensureModal() {
    let m = $("#bw-modal");
    if (m) return m;
    m = document.createElement("div");
    m.className = "bw-modal"; m.id = "bw-modal";
    m.innerHTML = `
      <div class="bw-modal-overlay" data-close></div>
      <div class="bw-modal-card">
        <button class="bw-modal-close" data-close aria-label="Schließen">×</button>
        <div class="bw-modal-head"><div class="mi" id="bwm-ico"></div><h3 id="bwm-title"></h3></div>
        <p class="bw-modal-sub" id="bwm-sub"></p>
        <div id="bwm-form"></div>
        <div class="bw-reviews" id="bwm-reviews"></div>
      </div>`;
    document.body.appendChild(m);
    m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    return m;
  }
  function closeModal() { const m = $("#bw-modal"); if (m) m.classList.remove("open"); }
  function paintStars(box, v) { $$("[data-star]", box).forEach((b) => b.classList.toggle("on", +b.dataset.star <= v)); }

  function openReviewModal(appId) {
    const a = APPS.find((x) => x.id === appId);
    if (!a) return;
    const m = ensureModal();
    const ico = $("#bwm-ico");
    ico.textContent = a.icon; ico.style.background = a.color;
    $("#bwm-title").textContent = a.name + " bewerten";
    rateValue = 0;
    const canRate = FEATURES.ratings !== false;
    const canComment = FEATURES.comments !== false;
    $("#bwm-sub").textContent = canRate
      ? "Wie gefällt dir die App? Deine ehrliche Bewertung hilft anderen."
      : "Hinterlasse einen Kommentar zu dieser App.";
    $("#bwm-form").innerHTML = `
      ${canRate ? `<div class="bw-field">Deine Sterne<div class="star-input" id="bw-stars">${[1,2,3,4,5].map((n) => `<button type="button" data-star="${n}">★</button>`).join("")}</div></div>` : ""}
      ${canComment ? `
        <div class="bw-field">Name (optional)<input id="bw-name" maxlength="40" placeholder="z. B. Max" /></div>
        <div class="bw-field">Dein Kommentar (optional)<textarea id="bw-comment" maxlength="600" placeholder="Was gefällt dir? Was wünschst du dir?"></textarea></div>` : ""}
      <button class="btn btn-primary" id="bw-submit" style="width:100%">Absenden</button>
      <p class="bw-msg" id="bw-msg"></p>`;
    if (canRate) {
      const sBox = $("#bw-stars");
      sBox.addEventListener("click", (e) => { const b = e.target.closest("[data-star]"); if (!b) return; rateValue = +b.dataset.star; paintStars(sBox, rateValue); });
    }
    $("#bw-submit").addEventListener("click", () => submitReview(a));
    loadAppReviews(appId);
    m.classList.add("open");
  }

  async function submitReview(a) {
    const client = window.bwSupabase && window.bwSupabase();
    const msg = $("#bw-msg"); msg.className = "bw-msg";
    if (!client) { msg.textContent = "Bewertungen sind noch nicht eingerichtet."; msg.classList.add("err"); return; }
    const canRate = FEATURES.ratings !== false;
    const canComment = FEATURES.comments !== false;
    if (canRate && !rateValue) { msg.textContent = "Bitte wähle 1–5 Sterne."; msg.classList.add("err"); return; }
    const name = canComment ? (($("#bw-name") || {}).value || "").trim() || null : null;
    const comment = canComment ? (($("#bw-comment") || {}).value || "").trim() || null : null;
    if (!canRate && !comment) { msg.textContent = "Bitte schreibe einen Kommentar."; msg.classList.add("err"); return; }
    let sid = null; try { sid = sessionStorage.getItem("bw24-sid"); } catch {}
    const btn = $("#bw-submit"); btn.disabled = true; btn.textContent = "Sende …";
    try {
      const { error } = await client.from("site_reviews").insert([{ app_id: a.id, rating: rateValue || null, name, comment, session_id: sid }]);
      if (error) throw error;
    } catch (err) { msg.textContent = "Fehler: " + (err.message || err); msg.classList.add("err"); btn.disabled = false; btn.textContent = "Absenden"; return; }
    msg.textContent = "✓ Danke für deine Bewertung!"; msg.classList.add("ok");
    btn.disabled = false; btn.textContent = "Absenden";
    if (window.bwTrack) window.bwTrack("app_review", { app_id: a.id });
    rateValue = 0;
    const sBox = $("#bw-stars"); if (sBox) paintStars(sBox, 0);
    if ($("#bw-comment")) $("#bw-comment").value = "";
    await loadReviewSummary(); updateCardRating(a.id); loadAppReviews(a.id);
  }

  async function loadAppReviews(appId) {
    const box = $("#bwm-reviews"); if (!box) return;
    const client = window.bwSupabase && window.bwSupabase();
    if (!client) { box.innerHTML = ""; return; }
    try {
      const { data } = await client.from("site_reviews")
        .select("rating,name,comment,created_at").eq("app_id", appId)
        .not("comment", "is", null).order("created_at", { ascending: false }).limit(20);
      const list = (data || []).filter((r) => r.comment);
      if (!list.length) { box.innerHTML = `<h4>Kommentare</h4><p class="bw-empty">Noch keine Kommentare – sei der/die Erste!</p>`; return; }
      box.innerHTML = `<h4>Kommentare (${list.length})</h4>` + list.map((r) => `
        <div class="bw-review">
          <div class="bw-review-top">
            <span class="bw-review-name">${escapeHtml(r.name || "Anonym")}</span>
            <span class="bw-review-date">${new Date(r.created_at).toLocaleDateString("de-DE")}</span>
          </div>
          ${r.rating ? `<div class="bw-review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>` : ""}
          <p class="bw-review-text">${escapeHtml(r.comment)}</p>
        </div>`).join("");
    } catch { box.innerHTML = ""; }
  }

  function initReviews() {
    document.addEventListener("click", (e) => {
      const r = e.target.closest("[data-rate]");
      if (r) openReviewModal(r.dataset.rate);
    });
  }

  /* ---------- Back-to-top ---------- */
  function initTop() {
    const btn = $("#to-top");
    if (!btn) return;
    addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 600), { passive: true });
    btn.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Hilfsfunktionen ---------- */
  function hexToRgba(hex, a) {
    const h = String(hex || "#888888").replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/\s+/g, "-"); }

  /* ---------- Jahr im Footer ---------- */
  function initYear() { const y = $("#year"); if (y) y.textContent = new Date().getFullYear(); }

  /* ---------- Start ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    await loadCatalogOverride(); // ggf. im SuperAdmin gepflegten Katalog laden
    await loadSiteFeatures();    // Sterne/Kommentare/Aufbau an oder aus?
    await loadReviewSummary();   // echte Sterne-Schnitte je App
    applyConstructionBanner();
    renderApps();
    renderSpotlight();
    renderHeroMockup();
    initTheme();
    initNav();
    initReveal();
    initFaq();
    initCounters();
    initNewsletter();
    initReviews();
    initCookies();
    initTop();
    initYear();
  });
})();
