const fs = require('fs');
const path = require('path');

const cssDir = 'g:/github_all_repo/rea/qoder-website/assets/css';
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

for (const f of cssFiles) {
  const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
  if (content.includes('product-showcase') || content.includes('ProductCard_card') || content.includes('aria-hidden')) {
    console.log(`Found relevant rules in ${f}`);
    const matches = content.match(/[^{}]*aria-hidden[^{}]*\{[^{}]*\}/g) || [];
    console.log('aria-hidden matches:', matches);
  }
}
