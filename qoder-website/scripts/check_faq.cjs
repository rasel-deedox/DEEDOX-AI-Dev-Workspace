const fs = require('fs');

const html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');

const faqIdx = html.indexOf('FAQs_faqsWrap');
const faqHtml = html.slice(faqIdx, faqIdx + 4000);
console.log('FAQ HTML snippet:');
console.log(faqHtml);
