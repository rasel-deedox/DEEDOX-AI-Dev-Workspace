const fs = require('fs');

const html = fs.readFileSync('g:/github_all_repo/rea/qoder-website/index.html', 'utf8');

const matches = [...html.matchAll(/class=["'][^"']*Dropdown[^"']*["']/gi)];
console.log('Dropdown classes found:');
matches.forEach(m => console.log(m[0]));
