const fs = require('fs');

const html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');

// 1. Inspect ProductShowcase
const showcaseIdx = html.indexOf('ProductShowcase_productShowcase');
if (showcaseIdx !== -1) {
  console.log('--- ProductShowcase snippet (first 1000 chars) ---');
  console.log(html.slice(showcaseIdx, showcaseIdx + 1200));
}

// 2. Inspect FAQs
const faqIdx = html.indexOf('FAQs_faqsWrap');
if (faqIdx !== -1) {
  console.log('--- FAQs snippet (first 1000 chars) ---');
  console.log(html.slice(faqIdx, faqIdx + 1200));
}
