const fs = require('fs');

const html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');

const regex = /<[^>]+id=["']product-showcase-panel-[^"']+["'][^>]*>/gi;
const matches = html.match(regex);
console.log(matches);
