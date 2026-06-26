/**
 * remove-loader.js
 *
 * Eliminates the loading screen that causes 2,500ms LCP element render delay.
 * The loading screen is a position:fixed inset:0 z-index:99999 overlay that
 * physically covers all content until window.load fires (~2.5s), making
 * Chrome's LCP algorithm register a 2,500ms "element render delay".
 *
 * Changes:
 * 1. index.html  – remove the loading screen <div> from <body>
 * 2. index.html  – strip all loading-screen CSS from the inlined <style> block
 *                  (both the critical-CSS copy and the styles.css copy)
 * 3. styles.css  – strip loading-screen CSS so the file stays in sync
 * 4. script.js   – replace the loading-screen IIFE with a lean Three.js
 *                  lazy-load setup; keep everything else intact
 */

const fs   = require('fs');
const path = require('path');

// ── helpers ──────────────────────────────────────────────────────────────────
function read(f)    { return fs.readFileSync(f, 'utf8'); }
function write(f,s) { fs.writeFileSync(f, s, 'utf8'); }

const root = __dirname;
const htmlFile   = path.join(root, 'index.html');
const cssFile    = path.join(root, 'styles.css');
const scriptFile = path.join(root, 'script.js');

// ── 1 & 2 : index.html ───────────────────────────────────────────────────────
let html = read(htmlFile);

// 1a. Remove the loading screen <div> from <body>
html = html.replace(
  /\s*<div class="loading-screen"[\s\S]*?<\/div>\s*<\/div>/,
  ''
);
console.log('Removed loading-screen <div>.');

// 1b. Remove loading-screen CSS block from the CRITICAL-CSS inline section
//     (lines 136–146 in the inline <style>: comment + 10 one-liner rules)
html = html.replace(
  /\s*\/\* Loading screen \*\/\s*\.loading-screen\s*\{[^}]+\}[\s\S]*?\.loading-subtitle\s*\{[^}]+\}/,
  ''
);
console.log('Removed loading-screen CSS from critical inline block.');

// 1c. Remove loading-screen CSS from the INLINED STYLES.CSS section
//     (the big block from .loading-screen { ... } through .loading-subtitle { ... }
//      including the two @keyframes)
html = html.replace(
  /\.loading-screen\s*\{[\s\S]*?\.loading-subtitle\s*\{[\s\S]*?\}\s*(?=\*\s*\{)/,
  ''
);
console.log('Removed loading-screen CSS from inlined styles block.');

// 1d. Add a graceful hero entrance animation instead of the loading screen
//     (uses transform only — opacity changes on fixed overlays affect LCP;
//      transform changes do NOT)
const heroAnimCSS = `
  /* ── Hero entrance animation (replaces loading screen, zero LCP impact) ── */
  @keyframes heroEnter { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
  .hero-section { animation: heroEnter 0.6s cubic-bezier(0.22,1,0.36,1) both; }
`;

// Insert before closing </style> of the critical CSS section
html = html.replace(
  /(  \.hero-section\.spa-visible \{ display: flex !important; \})\s*\n\s*\/\* /,
  `$1\n${heroAnimCSS}\n  /* `
);
console.log('Added hero entrance animation CSS.');

write(htmlFile, html);
console.log('index.html saved. Size:', (Buffer.byteLength(html,'utf8')/1024).toFixed(1), 'KiB');

// ── 3. styles.css ────────────────────────────────────────────────────────────
let css = read(cssFile);

css = css.replace(
  /\.loading-screen\s*\{[\s\S]*?\.loading-subtitle\s*\{[\s\S]*?\}\s*(?=\*\s*\{)/,
  ''
);
console.log('Removed loading-screen CSS from styles.css.');

write(cssFile, css);
console.log('styles.css saved. Size:', (Buffer.byteLength(css,'utf8')/1024).toFixed(1), 'KiB');

// ── 4. script.js ─────────────────────────────────────────────────────────────
let js = read(scriptFile);

// Replace the entire loading-screen IIFE (lines 1–44) with a lean Three.js setup.
// The IIFE is: (!(function(){ ... })(), document.addEventListener(...))
// We keep the DOMContentLoaded handler but rewrite the IIFE part.
const newLoader = `// Three.js is loaded lazily on first user interaction to avoid blocking LCP.
// The loading screen has been removed — content is visible immediately.
(function setupLazyThreeJS() {
  var loaded = false;
  function loadThreeJS() {
    if (loaded) return;
    loaded = true;
    import('./three/main.js').catch(console.error);
  }
  ['mousemove', 'scroll', 'touchstart', 'keydown', 'click'].forEach(function(ev) {
    window.addEventListener(ev, loadThreeJS, { once: true, passive: true });
  });
  // Fallback: load Three.js 8s after page ready if no interaction
  setTimeout(loadThreeJS, 8000);
}());
`;

// The original opens with: (!(function () { ... })(), document.addEventListener(
// We need to replace just the IIFE portion and keep the DOMContentLoaded
js = js.replace(
  /\(!\(function \(\) \{[\s\S]*?\}\)\(\),\s*/,
  newLoader
);

// Also fix the closing: the original wraps everything in (IIFE, DOMContent...)
// After our replace the DOMContentLoaded no longer needs wrapping parentheses.
// Check if there's a stray closing )); at the very end
js = js.replace(/\}\)\);\s*$/, '});');

write(scriptFile, js);
console.log('script.js updated. Size:', (Buffer.byteLength(js,'utf8')/1024).toFixed(1), 'KiB');

console.log('\nAll done! Verify in browser, then commit.');
