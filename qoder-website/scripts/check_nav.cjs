const fs = require('fs');

const html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');

const navIdx = html.indexOf('HeaderNav_headerNav');
if (navIdx !== -1) {
  console.log('--- Nav snippet ---');
  console.log(html.slice(navIdx, navIdx + 1500));
}
