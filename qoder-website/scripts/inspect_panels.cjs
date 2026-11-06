const fs = require('fs');

const html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');

// Find all panels in ProductShowcase
const panels = [...html.matchAll(/id=["'](product-showcase-panel-[^"']+)["'][^>]*>/gi)];
console.log('Panels found:', panels.length);
panels.forEach(p => console.log(p[0]));
