const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OPTIMIZED_DIR = path.join(__dirname, 'assets', 'optimized');
const MID_DIR = path.join(OPTIMIZED_DIR, 'mid');

if (!fs.existsSync(MID_DIR)) {
  fs.mkdirSync(MID_DIR, { recursive: true });
}

const images = [
  { file: 'Eighteen.png', name: 'Eighteen' },
  { file: 'Library of Stars.png', name: 'Library_of_Stars' },
  { file: 'Moonlit Journals.png', name: 'Moonlit_Journals' },
  { file: 'She Became In Silence.png', name: 'She_Became_In_Silence' },
  { file: 'The Hidden Bloodline.png', name: 'The_Hidden_Bloodline' },
  { file: 'Warmth That Burned.png', name: 'Warmth_That_Burned' },
  { file: 'Whispers of Earth.png', name: 'Whispers_of_Earth' }
];

async function processImages() {
  for (const img of images) {
    const srcPath = path.join(__dirname, 'assets', img.file);
    const destPath = path.join(MID_DIR, `${img.name}.webp`);
    
    if (fs.existsSync(srcPath)) {
      console.log(`Processing ${img.file}...`);
      await sharp(srcPath)
        .resize({ width: 490 })
        .webp({ quality: 75 })
        .toFile(destPath);
      console.log(`Saved ${destPath}`);
    } else {
      console.warn(`File not found: ${srcPath}`);
    }
  }
}

function updateHtml() {
  const htmlPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Update sizes="280px" to sizes="(max-width: 768px) 100vw, 490px"
  html = html.replace(/sizes="280px"/g, 'sizes="(max-width: 768px) 100vw, 490px"');

  // Update srcset to include the new 490w image
  for (const img of images) {
    const searchRegex = new RegExp(`(assets/optimized/${img.name}\\.webp 280w),\\s*(assets/optimized/2x/${img.name}\\.webp 560w)`, 'g');
    html = html.replace(searchRegex, `$1, assets/optimized/mid/${img.name}.webp 490w, $2`);
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Updated index.html');
}

processImages().then(() => {
  updateHtml();
  console.log('Done!');
}).catch(err => console.error(err));
