/* =====================================================================
   vorsorge.bolwerk24.de — Interaktion
   Eigenständig, ohne Abhängigkeiten. Teilt das Design-System mit bolwerk24.
   ===================================================================== */
(function () {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Theme (Dark/Light) – teilt den Speicher mit bolwerk24 ---------- */
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

  /* ---------- Vormerken (lokaler Fallback ohne Backend) ---------- */
  function initNotify() {
    const form = $("#nl-form");
    if (!form) return;
    const input = $("#nl-email");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { input.focus(); return; }
      try {
        const list = JSON.parse(localStorage.getItem("vorsorge-leads") || "[]");
        list.push({ email, at: Date.now() });
        localStorage.setItem("vorsorge-leads", JSON.stringify(list));
      } catch {}
      form.classList.add("done");
    });
  }

  /* ---------- Back-to-top ---------- */
  function initTop() {
    const btn = $("#to-top");
    if (!btn) return;
    addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 600), { passive: true });
    btn.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Jahr im Footer ---------- */
  function initYear() { const y = $("#year"); if (y) y.textContent = new Date().getFullYear(); }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNav();
    initReveal();
    initFaq();
    initNotify();
    initTop();
    initYear();
  });
})();
