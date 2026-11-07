// Supabase Live Sync for DEEDOX AI Dev Workspace Releases & Live Content
(function() {
  const SUPABASE_URL = "https://zyhxtmbxdfdddazcyawu.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aHh0bWJ4ZGZkZGRhemN5YXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMjY3NzUsImV4cCI6MjEwOTYwMjc3NX0.2Yflufo0D2Pc_iDdZAgCjsJEwFUaNP4mprGJAIFfQTI";
  const FALLBACK_DOWNLOAD_URL = "https://github.com/rasel-deedox/DEEDOX-AI-Dev-Workspace/releases/download/v1.0.0/DEEDOX-AI-Dev-Workspace-Setup-1.0.0.exe";

  async function syncFromSupabase() {
    let activeUrl = FALLBACK_DOWNLOAD_URL;
    let activeVersion = "v1.0.0";

    // 1. Fetch latest active release from Supabase app_releases
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/app_releases?select=*&order=created_at.desc&limit=1`, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (res.ok) {
        const releases = await res.json();
        if (releases && releases.length > 0 && releases[0].installer_url) {
          activeUrl = releases[0].installer_url;
          activeVersion = releases[0].version ? `v${releases[0].version.replace(/^v/, '')}` : activeVersion;
        }
      }
    } catch (e) {
      console.warn("[Supabase Sync] Release fetch warning:", e);
    }

    // 2. Fetch custom config from app_config if present
    try {
      const cfgRes = await fetch(`${SUPABASE_URL}/rest/v1/app_config?key=eq.site_content&select=*`, {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (cfgRes.ok) {
        const rows = await cfgRes.json();
        if (rows && rows[0] && rows[0].value) {
          const cfg = rows[0].value;
          if (cfg.downloads?.setup?.url) {
            activeUrl = cfg.downloads.setup.url;
          }
        }
      }
    } catch (e) {
      console.warn("[Supabase Sync] Config fetch warning:", e);
    }

    applyDownloadUrl(activeUrl, activeVersion);
  }

  function applyDownloadUrl(url, version) {
    const selectors = [
      'a[download]',
      'a.DownLoadButton_downloadBtn__CrIrC',
      'a.Button_primary__tdmj4[href*="releases"]',
      'a[href*=".exe"]',
      'a[href*="downloads/AI%20Dev%20Workspace"]',
      'a[href*="downloads/"]'
    ];
    const downloadLinks = document.querySelectorAll(selectors.join(', '));
    downloadLinks.forEach(link => {
      // Don't modify internal page navigation like download.html
      const href = link.getAttribute('href') || '';
      if (href.endsWith('.html') || href.startsWith('#')) return;

      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
    console.log(`[Supabase Sync] Verified active installer URL: ${url} (${version})`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncFromSupabase);
  } else {
    syncFromSupabase();
  }
})();
