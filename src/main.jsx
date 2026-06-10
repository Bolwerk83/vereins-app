import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { NotifMount } from './notifications.jsx'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <NotifMount />
  </>
)

// Service Worker mit Build-Version in der URL registrieren. Bei jedem Deploy
// aendert sich BUILD_ID -> neue Script-URL -> Browser installiert den SW neu,
// aktiviert ihn (skipWaiting) und laedt die Seite einmalig neu. So ist der
// Versionsstand (Badge unten rechts) immer aktuell, ohne Cache-Leeren.
const BUILD_ID = (typeof __BUILD_ID__ !== "undefined") ? __BUILD_ID__ : "dev";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js?v=" + encodeURIComponent(BUILD_ID)).then(reg => {
      reg.update().catch(() => {});
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", () => {
          if (nw.state === "installed" && navigator.serviceWorker.controller) nw.postMessage("SKIP_WAITING");
        });
      });
    }).catch(() => {});
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  });
}
