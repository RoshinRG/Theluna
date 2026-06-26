/**
 * inline-css2.js
 * Injects styles.css content into the existing <style> block in index.html,
 * right before </style>. Also cleans up the leftover comment.
 */
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const cssPath  = path.join(__dirname, 'styles.css');

let html = fs.readFileSync(htmlPath, 'utf8');
let css  = fs.readFileSync(cssPath,  'utf8');

// Remove the leading comment block from styles.css
css = css.replace(/^\/\*[\s\S]*?\*\/\s*/m, '').trimStart();

// Remove the stale comment about styles.css
html = html.replace(/\s*<!-- styles\.css loaded as render-blocking to prevent LCP element render delay -->\s*/g, '\n');

// Find the closing </style> tag (the one in the <head>)
// We'll inject the full CSS right before it
const closeStyleTag = '  </style>';
const idx = html.indexOf(closeStyleTag);
if (idx === -1) {
  console.error('Could not find </style> in HTML. Aborting.');
  process.exit(1);
}

// Build the injection: a comment + full CSS content
const injection = '\n  /* ─── FULL STYLESHEET INLINED (eliminates render-blocking request) ─────── */\n' + css;

html = html.slice(0, idx) + injection + html.slice(idx);

fs.writeFileSync(htmlPath, html, 'utf8');
const size = Buffer.byteLength(html, 'utf8');
console.log('Done! index.html size: ' + (size / 1024).toFixed(1) + ' KiB');
console.log('styles.css CSS inlined: ' + (Buffer.byteLength(css, 'utf8') / 1024).toFixed(1) + ' KiB of CSS');
