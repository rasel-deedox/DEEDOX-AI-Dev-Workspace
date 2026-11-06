const fs = require('fs');

const html = fs.readFileSync('qoder-website/captured_dom.html', 'utf8');

// Find major semantic sections or direct children of __next or body
const tags = [...html.matchAll(/<(header|main|footer|section|div class="[^"]*Banner[^"]*")[^>]*>/gi)].map(m => m[0]);
console.log('Semantic/Banner tags found:');
tags.forEach(t => console.log(t));
