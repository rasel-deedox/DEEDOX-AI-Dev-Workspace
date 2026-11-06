const fs = require('fs');

const html = fs.readFileSync('qoder-website/index.html', 'utf8');
const idx = html.indexOf('<div hidden=""');
if (idx !== -1) {
  console.log('div hidden snippet:');
  console.log(html.slice(idx, idx + 300));
} else {
  console.log('No div hidden found');
}
