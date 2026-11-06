const fs = require('fs');

const html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/captured_dom.html', 'utf8');

// Search for any dropdown menu content
const keywords = ['Documentation', 'Blog', 'Changelog', 'Community', 'VS Code'];
for (const kw of keywords) {
  const matches = [...html.matchAll(new RegExp(`[^<]{0,50}${kw}[^>]{0,50}`, 'gi'))];
  console.log(`Keyword "${kw}" occurrences:`, matches.length);
  if (matches.length > 0) {
    console.log('Sample:', matches[0][0]);
  }
}
