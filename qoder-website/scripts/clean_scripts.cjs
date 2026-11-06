const fs = require('fs');

let html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');
const originalLength = html.length;

// Remove script tags with specific external sources:
// - doubleclick / googleads / gtm
// - _next/static/chunks
html = html.replace(/<script\b[^>]*src=["'][^"']*(?:googletagmanager|googleads|doubleclick|clarity|_next\/static\/chunks)[^"']*["'][^>]*><\/script>/gi, '');

// Remove inline scripts containing self.__next_f
html = html.replace(/<script\b[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi, '');

// Remove tracking inline scripts
html = html.replace(/<script\b[^>]*>[\s\S]*?(?:gtag\b|dataLayer\.push\b)[\s\S]*?<\/script>/gi, '');

// Add custom.css to <head>
if (!html.includes('assets/css/custom.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="assets/css/custom.css">\n</head>');
}

// Add main.js before </body>
if (!html.includes('assets/js/main.js')) {
  html = html.replace('</body>', '  <script src="assets/js/main.js"></script>\n</body>');
}

console.log(`Original size: ${originalLength}, New size: ${html.length}`);
fs.writeFileSync('g:/github_all_repo/rea/qoder-website/index.html', html, 'utf8');
