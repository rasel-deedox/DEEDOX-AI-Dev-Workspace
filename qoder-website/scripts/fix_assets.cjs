const fs = require('fs');
const path = require('path');

const imgDir = path.join('qoder-website', 'assets', 'images');
const fontDir = path.join('qoder-website', 'assets', 'fonts');

const mapPath = path.join('qoder-website', 'download_map.json');
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// Fix image filenames
const newImgMap = {};
for (const [url, oldRelPath] of Object.entries(mapData.imgMap)) {
  const oldFullPath = path.join('qoder-website', oldRelPath);
  if (!fs.existsSync(oldFullPath)) {
    newImgMap[url] = oldRelPath;
    continue;
  }

  let baseName = path.basename(oldRelPath);
  let dirName = path.dirname(oldRelPath);

  // Fix double extensions like .png.png, .svg.png, .gif.png, .jpg.png, .webp.png
  let fixedName = baseName.replace(/(\.(png|svg|gif|jpg|jpeg|webp|woff2|woff|ttf))\.png$/i, '$1');

  if (fixedName !== baseName) {
    const newFullPath = path.join('qoder-website', dirName, fixedName);
    fs.renameSync(oldFullPath, newFullPath);
    newImgMap[url] = `${dirName}/${fixedName}`.replace(/\\/g, '/');
  } else {
    newImgMap[url] = oldRelPath.replace(/\\/g, '/');
  }
}

mapData.imgMap = newImgMap;
fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2));
console.log('Fixed asset extensions successfully!');
