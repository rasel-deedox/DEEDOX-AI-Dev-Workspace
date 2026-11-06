const fs = require('fs');
const path = require('path');

const cssDir = 'g:/github_all_repo/rea/qoder-website/assets/css';
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

for (const f of cssFiles) {
  const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
  if (content.includes('Collapse_contentWrapper') || content.includes('Collapse_iconAdd')) {
    console.log(`Found Collapse rules in ${f}`);
  }
}
