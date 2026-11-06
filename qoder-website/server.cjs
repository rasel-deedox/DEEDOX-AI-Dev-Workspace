const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3009;
const ROOT = path.resolve(__dirname);
const CONFIG_FILE = path.join(ROOT, 'assets', 'config', 'site_content.json');
const SECRETS_FILE = path.join(ROOT, 'assets', 'config', 'api_keys.local.json');
const ANNOUNCEMENT_FILE = path.join(ROOT, 'assets', 'config', 'announcement_config.json');

function getOpenRouterApiKey() {
  try {
    if (fs.existsSync(SECRETS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8'));
      if (data && data.openrouter_api_key) return data.openrouter_api_key.trim();
    }
  } catch (_) {}
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY.trim();
  return '';
}

function saveOpenRouterApiKey(key, defaultModel, maskInDemo) {
  try {
    const existing = fs.existsSync(SECRETS_FILE) ? JSON.parse(fs.readFileSync(SECRETS_FILE, 'utf-8')) : {};
    const data = {
      ...existing,
      openrouter_api_key: (key !== undefined ? key : existing.openrouter_api_key || '').trim(),
      default_model: defaultModel || existing.default_model || 'openrouter/free',
      mask_in_demo: maskInDemo !== undefined ? maskInDemo : true,
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(SECRETS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save API key to local secrets vault:', err);
    return false;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.exe': 'application/vnd.microsoft.portable-executable'
};

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Title, HTTP-Referer');
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  // CORS & Iframe allow
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Title, HTTP-Referer');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // ================= API ENDPOINTS FOR ADMIN DASHBOARD =================

  // 1. GET /api/site-content
  if (req.method === 'GET' && pathname === '/api/site-content') {
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const data = JSON.parse(raw);
        data.api_security = data.api_security || {};
        // Attach active key for admin display and control
        data.api_security.openrouter_api_key = getOpenRouterApiKey();
        return sendJson(res, 200, data);
      } catch (err) {
        return sendJson(res, 500, { error: 'Failed to read config file: ' + err.message });
      }
    } else {
      return sendJson(res, 404, { error: 'site_content.json not found' });
    }
  }

  // 2. POST /api/site-content
  if (req.method === 'POST' && pathname === '/api/site-content') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updatedData = JSON.parse(body);
        updatedData.meta = updatedData.meta || {};
        updatedData.meta.last_updated = new Date().toISOString();
        updatedData.meta.updated_by = 'DEEDOX Live Admin';

        // Extract and securely persist OpenRouter API key in local vault
        if (updatedData.api_security) {
          if (updatedData.api_security.openrouter_api_key !== undefined) {
            saveOpenRouterApiKey(
              updatedData.api_security.openrouter_api_key,
              updatedData.api_security.default_model,
              updatedData.api_security.mask_in_demo
            );
            // Don't store plain secret in git-tracked site_content.json
            delete updatedData.api_security.openrouter_api_key;
          }
        }

        fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');

        // Sync announcement config
        if (updatedData.announcement) {
          fs.writeFileSync(ANNOUNCEMENT_FILE, JSON.stringify({
            enabled: !!updatedData.announcement.enabled,
            text: updatedData.announcement.text || '',
            link: updatedData.announcement.link || 'download.html'
          }, null, 2), 'utf-8');
        }

        return sendJson(res, 200, {
          success: true,
          message: 'Website content saved successfully and synchronized across all pages!',
          updated_at: updatedData.meta.last_updated
        });
      } catch (err) {
        return sendJson(res, 400, { error: 'Invalid JSON payload: ' + err.message });
      }
    });
    return;
  }

  // 2b. POST /api/admin/test-openrouter (Admin API Key Health Check)
  if (req.method === 'POST' && pathname === '/api/admin/test-openrouter') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const keyToTest = (payload.api_key || getOpenRouterApiKey() || '').trim();
        if (!keyToTest) {
          return sendJson(res, 400, { success: false, error: 'No API key provided or found in vault.' });
        }

        const options = {
          hostname: 'openrouter.ai',
          port: 443,
          path: '/api/v1/auth/key',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${keyToTest}`,
            'HTTP-Referer': 'https://deedoxstudio.com',
            'X-Title': 'DEEDOX AI Dev Workspace'
          }
        };

        const testReq = https.request(options, (testRes) => {
          let testBody = '';
          testRes.on('data', d => testBody += d);
          testRes.on('end', () => {
            try {
              const parsed = JSON.parse(testBody);
              if (testRes.statusCode >= 200 && testRes.statusCode < 300) {
                return sendJson(res, 200, {
                  success: true,
                  status: testRes.statusCode,
                  data: parsed.data || parsed
                });
              } else {
                return sendJson(res, testRes.statusCode, {
                  success: false,
                  status: testRes.statusCode,
                  error: (parsed.error && parsed.error.message) || parsed.message || 'API key rejected by OpenRouter'
                });
              }
            } catch (_) {
              return sendJson(res, testRes.statusCode, { success: false, error: testBody });
            }
          });
        });

        testReq.on('error', (err) => {
          return sendJson(res, 502, { success: false, error: 'Failed to reach OpenRouter: ' + err.message });
        });

        testReq.end();
      } catch (err) {
        return sendJson(res, 400, { success: false, error: err.message });
      }
    });
    return;
  }

  // 2c. ALL /api/openrouter-proxy/* (Secure Transparent Proxy for App Demo Sandbox)
  if (pathname.startsWith('/api/openrouter-proxy')) {
    const subpath = pathname.replace(/^\/api\/openrouter-proxy/, '') || '/auth/key';
    const targetPath = '/api/v1' + subpath + (parsedUrl.search || '');
    const activeKey = getOpenRouterApiKey();

    if (!activeKey) {
      return sendJson(res, 503, {
        error: {
          message: 'DEEDOX Security Proxy: No OpenRouter API key configured in Admin Panel.',
          code: 'NO_API_KEY'
        }
      });
    }

    let reqBodyChunks = [];
    req.on('data', chunk => reqBodyChunks.push(chunk));
    req.on('end', () => {
      const fullReqBody = Buffer.concat(reqBodyChunks);

      const proxyHeaders = {
        'Authorization': `Bearer ${activeKey}`,
        'HTTP-Referer': 'https://deedoxstudio.com',
        'X-Title': 'DEEDOX AI Dev Workspace'
      };

      if (req.headers['content-type']) {
        proxyHeaders['Content-Type'] = req.headers['content-type'];
      }
      if (req.headers['accept']) {
        proxyHeaders['Accept'] = req.headers['accept'];
      }
      if (fullReqBody.length > 0) {
        proxyHeaders['Content-Length'] = fullReqBody.length;
      }

      const proxyOptions = {
        hostname: 'openrouter.ai',
        port: 443,
        path: targetPath,
        method: req.method,
        headers: proxyHeaders
      };

      const proxyReq = https.request(proxyOptions, (proxyRes) => {
        res.statusCode = proxyRes.statusCode;
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Title, HTTP-Referer');
        if (proxyRes.headers['content-type']) {
          res.setHeader('Content-Type', proxyRes.headers['content-type']);
        }
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        sendJson(res, 502, {
          error: {
            message: 'DEEDOX Security Proxy Error: ' + err.message,
            code: 'PROXY_NETWORK_ERROR'
          }
        });
      });

      if (fullReqBody.length > 0) {
        proxyReq.write(fullReqBody);
      }
      proxyReq.end();
    });
    return;
  }

  // 3. POST /api/upload-image (Base64 file upload)
  if (req.method === 'POST' && pathname === '/api/upload-image') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        let filename = (payload.filename || `upload_${Date.now()}.png`).replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        const folder = payload.folder === 'brand' ? 'images' : path.join('images', 'software');
        const targetDir = path.join(ROOT, 'assets', folder);
        
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const targetFilePath = path.join(targetDir, filename);
        let base64Data = payload.data || '';
        if (base64Data.includes(';base64,')) {
          base64Data = base64Data.split(';base64,')[1];
        }

        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(targetFilePath, buffer);

        const subfolder = payload.folder === 'brand' ? 'images' : 'images/software';
        const relativeUrl = 'assets/' + subfolder + '/' + filename;
        
        // Also update site_content.json if image_id is provided
        if (payload.image_id && fs.existsSync(CONFIG_FILE)) {
          try {
            const currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
            if (Array.isArray(currentConfig.images)) {
              const imgEntry = currentConfig.images.find(img => img.id === payload.image_id);
              if (imgEntry) imgEntry.path = relativeUrl;
            }
            if (payload.image_id === 'logo' && currentConfig.branding) {
              currentConfig.branding.logo_url = relativeUrl;
            }
            if (payload.image_id === 'founder' && currentConfig.branding) {
              currentConfig.branding.founder_avatar = relativeUrl;
            }
            if (payload.image_id.startsWith('byw_') && currentConfig.build_your_way && Array.isArray(currentConfig.build_your_way.modules)) {
              const modId = payload.image_id.replace('byw_', '');
              const mod = currentConfig.build_your_way.modules.find(m => m.id === modId || (m.tab_id && m.tab_id.includes(modId)));
              if (mod) mod.image_url = relativeUrl;
            }
            fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
          } catch (_) {}
        }

        return sendJson(res, 200, {
          success: true,
          message: 'Image uploaded and replaced successfully!',
          url: relativeUrl,
          new_path: relativeUrl,
          filename: filename,
          size_bytes: buffer.length
        });
      } catch (err) {
        return sendJson(res, 400, { error: 'Failed to process image upload: ' + err.message });
      }
    });
    return;
  }

  // 4. POST /api/delete-image (Reset to default)
  if (req.method === 'POST' && pathname === '/api/delete-image') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.image_id && fs.existsSync(CONFIG_FILE)) {
          const currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
          if (Array.isArray(currentConfig.images)) {
            const imgEntry = currentConfig.images.find(img => img.id === payload.image_id);
            if (imgEntry) {
              imgEntry.path = imgEntry.default_path;
              if (payload.image_id === 'logo' && currentConfig.branding) {
                currentConfig.branding.logo_url = imgEntry.default_path;
              }
              if (payload.image_id === 'founder' && currentConfig.branding) {
                currentConfig.branding.founder_avatar = imgEntry.default_path;
              }
              if (payload.image_id.startsWith('byw_') && currentConfig.build_your_way && Array.isArray(currentConfig.build_your_way.modules)) {
                const modId = payload.image_id.replace('byw_', '');
                const mod = currentConfig.build_your_way.modules.find(m => m.id === modId || (m.tab_id && m.tab_id.includes(modId)));
                if (mod) mod.image_url = imgEntry.default_path;
              }
              fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
              return sendJson(res, 200, {
                success: true,
                message: `Image reset to default: ${imgEntry.default_path}`,
                url: imgEntry.default_path
              });
            }
          }
        }
        return sendJson(res, 404, { error: 'Image ID not found in registry' });
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
    });
    return;
  }

  // ================= STATIC FILE SERVING =================
  let reqPath = decodeURIComponent(pathname);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  if (reqPath === '/admin') reqPath = '/admin.html';

  let filePath = path.join(ROOT, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('404 Not Found: ' + reqPath);
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (err2, stats2) => {
      if (err2 || !stats2.isFile()) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.end('404 Not Found');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats2.size);
      fs.createReadStream(filePath).pipe(res);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`DEEDOX AI Dev Workspace server running at http://127.0.0.1:${PORT}`);
});
