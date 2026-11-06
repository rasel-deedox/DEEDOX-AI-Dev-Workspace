const fs = require('fs');

const html = fs.readFileSync('qoder-website/index.html', 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('Total script tags:', scripts.length);
scripts.forEach((s, idx) => {
  const src = s[0].match(/src=["']([^"']+)["']/i)?.[1];
  console.log(idx, src || ('Inline script (' + s[1].length + ' chars): ' + s[1].slice(0, 60).replace(/\n/g, ' ')));
});
