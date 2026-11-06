const fs = require('fs');
const path = require('path');

const cssDir = path.join('qoder-website', 'assets', 'css');
const mapData = JSON.parse(fs.readFileSync('qoder-website/download_map.json', 'utf8'));

const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
console.log(`Processing ${cssFiles.length} CSS files...`);

for (const file of cssFiles) {
  const filePath = path.join(cssDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace each asset URL with relative path
  for (const [remoteUrl, localRelPath] of Object.entries(mapData.imgMap)) {
    // localRelPath is like "assets/fonts/something.woff2" or "assets/images/something.png"
    // From assets/css/, relative path is "../fonts/..." or "../images/..."
    const targetPath = localRelPath.replace(/^assets\//, '../');
    
    // Replace both exact remoteUrl and protocol-relative //...
    const protoRelative = remoteUrl.replace(/^https?:/, '');

    // Replace in content
    content = content.split(remoteUrl).join(targetPath);
    content = content.split(protoRelative).join(targetPath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Rewrote asset paths in all CSS files!');
