const fs = require('fs');

const html = fs.readFileSync('qoder-website/captured_dom.html', 'utf8');

// Stylesheets
const links = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)].map(m => m[0]);
console.log('Stylesheet links count:', links.length);
const hrefs = links.map(l => l.match(/href=["']([^"']+)["']/i)?.[1]).filter(Boolean);
console.log('Stylesheet hrefs:', hrefs);

// Inline styles
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
console.log('Inline style tags count:', styles.length);

// Images & svgs & videos
const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Image count:', imgs.length);

const videos = [...html.matchAll(/<video[^>]*>([\s\S]*?)<\/video>/gi)].map(m => m[0]);
console.log('Video count:', videos.length);
if (videos.length > 0) {
  console.log('Videos:', videos);
}

// Scripts
const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Script count:', scripts.length);

fs.writeFileSync('qoder-website/assets_info.json', JSON.stringify({
  stylesheets: hrefs,
  images: [...new Set(imgs)],
  scripts: scripts
}, null, 2));

