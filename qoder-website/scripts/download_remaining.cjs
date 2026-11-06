const fs = require('fs');
const path = require('path');
const https = require('https');

const remainingImgs = [
  'https://img.alicdn.com/imgextra/i4/O1CN01QkSxiCocd3D0prc8_!!6000000008124-2-tps-412-412.png',
  'https://img.alicdn.com/imgextra/i3/O1CN01wVhf76tJE1I4s7RM_!!6000000005066-0-tps-2400-1260.jpg',
  'https://img.alicdn.com/imgextra/i4/O1CN018ikLCF1sGya2c3YY4_!!6000000005740-55-tps-206-206.svg',
  'https://img.alicdn.com/imgextra/i3/O1CN01ttLoRRmSVCL24uCu_!!6000000006162-2-tps-1024-1024.png',
  'https://img.alicdn.com/imgextra/i3/O1CN01iBaYP0N5LvJ24uCu_!!6000000004026-2-tps-1024-1024.png',
  'https://img.alicdn.com/imgextra/i1/O1CN01X3R6cFdAd0C0yQLY_!!6000000004926-2-tps-480-480.png',
  'https://img.alicdn.com/imgextra/i1/O1CN01L1kyJdAVwEK0CiGs_!!6000000002346-2-tps-101-17.png',
  'https://img.alicdn.com/imgextra/i1/O1CN01JrroT620h65njJfu7_!!6000000006880-55-tps-42-42.svg',
  'https://img.alicdn.com/imgextra/i2/O1CN01sRHsHaZvtSB06nSm_!!6000000003107-2-tps-54-54.png'
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('Status ' + res.statusCode));
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => { f.close(); resolve(); });
    }).on('error', reject);
  });
}

async function run() {
  const mapData = JSON.parse(fs.readFileSync('qoder-website/download_map.json', 'utf8'));
  let html = fs.readFileSync('qoder-website/index.html', 'utf8');

  for (let i = 0; i < remainingImgs.length; i++) {
    const url = remainingImgs[i];
    const u = new URL(url);
    let name = path.basename(u.pathname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const dest = path.join('qoder-website', 'assets', 'images', name);
    try {
      await download(url, dest);
      const relPath = `assets/images/${name}`;
      mapData.imgMap[url] = relPath;
      html = html.split(url).join(relPath);
      console.log(`Downloaded: ${name}`);
    } catch (e) {
      console.error(`Failed ${url}:`, e.message);
    }
  }

  fs.writeFileSync('qoder-website/download_map.json', JSON.stringify(mapData, null, 2));
  fs.writeFileSync('qoder-website/index.html', html, 'utf8');
  console.log('Updated index.html with all remaining images!');
}

run().catch(console.error);
