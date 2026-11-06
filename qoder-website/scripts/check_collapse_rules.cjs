const fs = require('fs');

const content = fs.readFileSync('g:/github_all_repo/rea/qoder-website/assets/css/4b2ff5ff8ff5c412.css', 'utf8');

const matches = content.match(/[^{}]*Collapse[^{}]*\{[^{}]*\}/g) || [];
console.log('Total Collapse rules:', matches.length);
matches.slice(0, 10).forEach(m => console.log(m));
