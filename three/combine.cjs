const fs = require('fs');
const path = require('path');

const files = [
  'Starfield.js',
  'Sparkles.js',
  'ShootingStar.js',
  'Nebula.js',
  'HeroMoon.js',
  'CursorTrail.js',
  'ClickStars.js'
];

let combinedCode = `import * as THREE from 'three';\n\n`;

for (const file of files) {
  let content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  // Remove all imports
  content = content.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
  // Remove exports
  content = content.replace(/export\s+class/g, 'class');
  combinedCode += `// --- ${file} ---\n` + content.trim() + '\n\n';
}

// Now handle main.js
let mainContent = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
mainContent = mainContent.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
combinedCode += `// --- main.js ---\n` + mainContent.trim() + '\n';

fs.writeFileSync(path.join(__dirname, 'main_combined.js'), combinedCode);
console.log('Combined successfully into main_combined.js');
