/* =====================================================================
   bolwerk24 — Power-User-Ansicht (nur Lesen)
   Login (Supabase Auth) + read-only Auswertung des Affiliate-Status.
   Zugriff für Rollen 'power' und 'superadmin' (zentrale Tabelle site_roles).
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const sb = () => (window.bwSupabase ? window.bwSupabase() : null);
  const safeHttp = (u) => /^https?:\/\//i.test(String(u || ""));

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
    // Power-User-Berechtigung prüfen (Rolle power ODER superadmin)
    let ok = false;
    try {
      const { data } = await client.rpc("is_site_power");
      ok = data === true;
    } catch { ok = false; }
    if (!ok) {
      await client.auth.signOut();
      $("#login-msg").textContent = "Dieser Account hat keine Power-User-Rolle. (In site_roles eintragen.)";
      return;
    }
    let role = "power";
    try { const { data } = await client.rpc("my_site_role"); if (data) role = data; } catch {}
    const { data: u } = await client.auth.getUser();
    const email = (u && u.user && u.user.email) || "";
    $("#admin-user").textContent = email + (role === "superadmin" ? " · SuperAdmin" : " · Power User");
    showDash();
    loadAffiliateView();
  }

  function showDash() { $("#login").hidden = true; $("#dash").hidden = false; }
  function showLogin() { $("#dash").hidden = true; $("#login").hidden = false; }

  /* ---------------- Affiliate (read-only) ---------------- */
  async function loadAffiliateView() {
    const client = sb(); if (!client) return;
    const statusEl = $("#aff-status");
    const tableEl = $("#aff-table");
    let enabled = false, partners = [];
    try {
      const { data, error } = await client.from("site_config").select("value").eq("key", "affiliate").maybeSingle();
      if (error) throw error;
      enabled = !!(data && data.value && data.value.enabled);
      partners = (data && data.value && Array.isArray(data.value.partners)) ? data.value.partners : [];
    } catch (err) {
      statusEl.innerHTML = '<p class="empty">Fehler: ' + esc(err.message || err) + "</p>";
      tableEl.innerHTML = "";
      return;
    }

    const activeCount = partners.filter((p) => p && p.active && safeHttp(p.url)).length;
    statusEl.innerHTML =
      '<p><span class="badge ' + (enabled ? "ok" : "off") + '">' +
        (enabled ? "● Affiliate AKTIV" : "○ Affiliate deaktiviert") + "</span></p>" +
      '<p class="hint">' + (enabled
        ? activeCount + " von " + partners.length + " Partner(n) werden auf der Seite angezeigt."
        : "Es werden derzeit keine Partner-Empfehlungen angezeigt.") + "</p>";

    if (!partners.length) {
      tableEl.innerHTML = '<p class="empty">Noch keine Partner hinterlegt.</p>';
      return;
    }
    tableEl.innerHTML =
      '<table class="tbl"><thead><tr><th>Name</th><th>Provision/Notiz</th><th>Link</th><th>Status</th></tr></thead><tbody>' +
      partners.map((p) => {
        const live = enabled && p && p.active && safeHttp(p.url);
        return "<tr>" +
          "<td>" + esc(p.name || "—") + "</td>" +
          "<td>" + esc(p.note || "—") + "</td>" +
          "<td>" + (safeHttp(p.url) ? '<a href="' + esc(p.url) + '" target="_blank" rel="sponsored noopener">Link ↗</a>' : "—") + "</td>" +
          '<td><span class="badge ' + (live ? "ok" : "off") + '">' + (live ? "sichtbar" : (p.active ? "aktiv, aber aus" : "inaktiv")) + "</span></td>" +
          "</tr>";
      }).join("") +
      "</tbody></table>";
  }

  /* ---------------- Start ---------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    initLogin();
    const client = sb();
    if (client) {
      const { data } = await client.auth.getSession();
      if (data && data.session) afterLogin();
    }
  });
})();
