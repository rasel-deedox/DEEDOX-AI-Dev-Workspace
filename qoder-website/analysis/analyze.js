const fs = require('fs');

const html = fs.readFileSync('qoder-website/captured_dom.html', 'utf8');

const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
console.log('Title:', titleMatch ? titleMatch[1] : 'N/A');

const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
console.log('Meta description:', metaDescMatch ? metaDescMatch[1] : 'N/A');

const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

console.log('H1:', h1s);
console.log('H2s:', h2s);
console.log('H3s:', h3s);

// Check Next.js __NEXT_DATA__
const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (nextDataMatch) {
  console.log('Found __NEXT_DATA__!');
  const nextData = JSON.parse(nextDataMatch[1]);
  fs.writeFileSync('qoder-website/next_data.json', JSON.stringify(nextData, null, 2));
  console.log('Saved next_data.json. Page props keys:', Object.keys(nextData.props?.pageProps || {}));
} else {
  console.log('No __NEXT_DATA__ found');
}

