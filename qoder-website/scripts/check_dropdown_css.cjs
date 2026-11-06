const fs = require('fs');
const path = require('path');

const cssDir = 'g:/github_all_repo/rea/qoder-website/assets/css';
const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));

for (const f of cssFiles) {
  const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
  if (content.includes('QoderDropdown') || content.includes('LanguageSwitcher')) {
    console.log(`Found Dropdown/LanguageSwitcher in ${f}`);
    const matches = content.match(/[^{}]*(?:QoderDropdown|LanguageSwitcher)[^{}]*\{[^{}]*\}/g) || [];
    matches.slice(0, 10).forEach(m => console.log(m));
  }
}
