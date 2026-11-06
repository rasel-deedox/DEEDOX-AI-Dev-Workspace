const fs = require('fs');

let html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');
const originalLength = html.length;

// Safely filter script tags by processing each <script>...</script> segment
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

let cleanedHtml = html.replace(scriptRegex, (fullMatch, attrs, content) => {
  // If it's an external script for tracking, ads, or Next chunks
  if (/src=["'][^"']*(?:googletagmanager|googleads|doubleclick|clarity|_next\/static\/chunks)/i.test(attrs)) {
    return '<!-- removed external tracking/chunk script -->';
  }
  // If it contains self.__next_f
  if (content.includes('self.__next_f')) {
    return '<!-- removed next_f payload -->';
  }
  // If it contains gtag or analytics
  if (/gtag\b|dataLayer\.push\b/i.test(content)) {
    return '<!-- removed tracking script -->';
  }
  // Keep all other scripts (e.g., ld+json schema, theme setter, sessionStorage logic)
  return fullMatch;
});

// Add custom.css to <head>
if (!cleanedHtml.includes('assets/css/custom.css')) {
  cleanedHtml = cleanedHtml.replace('</head>', '  <link rel="stylesheet" href="assets/css/custom.css">\n</head>');
}

// Add main.js before </body>
if (!cleanedHtml.includes('assets/js/main.js')) {
  cleanedHtml = cleanedHtml.replace('</body>', '  <script src="assets/js/main.js"></script>\n</body>');
}

console.log(`Original size: ${originalLength}, Cleaned size: ${cleanedHtml.length}`);
fs.writeFileSync('g:/github_all_repo/rea/qoder-website/index.html', cleanedHtml, 'utf8');
