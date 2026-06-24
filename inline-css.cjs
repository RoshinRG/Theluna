const fs = require('fs');
const css = fs.readFileSync('styles.css', 'utf8');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>');
fs.writeFileSync('index.html', html);
