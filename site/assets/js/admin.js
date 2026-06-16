/* =====================================================================
   bolwerk24 — SuperAdmin-Logik
   Login (Supabase Auth) + Statistik, Newsletter, Affiliate, App-Katalog
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => Number(n || 0).toLocaleString("de-DE");

  const sb = () => (window.bwSupabase ? window.bwSupabase() : null);
  const DEFAULT_APPS = (window.BOLWERK && window.BOLWERK.APPS) || [];
  const appName = (id) => (DEFAULT_APPS.find((a) => a.id === id) || {}).name || id || "—";

  /* ---------------- Login ---------------- */
  function initLogin() {
    if (!window.bwSupabaseReady || !window.bwSupabaseReady()) {
      $("#login-config-warn").hidden = false;
    }
    $("#login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const client = sb();
      const msg = $("#login-msg");
      msg.textContent = "";
      if (!client) { msg.textContent = "Supabase ist nicht konfiguriert (anon-Key fehlt)."; return; }
      const btn = $("#login-btn");
      btn.disabled = true; btn.textContent = "Anmelden …";
      try {
        const { error } = await client.auth.signInWithPassword({
          email: $("#login-email").value.trim(),
          password: $("#login-pass").value,
        });
        if (error) throw error;
        await afterLogin();
      } catch (err) {
        msg.textContent = "Anmeldung fehlgeschlagen: " + (err.message || err);
      } finally {
        btn.disabled = false; btn.textContent = "Anmelden";
      }
    });
    $("#logout-btn").addEventListener("click", async () => {
      const client = sb(); if (client) await client.auth.signOut();
      showLogin();
    });
  }

  async function afterLogin() {
    const client = sb();
    // Admin-Berechtigung prüfen
    let isAdmin = false;
    try {
      const { data } = await client.rpc("is_site_admin");
      isAdmin = data === true;
    } catch { isAdmin = false; }
    if (!isAdmin) {
      await client.auth.signOut();
      $("#login-msg").textContent = "Dieser Account ist kein SuperAdmin. (E-Mail in der Tabelle site_admins eintragen.)";
      return;
    }
    const { data: u } = await client.auth.getUser();
    $("#admin-user").textContent = (u && u.user && u.user.email) || "";
    showDash();
    loadStats(currentDays);
  }

  function showDash() { $("#login").hidden = true; $("#dash").hidden = false; }
  function showLogin() { $("#dash").hidden = true; $("#login").hidden = false; }

  /* ---------------- Tabs ---------------- */
  function initTabs() {
    $("#admin-tabs").addEventListener("click", (e) => {
      const t = e.target.closest(".atab"); if (!t) return;
      $$(".atab").forEach((x) => x.classList.toggle("active", x === t));
      const tab = t.dataset.tab;
      $$(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + tab));
      if (tab === "leads") loadLeads();
      if (tab === "affiliate") loadAffiliate();
      if (tab === "catalog") loadCatalog();
      if (tab === "reviews") loadReviewsAdmin();
      if (tab === "stats") loadStats(currentDays);
    });
  }

  /* ---------------- Statistik ---------------- */
  let currentDays = 30;
  function initStatsRange() {
    $("#stats-range").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#stats-range button").forEach((x) => x.classList.toggle("active", x === b));
      currentDays = parseInt(b.dataset.days, 10) || 30;
      loadStats(currentDays);
    });
  }

  async function loadStats(days) {
    const client = sb(); if (!client) return;
    $("#kpis").innerHTML = '<div class="kpi loading">Lade …</div>';
    let s;
    try {
      const { data, error } = await client.rpc("site_stats", { days });
      if (error) throw error;
      s = data;
    } catch (err) {
      $("#kpis").innerHTML = '<div class="kpi"><div class="kpi-n">—</div><div class="kpi-l">Fehler: ' + esc(err.message || err) + "</div></div>";
      return;
    }
    $("#kpis").innerHTML = [
      ["Seitenaufrufe", s.page_views],
      ["Sitzungen", s.sessions],
      ["App-Öffnungen", s.app_opens],
      ["Neue Anmeldungen", s.leads],
    ].map(([l, n]) => `<div class="kpi"><div class="kpi-n">${num(n)}</div><div class="kpi-l">${l}</div></div>`).join("");

    // Apps
    const apps = s.by_app || [];
    const maxApp = Math.max(1, ...apps.map((a) => Math.max(a.views || 0, a.opens || 0)));
    $("#by-app").innerHTML = apps.length
      ? apps.map((a) => `
        <div class="bar-row">
          <div class="bar-label">${esc(appName(a.app_id))}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round((a.opens || 0) / maxApp * 100)}%"></div></div>
          <div class="bar-val">${num(a.opens)} <span>geöffnet</span> · ${num(a.views)} ges.</div>
        </div>`).join("")
      : '<p class="empty">Noch keine Daten.</p>';

    // Referrer
    const refs = s.top_referrers || [];
    const maxRef = Math.max(1, ...refs.map((r) => r.n || 0));
    $("#referrers").innerHTML = refs.length
      ? refs.map((r) => `
        <div class="bar-row">
          <div class="bar-label">${esc(r.referrer)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round((r.n || 0) / maxRef * 100)}%"></div></div>
          <div class="bar-val">${num(r.n)}</div>
        </div>`).join("")
      : '<p class="empty">Noch keine Daten.</p>';

    // Affiliate-Klicks pro Partner
    const aff = s.by_affiliate || [];
    const maxAff = Math.max(1, ...aff.map((a) => a.clicks || 0));
    $("#by-affiliate").innerHTML = aff.length
      ? aff.map((a) => `
        <div class="bar-row">
          <div class="bar-label">${esc(a.partner)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${Math.round((a.clicks || 0) / maxAff * 100)}%"></div></div>
          <div class="bar-val">${num(a.clicks)} <span>Klicks</span></div>
        </div>`).join("")
      : '<p class="empty">Noch keine Klicks.</p>';

    // Verlauf
    const days_ = s.by_day || [];
    const maxDay = Math.max(1, ...days_.map((d) => d.views || 0));
    $("#by-day").innerHTML = days_.length
      ? days_.map((d) => `
        <div class="spark-col" title="${esc(d.day)}: ${num(d.views)} Aufrufe, ${num(d.sessions)} Sitzungen">
          <div class="spark-bar" style="height:${Math.max(3, Math.round((d.views || 0) / maxDay * 100))}%"></div>
        </div>`).join("")
      : '<p class="empty">Noch keine Daten.</p>';
  }

  /* ---------------- Newsletter-Leads ---------------- */
  let leadsCache = [];
  async function loadLeads() {
    const client = sb(); if (!client) return;
    const wrap = $("#leads-table");
    wrap.innerHTML = "Lade …";
    try {
      const { data, error } = await client.from("site_leads")
        .select("*").order("created_at", { ascending: false }).limit(1000);
      if (error) throw error;
      leadsCache = data || [];
    } catch (err) { wrap.innerHTML = '<p class="empty">Fehler: ' + esc(err.message || err) + "</p>"; return; }
    if (!leadsCache.length) { wrap.innerHTML = '<p class="empty">Noch keine Anmeldungen.</p>'; return; }
    wrap.innerHTML = `
      <table class="tbl">
        <thead><tr><th>Datum</th><th>E-Mail</th><th>App</th><th></th></tr></thead>
        <tbody>
          ${leadsCache.map((l) => `
            <tr>
              <td>${new Date(l.created_at).toLocaleString("de-DE")}</td>
              <td>${esc(l.email)}</td>
              <td>${esc(l.app || "—")}</td>
              <td><button class="lnk-del" data-id="${l.id}" title="Löschen">✕</button></td>
            </tr>`).join("")}
        </tbody>
      </table>`;
    $$(".lnk-del", wrap).forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Diesen Eintrag löschen?")) return;
      const client = sb();
      await client.from("site_leads").delete().eq("id", b.dataset.id);
      loadLeads();
    }));
  }
  function initLeadsCsv() {
    $("#leads-csv").addEventListener("click", () => {
      if (!leadsCache.length) return;
      const rows = [["Datum", "E-Mail", "App"]].concat(
        leadsCache.map((l) => [new Date(l.created_at).toISOString(), l.email, l.app || ""]));
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
      const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = "bolwerk24-newsletter.csv"; a.click();
      URL.revokeObjectURL(url);
    });
  }

  /* ---------------- Affiliate ---------------- */
  let affPartners = [];
  let affEnabled = false;
  async function loadAffiliate() {
    const client = sb(); if (!client) return;
    try {
      const { data } = await client.from("site_config").select("value").eq("key", "affiliate").maybeSingle();
      affPartners = (data && data.value && Array.isArray(data.value.partners)) ? data.value.partners : [];
      affEnabled = !!(data && data.value && data.value.enabled);
    } catch { affPartners = []; affEnabled = false; }
    const sw = $("#aff-enabled"); if (sw) sw.checked = affEnabled;
    renderAff();
  }
  function renderAff() {
    $("#aff-list").innerHTML = affPartners.length
      ? affPartners.map((p, i) => `
        <div class="edit-card" data-i="${i}">
          <div class="edit-row">
            <label>Name<input data-f="name" value="${esc(p.name || "")}" placeholder="z. B. Owayo Trikots" /></label>
            <label>Provision/Notiz<input data-f="note" value="${esc(p.note || "")}" placeholder="z. B. 8 % oder Hinweis" /></label>
          </div>
          <div class="edit-row">
            <label class="grow">Link (mit Partner-ID)<input data-f="url" value="${esc(p.url || "")}" placeholder="https://…" /></label>
            <label class="chk"><input type="checkbox" data-f="active" ${p.active ? "checked" : ""}/> Aktiv</label>
            <button class="del-card" title="Entfernen">🗑</button>
          </div>
          <div class="edit-row">
            <label class="sm">Aktiv ab<input type="date" data-f="from" value="${esc(p.from || "")}" /></label>
            <label class="sm">Aktiv bis<input type="date" data-f="until" value="${esc(p.until || "")}" /></label>
            <span class="hint" style="margin:0;align-self:center">leer = unbegrenzt</span>
          </div>
        </div>`).join("")
      : '<p class="empty">Noch keine Partner. Füge oben einen hinzu.</p>';
    bindEditCards("#aff-list", affPartners);
  }
  function initAffiliate() {
    $("#aff-add").addEventListener("click", () => { affPartners.push({ name: "", url: "", note: "", active: true, id: "p" + Date.now() }); renderAff(); });
    const sw = $("#aff-enabled");
    if (sw) sw.addEventListener("change", () => { affEnabled = sw.checked; });
    $("#aff-save").addEventListener("click", async () => {
      const client = sb(); const msg = $("#aff-msg"); msg.textContent = "Speichere …";
      try {
        const { error } = await client.from("site_config").upsert({
          key: "affiliate",
          value: { enabled: !!(sw && sw.checked), partners: affPartners },
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        msg.textContent = (sw && sw.checked) ? "✓ Gespeichert – Affiliate ist aktiv" : "✓ Gespeichert – Affiliate ist deaktiviert";
      } catch (err) { msg.textContent = "Fehler: " + (err.message || err); }
      setTimeout(() => (msg.textContent = ""), 4000);
    });
  }

  /* ---------------- App-Katalog ---------------- */
  let catApps = [];
  async function loadCatalog() {
    const client = sb(); if (!client) return;
    try {
      const { data } = await client.from("site_config").select("value").eq("key", "apps").maybeSingle();
      catApps = (data && Array.isArray(data.value) && data.value.length) ? data.value : JSON.parse(JSON.stringify(DEFAULT_APPS));
    } catch { catApps = JSON.parse(JSON.stringify(DEFAULT_APPS)); }
    renderCat();
  }
  function renderCat() {
    $("#cat-list").innerHTML = catApps.length
      ? catApps.map((a, i) => `
        <div class="edit-card" data-i="${i}">
          <div class="edit-row">
            <label class="sm">Icon<input data-f="icon" value="${esc(a.icon || "")}" placeholder="🏆" /></label>
            <label class="grow">Name<input data-f="name" value="${esc(a.name || "")}" /></label>
            <label class="sm">ID<input data-f="id" value="${esc(a.id || "")}" /></label>
            <button class="del-card" title="Entfernen">🗑</button>
          </div>
          <div class="edit-row">
            <label class="grow">Tagline<input data-f="tagline" value="${esc(a.tagline || "")}" /></label>
            <label class="sm">Farbe<input data-f="color" type="color" value="${esc(a.color || "#16a34a")}" /></label>
            <label class="sm">Status
              <select data-f="status">
                <option value="live" ${a.status === "live" ? "selected" : ""}>Live</option>
                <option value="soon" ${a.status !== "live" ? "selected" : ""}>Bald</option>
              </select>
            </label>
          </div>
          <div class="edit-row">
            <label class="grow">Link (bei Live)<input data-f="url" value="${esc(a.url || "")}" placeholder="https://…" /></label>
            <label class="sm">Kategorie<input data-f="category" value="${esc(a.category || "")}" /></label>
          </div>
          <div class="edit-row">
            <label class="grow">Beschreibung<input data-f="desc" value="${esc(a.desc || "")}" /></label>
          </div>
        </div>`).join("")
      : '<p class="empty">Keine Apps.</p>';
    bindEditCards("#cat-list", catApps);
  }
  function initCatalog() {
    $("#cat-add").addEventListener("click", () => {
      catApps.push({ id: "app" + Date.now(), name: "Neue App", icon: "✨", category: "alltag", tagline: "", desc: "", tags: [], color: "#6366f1", status: "soon" });
      renderCat();
    });
    $("#cat-reset").addEventListener("click", () => {
      if (!confirm("Katalog auf den Standard aus apps.js zurücksetzen? (erst nach Speichern wirksam)")) return;
      catApps = JSON.parse(JSON.stringify(DEFAULT_APPS)); renderCat();
    });
    $("#cat-save").addEventListener("click", async () => {
      const client = sb(); const msg = $("#cat-msg"); msg.textContent = "Speichere …";
      // tags sauberhalten, falls als String editiert
      catApps.forEach((a) => { if (typeof a.tags === "string") a.tags = a.tags.split(",").map((t) => t.trim()).filter(Boolean); });
      try {
        const { error } = await client.from("site_config").upsert({
          key: "apps", value: catApps, updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        msg.textContent = "✓ Gespeichert – auf der Startseite sofort aktiv";
      } catch (err) { msg.textContent = "Fehler: " + (err.message || err); }
      setTimeout(() => (msg.textContent = ""), 5000);
    });
  }

  /* ---------------- Bewertungen & Funktionsschalter ---------------- */
  async function loadReviewsAdmin() {
    const client = sb(); if (!client) return;
    // 1) Funktionsschalter laden
    let feat = { ratings: true, comments: true, construction: true };
    try {
      const { data } = await client.from("site_config").select("value").eq("key", "features").maybeSingle();
      if (data && data.value) feat = Object.assign(feat, data.value);
    } catch {}
    $("#feat-ratings").checked = feat.ratings !== false;
    $("#feat-comments").checked = feat.comments !== false;
    $("#feat-construction").checked = feat.construction !== false;

    // 2) Bewertungen laden
    const wrap = $("#reviews-table");
    wrap.innerHTML = "Lade …";
    let rows = [];
    try {
      const { data, error } = await client.from("site_reviews")
        .select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      rows = data || [];
    } catch (err) { wrap.innerHTML = '<p class="empty">Fehler: ' + esc(err.message || err) + "</p>"; return; }
    if (!rows.length) { wrap.innerHTML = '<p class="empty">Noch keine Bewertungen.</p>'; return; }
    wrap.innerHTML = `
      <table class="tbl">
        <thead><tr><th>Datum</th><th>App</th><th>Sterne</th><th>Name</th><th>Kommentar</th><th></th></tr></thead>
        <tbody>
          ${rows.map((r) => `
            <tr>
              <td>${new Date(r.created_at).toLocaleDateString("de-DE")}</td>
              <td>${esc(appName(r.app_id))}</td>
              <td class="review-stars">${r.rating ? "★".repeat(r.rating) + "☆".repeat(5 - r.rating) : "—"}</td>
              <td>${esc(r.name || "—")}</td>
              <td>${esc(r.comment || "—")}</td>
              <td><button class="lnk-del" data-id="${r.id}" title="Löschen">✕</button></td>
            </tr>`).join("")}
        </tbody>
      </table>`;
    $$(".lnk-del", wrap).forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Diese Bewertung löschen?")) return;
      await sb().from("site_reviews").delete().eq("id", b.dataset.id);
      loadReviewsAdmin();
    }));
  }
  function initReviewsAdmin() {
    $("#feat-save").addEventListener("click", async () => {
      const client = sb(); const msg = $("#feat-msg"); msg.textContent = "Speichere …";
      const value = {
        ratings: $("#feat-ratings").checked,
        comments: $("#feat-comments").checked,
        construction: $("#feat-construction").checked,
      };
      try {
        const { error } = await client.from("site_config").upsert({ key: "features", value, updated_at: new Date().toISOString() });
        if (error) throw error;
        msg.textContent = "✓ Gespeichert – auf der Startseite sofort aktiv";
      } catch (err) { msg.textContent = "Fehler: " + (err.message || err); }
      setTimeout(() => (msg.textContent = ""), 5000);
    });
  }

  /* ---------------- gemeinsame Editier-Bindung ---------------- */
  function bindEditCards(sel, arr) {
    $$(sel + " .edit-card").forEach((card) => {
      const i = parseInt(card.dataset.i, 10);
      $$("[data-f]", card).forEach((inp) => {
        inp.addEventListener("input", () => {
          const f = inp.dataset.f;
          arr[i][f] = inp.type === "checkbox" ? inp.checked : inp.value;
        });
      });
      const del = $(".del-card", card);
      if (del) del.addEventListener("click", () => { arr.splice(i, 1); (sel === "#aff-list" ? renderAff : renderCat)(); });
    });
  }

  /* ---------------- Start ---------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    initLogin(); initTabs(); initStatsRange(); initLeadsCsv(); initAffiliate(); initCatalog(); initReviewsAdmin();
    // bereits eingeloggt?
    const client = sb();
    if (client) {
      const { data } = await client.auth.getSession();
      if (data && data.session) afterLogin();
    }
  });
})();
