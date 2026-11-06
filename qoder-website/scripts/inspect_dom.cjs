const fs = require('fs');

const html = fs.readFileSync('qoder-website/captured_dom.html', 'utf8');

// Find major section tags or divs with class or id
const sections = [...html.matchAll(/<(?:section|div|header|footer|nav|main)[^>]*?(?:class|id)=["']([^"']+)["'][^>]*>/gi)];
console.log('Total identified containers:', sections.length);

const classNames = new Set();
for (const s of sections) {
  const classes = s[1].split(/\s+/);
  classes.forEach(c => classNames.add(c));
}
console.log('Unique class count:', classNames.size);
console.log('Sample classes:', [...classNames].slice(0, 50));

