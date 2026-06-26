/**
 * inline-css.js
 * Inlines styles.css into the <head> <style> block in index.html,
 * eliminating the render-blocking <link rel="stylesheet"> request.
 * Also removes the unused preconnect to cdn.jsdelivr.net.
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const cssPath  = path.join(__dirname, 'styles.css');

let html = fs.readFileSync(htmlPath, 'utf8');
let css  = fs.readFileSync(cssPath,  'utf8');

// 1. Strip the leading comment block from styles.css (already in inline style)
css = css.replace(/^\/\*[\s\S]*?\*\/\s*/m, '');

// 2. Replace the closing </style> + script + link combo with full CSS + closing tag
//    Target: everything from  /* Spa section base */ down to the </style>
//    then the duplicate <script> and the <link rel="stylesheet" href="/styles.css">

// Find the closing of the inline <style> block
const closeStyleMarker = '  </style>\n  <script>\n    document.documentElement.classList.add(\'js-enabled\');\n  </script>\n  <!-- styles.css loaded as render-blocking to prevent LCP element render delay -->\n  <link rel="stylesheet" href="/styles.css">';

const replacement = `  /* ─── FULL STYLESHEET (inlined to eliminate render-blocking request) ─────── */
${css.trimEnd()}
  </style>`;

if (!html.includes(closeStyleMarker)) {
  // Try a simpler match
  const simpleMarker = '  <link rel="stylesheet" href="/styles.css">';
  if (!html.includes(simpleMarker)) {
    console.error('Could not find stylesheet link in HTML. Aborting.');
    process.exit(1);
  }
  html = html.replace(simpleMarker, '');
  console.log('Removed standalone <link rel="stylesheet"> tag.');
} else {
  html = html.replace(closeStyleMarker, replacement);
  console.log('Inlined styles.css and removed <link> tag.');
}

// 3. Remove duplicate <script>document.documentElement.classList.add('js-enabled');</script>
//    (there may be two of them after inlining - keep only the first one in <head>)
const jsEnabledScript = "  <script>\n    document.documentElement.classList.add('js-enabled');\n  </script>";
const firstOccurrence = html.indexOf(jsEnabledScript);
if (firstOccurrence !== -1) {
  const secondOccurrence = html.indexOf(jsEnabledScript, firstOccurrence + 1);
  if (secondOccurrence !== -1) {
    html = html.slice(0, secondOccurrence) + html.slice(secondOccurrence + jsEnabledScript.length);
    console.log('Removed duplicate js-enabled script tag.');
  }
}

// 4. Remove the unused preconnect to cdn.jsdelivr.net
html = html.replace(/\s*<link rel="preconnect" href="https:\/\/cdn\.jsdelivr\.net"[^>]*>\n?/g, '\n');
console.log('Removed unused cdn.jsdelivr.net preconnect.');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Done! index.html updated.');
console.log('HTML size: ' + (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1) + ' KiB');
