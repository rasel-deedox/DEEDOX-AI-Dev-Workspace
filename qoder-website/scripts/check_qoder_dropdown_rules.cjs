const fs = require('fs');

const content = fs.readFileSync('g:/github_all_repo/rea/qoder-website/assets/css/5426dc103ef002f7.css', 'utf8');

const matches = content.match(/[^{}]*QoderDropdown[^{}]*\{[^{}]*\}/g) || [];
console.log('QoderDropdown rules:');
matches.forEach(m => console.log(m));
