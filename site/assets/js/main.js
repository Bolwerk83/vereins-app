/* =====================================================================
   bolwerk24.de — Interaktion & Rendering
   ===================================================================== */
(function () {
  "use strict";
  const { CATEGORIES, APPS, CONFIG } = window.BOLWERK || { CATEGORIES: [], APPS: [], CONFIG: {} };
  const NL = (CONFIG && CONFIG.newsletter) || {};
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

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
    const rating = a.rating
      ? `<div class="app-rating"><span class="stars">${"★".repeat(Math.round(a.rating))}</span> ${a.rating.toFixed(1)} <span style="color:var(--text-3);font-weight:500">· ${a.reviews} Bewertungen</span></div>`
      : `<div class="app-rating" style="color:var(--text-3)"><span class="stars" style="color:var(--text-3)">★★★★★</span> Demnächst bewertbar</div>`;
    const action = live
      ? `<a class="btn btn-primary" href="${a.url}" target="_blank" rel="noopener" style="background:${a.color};box-shadow:0 8px 22px -8px ${shadow}">Öffnen ${ICON.arrow}</a>`
      : `<button class="btn btn-soft notify-btn" data-app="${a.name}">Vormerken ${ICON.bell}</button>`;
    return `
    <article class="app-card reveal" data-cat="${a.category}" style="--app:${a.color};--app-soft:${soft};--app-shadow:${shadow}">
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
    if (grid) grid.innerHTML = APPS.map(appCard).join("");

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
  }

  /* ---------- Back-to-top ---------- */
  function initTop() {
    const btn = $("#to-top");
    if (!btn) return;
    addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 600), { passive: true });
    btn.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Hilfsfunktion ---------- */
  function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }

  /* ---------- Jahr im Footer ---------- */
  function initYear() { const y = $("#year"); if (y) y.textContent = new Date().getFullYear(); }

  /* ---------- Start ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderApps();
    renderSpotlight();
    renderHeroMockup();
    initTheme();
    initNav();
    initReveal();
    initFaq();
    initCounters();
    initNewsletter();
    initCookies();
    initTop();
    initYear();
  });
})();
