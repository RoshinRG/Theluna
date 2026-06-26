/**
 * optimize-images.js
 * Re-generates optimized WebP images at the CORRECT display dimensions to fix
 * "image file is larger than needed" Lighthouse warnings.
 *
 * Sizes generated:
 *   - small (280w)  → 280×350  – default src / mobile  (quality 82)
 *   - mid   (400w)  → 400×500  – desktop card size      (quality 80)
 *   - 2x    (560w)  → 560×700  – retina mobile          (quality 75)
 *
 * The mid/ folder previously held 490×735 images which were ~30-50 KiB larger
 * than necessary for a 280×350 displayed card.
 */

const fs   = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR   = path.join(__dirname, 'assets');
const OPT_DIR      = path.join(ASSETS_DIR, 'optimized');
const MID_DIR      = path.join(OPT_DIR, 'mid');
const TWO_X_DIR    = path.join(OPT_DIR, '2x');

// Ensure output dirs exist
[OPT_DIR, MID_DIR, TWO_X_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

const images = [
  { file: 'Moonlit Journals.png',       name: 'Moonlit_Journals' },
  { file: 'Warmth That Burned.png',     name: 'Warmth_That_Burned' },
  { file: 'The Hidden Bloodline.png',   name: 'The_Hidden_Bloodline' },
  { file: 'Whispers of Earth.png',      name: 'Whispers_of_Earth' },
  { file: 'She Became In Silence.png',  name: 'She_Became_In_Silence' },
  { file: 'Library of Stars.png',       name: 'Library_of_Stars' },
  { file: 'Eighteen.png',               name: 'Eighteen' },
];

/**
 * Each card is displayed at width=280 height=350.
 * On desktop (>768px) cards are max ~400px wide.
 * Retina devices need 2x: up to 560px.
 */
const VARIANTS = [
  { dir: OPT_DIR,   suffix: 'small',  width: 280, quality: 82, descriptor: '280w' },
  { dir: MID_DIR,   suffix: 'mid',    width: 400, quality: 80, descriptor: '400w' },
  { dir: TWO_X_DIR, suffix: '2x',     width: 560, quality: 75, descriptor: '560w' },
];

async function processImages() {
  let totalSaved = 0;

  for (const img of images) {
    const srcPath = path.join(ASSETS_DIR, img.file);
    if (!fs.existsSync(srcPath)) {
      console.warn('  Not found: ' + srcPath);
      continue;
    }

    console.log('\n  ' + img.file);

    for (const v of VARIANTS) {
      const destPath = path.join(v.dir, img.name + '.webp');
      const before = fs.existsSync(destPath) ? fs.statSync(destPath).size : 0;

      await sharp(srcPath)
        .resize({ width: v.width, withoutEnlargement: true })
        .webp({ quality: v.quality, effort: 6 })
        .toFile(destPath);

      const after = fs.statSync(destPath).size;
      const saved = before - after;
      totalSaved += Math.max(0, saved);
      const savedStr = before > 0
        ? ' (was ' + (before/1024).toFixed(1) + ' KiB, saved ' + (saved/1024).toFixed(1) + ' KiB)'
        : ' [new]';
      console.log('    ' + v.suffix + ' (' + v.descriptor + '): ' + (after/1024).toFixed(1) + ' KiB' + savedStr);
    }
  }

  console.log('\nTotal saved: ' + (totalSaved/1024).toFixed(1) + ' KiB');
}

/**
 * Update index.html srcset descriptors:
 *   Old: "... 280w, ...mid/... 490w, ...2x/... 560w"
 *   New: "... 280w, ...mid/... 400w, ...2x/... 560w"
 */
function updateHtml() {
  const htmlPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  let changed = false;

  for (const img of images) {
    // Replace old mid descriptor (490w) with correct one (400w)
    const search = 'assets/optimized/mid/' + img.name + '.webp 490w';
    const replace = 'assets/optimized/mid/' + img.name + '.webp 400w';
    if (html.includes(search)) {
      html = html.split(search).join(replace);
      changed = true;
      console.log('  Updated srcset for ' + img.name + ' (490w -> 400w)');
    }
  }

  if (changed) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('\nindex.html updated');
  } else {
    console.log('\nindex.html already up to date (no 490w descriptors found)');
  }
}

processImages()
  .then(() => {
    console.log('\n--- Updating HTML ---');
    updateHtml();
    console.log('\nDone! Push to git to deploy.');
  })
  .catch(function(err) {
    console.error('Error:', err);
    process.exit(1);
  });
