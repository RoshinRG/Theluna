const https = require('https');
const fs = require('fs');

const fontUrl = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=optional";
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";

https.get(fontUrl, { headers: { 'User-Agent': userAgent } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        let html = fs.readFileSync('index.html', 'utf8');
        
        // Remove existing font links
        html = html.replace(/<link rel="preload" as="style" href="https:\/\/fonts\.googleapis\.com[^>]+>\s*/g, '');
        html = html.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+>\s*/g, '');
        html = html.replace(/<noscript><link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]+><\/noscript>\s*/g, '');
        html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/g, '');
        html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, '');

        // Inject fonts CSS into the existing <style> block
        html = html.replace('<style>', '<style>\n/* Inlined Google Fonts */\n' + data + '\n');
        
        fs.writeFileSync('index.html', html);
        console.log("Inlined fonts successfully!");
    });
}).on('error', console.error);
