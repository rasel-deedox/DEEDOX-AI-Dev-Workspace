const fs = require('fs');

let html = fs.readFileSync('qoder-website/index.html', 'utf8');

// 1. Remove google ads and gtm scripts
html = html.replace(/<script[^>]*src=["'][^"']*(?:googletagmanager|googleads|doubleclick|clarity)[^"']*["'][^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*>[\s\S]*?(?:gtag|dataLayer\.push)[\s\S]*?<\/script>/gi, '');

// 2. Remove Next.js chunk scripts and __next_f streaming scripts
html = html.replace(/<script[^>]*src=["'][^"']*_next\/static\/chunks\/[^"']*["'][^>]*><\/script>/gi, '');
html = html.replace(/<script[^>]*>[\s\S]*?self\.__next_f[\s\S]*?<\/script>/gi, '');

// 3. Remove Next.js hidden iframe / div wrappers if any
html = html.replace(/<div hidden="">[\s\S]*?<\/div>/gi, '');

// 4. Link our custom stylesheet in <head>
const customCssLink = '  <link rel="stylesheet" href="assets/css/custom.css">\n</head>';
html = html.replace('</head>', customCssLink);

// 5. Link our main.js before </body>
const mainJsScript = '  <script src="assets/js/main.js"></script>\n</body>';
html = html.replace('</body>', mainJsScript);

fs.writeFileSync('qoder-website/index.html', html, 'utf8');
console.log('Cleaned HTML saved. New size:', html.length);
