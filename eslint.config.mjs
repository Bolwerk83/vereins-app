// Sicherheitsnetz fuer den Modul-Umbau: NUR "no-undef" - faengt vergessene
// Importe beim Herausloesen von Modulen (esbuild meldet fehlende globale
// Bezeichner nicht; zur Laufzeit waere das ein Crash).
import react from "eslint-plugin-react";

export default [
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: { react },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window:"readonly", document:"readonly", navigator:"readonly",
        localStorage:"readonly", sessionStorage:"readonly", fetch:"readonly",
        console:"readonly", setTimeout:"readonly", clearTimeout:"readonly",
        setInterval:"readonly", clearInterval:"readonly", URL:"readonly",
        URLSearchParams:"readonly", Notification:"readonly", FileReader:"readonly",
        Blob:"readonly", File:"readonly", alert:"readonly", confirm:"readonly",
        prompt:"readonly", crypto:"readonly", atob:"readonly", btoa:"readonly",
        TextEncoder:"readonly", TextDecoder:"readonly", AbortController:"readonly",
        Image:"readonly", requestAnimationFrame:"readonly", cancelAnimationFrame:"readonly",
        performance:"readonly", history:"readonly", location:"readonly",
        IntersectionObserver:"readonly", ResizeObserver:"readonly", getComputedStyle:"readonly",
        structuredClone:"readonly", queueMicrotask:"readonly", caches:"readonly", self:"readonly",
        XMLSerializer:"readonly", __BUILD_ID__:"readonly",
      },
    },
    rules: {
      "no-undef": "error",
      // Kern-ESLint prueft JSX-Komponenten NICHT - diese beiden Regeln
      // schliessen die Luecke (undefinierte Komponenten = Laufzeit-Crash).
      "react/jsx-no-undef": "error",
      "react/jsx-uses-vars": "error",
    },
    settings: { react: { version: "detect" } },
  },
];
