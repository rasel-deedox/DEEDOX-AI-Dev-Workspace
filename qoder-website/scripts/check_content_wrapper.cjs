const fs = require('fs');

const content = fs.readFileSync('g:/github_all_repo/rea/qoder-website/assets/css/4b2ff5ff8ff5c412.css', 'utf8');

const matches = content.match(/[^{}]*contentWrapper[^{}]*\{[^{}]*\}/g) || [];
console.log('contentWrapper rules:');
matches.forEach(m => console.log(m));
