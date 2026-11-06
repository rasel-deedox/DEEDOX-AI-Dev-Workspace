const fs = require('fs');
const path = require('path');

const mapData = JSON.parse(fs.readFileSync('qoder-website/download_map.json', 'utf8'));
let html = fs.readFileSync('qoder-website/captured_dom.html', 'utf8');

// 1. Replace stylesheet links to point to local assets/css/
for (const [remoteCss, localCss] of Object.entries(mapData.cssMap)) {
  html = html.split(remoteCss).join(localCss);
  const protoRel = remoteCss.replace(/^https?:/, '');
  html = html.split(protoRel).join(localCss);
}

// Also check for any remaining alicdn CSS links
const cssRegex = /https:\/\/g\.alicdn\.com\/[^\s"']+\.css/g;
const extraCss = [...new Set(html.match(cssRegex) || [])];
console.log('Extra CSS links still in HTML:', extraCss.length);

// 2. Replace all image URLs with local paths
let imgReplaces = 0;
for (const [remoteImg, localImg] of Object.entries(mapData.imgMap)) {
  if (html.includes(remoteImg)) {
    html = html.split(remoteImg).join(localImg);
    imgReplaces++;
  }
  const protoRel = remoteImg.replace(/^https?:/, '');
  if (html.includes(protoRel)) {
    html = html.split(protoRel).join(localImg);
    imgReplaces++;
  }
}
console.log(`Replaced image URLs: ${imgReplaces}`);

// 3. Find any remaining external images or resources in HTML
const remainingImgs = [...new Set(html.match(/https?:\/\/[^\s"']+\.(?:png|jpg|jpeg|svg|webp|gif)/gi) || [])];
console.log('Remaining external images count:', remainingImgs.length);
if (remainingImgs.length > 0) {
  console.log('Sample remaining images:', remainingImgs.slice(0, 10));
}

// 4. Remove tracking, analytics, and third party scripts (clarity, google tag, bing, etc.)
// These block local rendering or throw console errors
html = html.replace(/<script[^>]*src=["'][^"']*(?:clarity|googletagmanager|google-analytics|bat\.bing|arms-retcode)[^"']*["'][^>]*><\/script>/gi, '');

// Also clean up any Next.js hydration scripts that might overwrite DOM if not connected to server
// Keep DOM intact!
fs.writeFileSync('qoder-website/index.html', html, 'utf8');
console.log('Initial index.html written. Size:', html.length);
