const fs = require('fs');

const html = fs.readFileSync('qoder-website/captured_dom.html', 'utf8');

// Check main container
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.log('No body tag found!');
  process.exit(1);
}

const bodyContent = bodyMatch[1];
console.log('Body length:', bodyContent.length);

// Look for top level tags in body
const topLevelTags = [...bodyContent.matchAll(/<([a-zA-Z0-9-]+)([^>]*)>/g)].slice(0, 15);
console.log('First 15 elements in body:');
for (const tag of topLevelTags) {
  console.log(`<${tag[1]} ${tag[2].trim()}>`);
}
