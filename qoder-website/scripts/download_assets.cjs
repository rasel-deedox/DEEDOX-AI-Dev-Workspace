const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return resolve(null);
    }
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const client = url.startsWith('https://') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          const u = new URL(url);
          redirectUrl = new URL(redirectUrl, u.origin).toString();
        }
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(destPath);
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function main() {
  const assetsInfo = JSON.parse(fs.readFileSync('qoder-website/assets_info.json', 'utf8'));

  // 1. Download stylesheets
  console.log('Downloading stylesheets...');
  const cssMap = {};
  for (const cssUrl of assetsInfo.stylesheets) {
    const filename = path.basename(cssUrl);
    const dest = path.join('qoder-website', 'assets', 'css', filename);
    try {
      await downloadFile(cssUrl, dest);
      cssMap[cssUrl] = `assets/css/${filename}`;
      console.log(`Downloaded CSS: ${filename}`);
    } catch (err) {
      console.error(`Error downloading ${cssUrl}:`, err.message);
    }
  }

  // 2. Scan downloaded CSS for fonts & background images
  console.log('Scanning CSS for additional assets (fonts, images)...');
  const cssAssets = new Set();
  const cssDir = path.join('qoder-website', 'assets', 'css');
  const cssFiles = fs.readdirSync(cssDir);
  for (const f of cssFiles) {
    if (f.endsWith('.css')) {
      const content = fs.readFileSync(path.join(cssDir, f), 'utf8');
      const matches = [...content.matchAll(/url\((['"]?)([^'"()]+)\1\)/g)];
      for (const m of matches) {
        const u = m[2].trim();
        if (u.startsWith('http://') || u.startsWith('https://')) {
          cssAssets.add(u);
        } else if (u.startsWith('//')) {
          cssAssets.add('https:' + u);
        }
      }
    }
  }
  console.log(`Found ${cssAssets.size} assets inside CSS.`);

  // 3. Download images
  console.log('Downloading page images...');
  const imgMap = {};
  let count = 0;
  for (const imgUrl of assetsInfo.images) {
    if (imgUrl.startsWith('data:')) continue;
    let fullUrl = imgUrl;
    if (fullUrl.startsWith('//')) fullUrl = 'https:' + fullUrl;
    if (!fullUrl.startsWith('http')) continue;

    const urlObj = new URL(fullUrl);
    let filename = path.basename(urlObj.pathname);
    if (!filename || filename.length > 50 || !filename.includes('.')) {
      filename = `img_${count}_${urlObj.pathname.split('/').filter(Boolean).pop() || 'asset'}.png`;
    }
    // Clean filename
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const dest = path.join('qoder-website', 'assets', 'images', filename);
    try {
      await downloadFile(fullUrl, dest);
      imgMap[imgUrl] = `assets/images/${filename}`;
      count++;
      if (count % 10 === 0) console.log(`Downloaded ${count} images...`);
    } catch (err) {
      console.error(`Error downloading ${fullUrl}:`, err.message);
    }
  }
  console.log(`Finished downloading ${count} page images.`);

  // 4. Download CSS assets (fonts, icons, etc.)
  console.log('Downloading CSS assets...');
  let cssAssetCount = 0;
  for (const assetUrl of cssAssets) {
    if (assetUrl.startsWith('data:')) continue;
    let fullUrl = assetUrl;
    if (fullUrl.startsWith('//')) fullUrl = 'https:' + fullUrl;
    if (!fullUrl.startsWith('http')) continue;

    const urlObj = new URL(fullUrl);
    let filename = path.basename(urlObj.pathname);
    if (!filename || filename.length > 60 || !filename.includes('.')) {
      filename = `asset_${cssAssetCount}_${urlObj.pathname.split('/').filter(Boolean).pop() || 'font'}`;
    }
    filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(filename).toLowerCase();
    const subfolder = (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) ? 'fonts' : 'images';
    const dest = path.join('qoder-website', 'assets', subfolder, filename);
    try {
      await downloadFile(fullUrl, dest);
      imgMap[assetUrl] = `assets/${subfolder}/${filename}`;
      cssAssetCount++;
    } catch (err) {
      console.error(`Error downloading CSS asset ${fullUrl}:`, err.message);
    }
  }
  console.log(`Finished downloading ${cssAssetCount} CSS assets.`);

  fs.writeFileSync('qoder-website/download_map.json', JSON.stringify({
    cssMap,
    imgMap
  }, null, 2));
  console.log('Done mapping downloads!');
}

main().catch(console.error);

