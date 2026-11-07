/**
 * DEEDOX AI Dev Workspace - Main Interactive Scripts
 * Powers tabs, accordions, banner dismissal, dropdowns, live demo controller, 
 * Day/Night theme switcher, and English/Bengali minimalist Globe language switcher.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTopBanner();
  initProductTabs();
  initFaqAccordion();
  initDropdownMenus();
  initSmoothScroll();
  initThemeToggle();
  initLanguageToggle();
  initLiveDemoController();
  handleUrlHashTab();
  initDynamicContentSync();
  initMobilePreviewSlider();
  initMobileNavigation();
});

/**
 * 1. Top Announcement Banner Dismissal (Configurable via JSON)
 */
function initTopBanner() {
  const banner = document.getElementById('announcementBanner') || document.querySelector('.HeroBanner_heroBanner__GHEHT');
  const bannerLink = document.getElementById('announcementBannerLink') || (banner ? banner.querySelector('a') : null);
  const bannerText = document.getElementById('announcementBannerText') || (banner ? banner.querySelector('.HeroBanner_bannerText__BXXA6') : null);
  const closeBtn = document.querySelector('.HeroBanner_bannerClose___F9iX');

  if (!banner) return;

  // By default, OFF / hidden as explicitly requested by user
  banner.style.display = 'none';

  // Read config from assets/config/announcement_config.json
  fetch('assets/config/announcement_config.json')
    .then(res => res.json())
    .then(config => {
      if (config && config.enabled && sessionStorage.getItem('devworkspace_hero_banner_hidden') !== 'true') {
        if (bannerText && config.text) bannerText.innerHTML = config.text;
        if (bannerLink && config.link) bannerLink.href = config.link;
        banner.style.display = 'block';
        document.documentElement.removeAttribute('data-hero-banner-hidden');
      } else {
        banner.style.display = 'none';
        document.documentElement.setAttribute('data-hero-banner-hidden', 'true');
      }
    })
    .catch(() => {
      banner.style.display = 'none';
      document.documentElement.setAttribute('data-hero-banner-hidden', 'true');
    });

  if (closeBtn && banner) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      banner.style.transition = 'opacity 0.3s ease, max-height 0.3s ease';
      banner.style.opacity = '0';
      banner.style.maxHeight = '0px';
      banner.style.overflow = 'hidden';
      setTimeout(() => {
        banner.style.display = 'none';
        document.documentElement.setAttribute('data-hero-banner-hidden', 'true');
        sessionStorage.setItem('devworkspace_hero_banner_hidden', 'true');
      }, 300);
    });
  }


}

/**
 * 2. "Build Your Way" Showcase Tabs & Panels
 */
function initProductTabs() {
  const tabList = document.querySelector('.ProductTabs_tabs__hf_U8');
  if (!tabList) return;

  const tabs = tabList.querySelectorAll('.ProductTabs_tab__3WF11');
  const panels = document.querySelectorAll('#product-showcase-container .ProductCard_card__rcHEz');
  const dots = document.querySelectorAll('.ProductDots_dot__QEgv_');

  if (!tabs.length || !panels.length) return;

  window.activateProductTab = function(index) {
    // 1. Update tabs state
    tabs.forEach((tab, i) => {
      const isTarget = (i === index);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      if (isTarget) {
        tab.classList.add('ProductTabs_active__Pt3CX', 'Button_outline___PVmw');
        tab.classList.remove('Button_text__2sxAJ');
      } else {
        tab.classList.remove('ProductTabs_active__Pt3CX', 'Button_outline___PVmw');
        tab.classList.add('Button_text__2sxAJ');
      }
    });

    // 2. Update panels state
    panels.forEach((panel, i) => {
      const isTarget = (i === index);
      panel.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
      panel.style.display = isTarget ? 'grid' : 'none';
      if (isTarget) {
        panel.style.animation = 'qoderFadeIn 0.3s ease-in-out';
      }
    });

    // 3. Update dots
    dots.forEach((dot, i) => {
      const isTarget = (i === index);
      if (isTarget) {
        dot.style.width = '24px';
        dot.style.background = '#255A41';
        dot.classList.add('active');
      } else {
        dot.style.width = '6px';
        dot.style.background = 'rgba(128,128,128,0.3)';
        dot.classList.remove('active');
      }
    });
  };

  // Attach click listeners to tabs
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      window.activateProductTab(index);
    });
  });

  // Attach click listeners to dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      window.activateProductTab(index);
    });
  });
}

/**
 * Handle URL hash navigation for tabs (#launcher, #roundtable, #error-fixer, #drive-scanner, #pc-apps)
 */
function handleUrlHashTab() {
  const hash = window.location.hash.toLowerCase();
  if (!hash) return;

  const tabMap = {
    '#launcher': 0,
    '#product-showcase-panel-desktop': 0,
    '#roundtable': 1,
    '#error-fixer': 2,
    '#drive-scanner': 3,
    '#pc-apps': 4
  };

  if (hash in tabMap && typeof window.activateProductTab === 'function') {
    window.activateProductTab(tabMap[hash]);
    const targetEl = document.getElementById(hash.slice(1)) || document.getElementById('products');
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }
}

/**
 * 3. FAQ Collapsible Accordions
 */
function initFaqAccordion() {
  const faqHeaders = document.querySelectorAll('.FAQs_header__qrniV, .Collapse_header__WsXBa');

  faqHeaders.forEach((header) => {
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      const targetContentId = header.getAttribute('aria-controls');
      const contentWrapper = targetContentId ? document.getElementById(targetContentId) : header.nextElementSibling;
      const icon = header.querySelector('.Collapse_icon___LbvV');

      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        if (icon) icon.classList.remove('Collapse_expanded__fEgFu');
        if (contentWrapper) {
          contentWrapper.classList.remove('Collapse_contentWrapperExpanded__935tV');
        }
      } else {
        header.setAttribute('aria-expanded', 'true');
        if (icon) icon.classList.add('Collapse_expanded__fEgFu');
        if (contentWrapper) {
          contentWrapper.classList.add('Collapse_contentWrapperExpanded__935tV');
        }
      }
    });
  });
}

/**
 * 4. Header Dropdown Menus
 */
function initDropdownMenus() {
  const dropdowns = document.querySelectorAll('.QoderDropdown_dropdown__CACRn');

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.QoderDropdown_dropdownTrigger__TtQK8');
    const menu = dropdown.querySelector('.QoderDropdown_menu');
    if (!trigger || !menu) return;

    dropdown.addEventListener('mouseenter', () => {
      menu.style.display = 'block';
    });
    dropdown.addEventListener('mouseleave', () => {
      menu.style.display = 'none';
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.QoderDropdown_menu').forEach(m => m.style.display = 'none');
  });
}

/**
 * 5. Smooth scrolling for internal anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;

      const tabMap = {
        'launcher': 0,
        'product-showcase-panel-desktop': 0,
        'roundtable': 1,
        'error-fixer': 2,
        'drive-scanner': 3,
        'pc-apps': 4
      };

      if (targetId in tabMap && typeof window.activateProductTab === 'function') {
        window.activateProductTab(tabMap[targetId]);
      }

      const targetEl = document.getElementById(targetId) || document.getElementById('products');
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/**
 * 6. Theme Switcher (Dark/Light mode) & Demo Software Theme Synchronization
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const toggleLabel = document.getElementById('themeToggleLabel');
  const toggleSvg = document.getElementById('themeToggleIconSvg');
  const demoThemeBtn = document.getElementById('demoInternalThemeBtn');
  const demoThemeIcon = document.getElementById('demoThemeIcon');
  const demoThemeText = document.getElementById('demoThemeText');

  // Default to 'light' (Day Mode) as requested
  const savedTheme = localStorage.getItem('devworkspace_site_theme') || 'light';
  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  if (demoThemeBtn) {
    demoThemeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  function applyTheme(theme) {
    const isDark = (theme === 'dark');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('devworkspace_site_theme', isDark ? 'dark' : 'light');

    if (toggleLabel) {
      toggleLabel.textContent = isDark ? 'Light' : 'Dark';
    }

    if (toggleSvg) {
      if (isDark) {
        // Sun icon for switching back to Light mode
        toggleSvg.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      } else {
        // Moon icon for switching to Night mode
        toggleSvg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      }
    }

    if (demoThemeIcon) demoThemeIcon.textContent = isDark ? '🌙' : '☀️';
    if (demoThemeText) demoThemeText.textContent = isDark ? 'Night Mode' : 'Day Mode';

    // Synchronize to the embedded demo app iframe
    syncThemeToIframe(isDark ? 'nova-dark' : 'soft-light');
    if (window.renderMobileSlide) window.renderMobileSlide();
  }
  window.applySiteTheme = applyTheme;
}

/**
 * 7. Language Switcher (Minimalist World/Globe Button)
 * 100% English by default. Clicking toggles between English and Bengali.
 */
const I18N_DICT = {
  en: {
    nav_explore: 'Explore Pages',
    menu_home: 'Home Hub',
    menu_sandbox: 'Interactive Demo Sandbox',
    menu_features: 'Features & Architecture',
    menu_download: 'Official Windows Downloads',
    menu_about: 'About DEEDOX & Founder',
    menu_admin: 'Admin Console',
    nav_sandbox: 'Live Sandbox',
    nav_launcher: 'Pulse Launcher',
    nav_roundtable: 'Multi-Agent Studio',
    nav_fixer: '1-Click Fixer',
    nav_scanner: 'Drive AutoScan',
    nav_downloads: 'Downloads',
    nav_about: 'About DEEDOX',
    btn_download: 'Download',
    hero_tag: '⚡ Official v1.0.0 Release: Autonomous Multi-Agent Desktop Platform',
    hero_title: 'The New AI Dev Workspace: Autonomous Coding & Server Orchestration',
    hero_desc: 'Bring your idea. AI Dev Workspace gets it done with 7 animated 3D agent personas, Pulse background process watching (:5173), and 1-click AST self-healing.',
    hero_dl_btn: 'Download Windows (.exe)',
    hero_demo_btn: 'Interactive Demo Sandbox',
    hero_video_btn: 'Watch Video Demo',
    byw_title: 'Build Your Way',
    byw_desc: 'The AI Dev Workspace product family supports every way of building, so individuals and teams can find the tools that fit their workflow.',
    tab_launcher: 'Pulse Launcher',
    tab_roundtable: 'Multi-Agent Roundtable',
    tab_fixer: '1-Click Error Fixer',
    tab_scanner: 'Drive AutoScan',
    tab_bridge: 'PC Apps Bridge',
    badge_launcher: 'Process Watchdog • Auto Ports :5173 / :3000',
    p1_title: 'Pulse Dev Process Watchdog',
    p1_sub: 'Autonomous Port Collision Management & Live Server Telemetry',
    p1_desc: 'Manage and orchestrate all local development servers with zero terminal friction. Pulse continuously monitors port occupancy, terminates orphaned processes, and boots your Vite, Next.js, and Node servers on demand with live health metrics.',
    guide_title: 'Quick Workflow Guide:',
    p1_point1: 'Auto Port Collision Detection: Identifies if port :5173, :3000, or :8080 is blocked and frees it instantly.',
    p1_point2: 'Real-time Telemetry: Instant visibility into memory consumption, CPU load, and server uptime.',
    p1_point3: 'Hot Reload Watchdog: Automatically detects fallen child processes and restarts them silently.',
    btn_dl_setup: 'Download Windows Setup (88.7 MB)',
    btn_try_sandbox: 'Try Live Sandbox Demo →',
    badge_roundtable: 'Collaborative Consensus • 7 3D Miniatures',
    p2_title: 'Multi-Agent Roundtable Studio',
    p2_sub: '7 Interactive 3D Avatars Collaborating for Flawless Architecture',
    p2_desc: 'Assemble a council of specialized AI engineers directly inside your desktop workspace. The Lead Architect, Security Auditor, Frontend Engineer, and QA Testers collaborate in real-time with 3D miniature avatars to review code and plan features before implementation.',
    p2_point1: 'Summon AI Council: Trigger multi-perspective debates across specialized personas for any complex problem.',
    p2_point2: 'Consensus Code Verification: Personas scrutinize security flaws, performance regressions, and clean architecture.',
    p2_point3: '3D Miniature Feedback: Visual status cues indicate speaking, researching, compiling, and testing states.',
    btn_roundtable_demo: 'Test Multi-Agent Sandbox →',
    btn_models: 'Model Architecture',
    badge_fixer: 'AST Diagnostic Engine • Instant Auto-Patch',
    p3_title: '1-Click Autonomous Error Diagnostic',
    p3_sub: 'Deep AST Log Parsing, Root Cause Explanation & Self-Healing Patches',
    p3_desc: 'Eliminate debugging fatigue. When terminal crashes, webpack bundle errors, or React runtime exceptions occur, AI Dev Workspace analyzes the stack trace, extracts the AST node, and provides a 1-click self-healing patch directly to disk.',
    p3_point1: 'Live Terminal Interception: Automatically intercepts build errors, missing dependencies, and syntax failures.',
    p3_point2: 'AST Root Cause Breakdown: Explains the exact failure point in clear terms with highlighted diffs.',
    p3_point3: '1-Click Auto Patch: Applies atomic file fixes to your repository with automated rollback safeguards.',
    btn_fixer_demo: 'View Error Fixer Demo →',
    btn_get_executable: 'Download Executable',
    badge_scanner: 'Local Drive Indexer • Zero Cloud Upload',
    p4_title: 'Autonomous Drive AutoScan',
    p4_sub: 'Recursive Project Discovery across C:, D:, and E: Drives',
    p4_desc: 'Instant visibility over all your codebases without tedious directory browsing. The sovereign drive scanner walks your storage drives in milliseconds, discovering Git repositories, package.json definitions, and framework configurations.',
    p4_point1: '1-Click Drive Sweep: Scans root drives C:, D:, and E: with zero network transmissions.',
    p4_point2: 'Framework Recognition: Detects Vite, Next.js, React, Electron, Python, and Rust setups.',
    p4_point3: 'Instant Switcher: Switch between hundreds of local repositories in under 100 milliseconds.',
    btn_scanner_demo: 'Try Drive AutoScan Demo →',
    btn_architecture: 'Explore Architecture',
    badge_bridge: 'Native Bridge • VS Code, Figma & Chrome',
    p5_title: 'PC Apps & Environment Bridge',
    p5_sub: 'Unified Control Hub for Installed Development Applications',
    p5_desc: 'Bridge your desktop IDEs, browsers, design tools, and terminal sessions into a single orchestrator. Launch VS Code with project context, mirror UI in Google Chrome, sync designs with Figma, and orchestrate Git workflows effortlessly.',
    p5_point1: 'App Auto-Discovery: Automatically detects installed editors, browsers, and terminal emulators.',
    p5_point2: 'Deep Project Launch: Launches target workspaces straight into VS Code, Cursor, or WebStorm.',
    p5_point3: 'Integrated Dev Flow: Jump from Figma design specs directly into code generation and browser viewports.',
    btn_bridge_features: 'View PC Apps Features →',
    dl_tag: 'OFFICIAL RELEASES',
    dl_title: 'Download AI Dev Workspace for Windows',
    dl_subtitle: 'Choose between the full Windows Installer Wizard or the zero-install Portable executable. Both binaries are cryptographically signed and SHA-256 verified.',
    dl_installer_title: 'Windows Setup (.exe)',
    dl_installer_type: 'Standard Desktop Installer Wizard • 64-bit',
    dl_installer_desc: 'Installs AI Dev Workspace with automatic desktop shortcuts, Start menu integration, and local PATH registry for instant terminal access.',
    dl_file_info: 'File: AI Dev Workspace Setup 1.0.0.exe (88.7 MB)',
    dl_btn: 'Download Windows Setup (88.7 MB)',
    dl_portable_title: 'Windows Portable (.exe)',
    dl_portable_type: 'Standalone Single Executable • 64-bit',
    dl_portable_desc: 'Zero installation required. Run directly from any USB flash drive or local directory without admin permissions or system modification.',
    dl_portable_btn: 'Download Portable (.exe — 88.4 MB)',
    box_title: "What's in the Box: Everything Included with AI Dev Workspace",
    box_sub: 'Zero external bloatware. Runs 100% locally on your Windows machine with sovereign offline execution.',
    box_feat1_title: '7 Autonomous 3D Agent Avatars',
    box_feat1_desc: 'DEEDOX Master AI, Frontend Architect, Backend Engineer, Cyber Security Auditor, DevOps Engineer, QA Tester, and Bug Hunter Pro with animated speech and eye-movement avatars.',
    box_feat2_title: 'Pulse Server Orchestrator',
    box_feat2_desc: 'Automatic background process manager for Vite (:5173), Next.js (:3000), FastAPI (:8080), with live port conflict resolution and terminal streaming.',
    box_feat3_title: '1-Click AST Error Fixer',
    box_feat3_desc: 'Real-time stack trace analyzer that diagnoses runtime crashes, blocked ports, and missing npm/pip packages with instant 1-click self-healing patches.',
    box_feat4_title: 'Drive AutoScan Engine',
    box_feat4_desc: 'High-speed local repository discovery across C:, D:, and E: drives. Discovers Git repos, package configurations, and dev environments in seconds.',
    box_feat5_title: 'PC Apps & IDE Bridge',
    box_feat5_desc: 'Launch and sync with installed tools: VS Code, Cursor, Chrome, Discord, and Figma with deep project context passing and zero configuration.',
    box_feat6_title: 'Air-Gapped Sovereign Privacy',
    box_feat6_desc: 'Your code never leaves your computer. Operates completely offline with local LLM support (Ollama) and air-gapped sandboxing for mission-critical software.'
  },
  bn: {
    nav_explore: 'পেজসমূহ',
    menu_home: 'হোম হাব',
    menu_sandbox: 'ইন্টারেক্টিভ ডেমো স্যান্ডবক্স',
    menu_features: 'ফিচার ও আর্কিটেকচার',
    menu_download: 'অফিসিয়াল উইন্ডোজ ডাউনলোড',
    menu_about: 'ডিডক্স ও ফাউন্ডার পরিচিতি',
    menu_admin: 'অ্যাডমিন কনসোল',
    nav_sandbox: 'লাইভ স্যান্ডবক্স',
    nav_launcher: 'পালস লঞ্চার',
    nav_roundtable: 'মাল্টি-এজেন্ট স্টুডিও',
    nav_fixer: '১-ক্লিক ফিক্সার',
    nav_scanner: 'ড্রাইভ অটোস্ক্যান',
    nav_downloads: 'ডাউনলোড',
    nav_about: 'ডিডক্স পরিচিতি',
    btn_download: 'ডাউনলোড',
    hero_tag: '⚡ অফিশিয়াল v1.0.0 রিলিজ: স্বয়ংক্রিয় মাল্টি-এজেন্ট ডেস্কটপ প্ল্যাটফর্ম',
    hero_title: 'নতুন এআই ডেভ ওয়ার্কস্পেস: স্বয়ংক্রিয় কোডিং ও সার্ভার অর্কেস্ট্রেশন',
    hero_desc: 'আপনার আইডিয়া নিয়ে আসুন। এআই ডেভ ওয়ার্কস্পেস ৭টি অ্যানিমেটেড থ্রিডি পারসোনা, পালস ব্যাকগ্রাউন্ড প্রসেস ওয়াচিং ও ১-ক্লিক এএসটি সেলফ-হিলিং দিয়ে কাজ সম্পন্ন করে।',
    hero_dl_btn: 'ডাউনলোড উইন্ডোজ (.exe)',
    hero_demo_btn: 'ইন্টারেক্টিভ ডেমো স্যান্ডবক্স',
    hero_video_btn: 'ভিডিও ডেমো দেখুন',
    byw_title: 'আপনার পছন্দমতো তৈরি করুন',
    byw_desc: 'এআই ডেভ ওয়ার্কস্পেস প্রতিটি কাজের ধরনকে সমর্থন করে, যাতে ডেভেলপার ও টিম তাদের নিজস্ব ওয়ার্কফ্লো অনুযায়ী সেরা টুল ব্যবহার করতে পারে।',
    tab_launcher: 'পালস লঞ্চার',
    tab_roundtable: 'মাল্টি-এজেন্ট রাউন্ডটেবিল',
    tab_fixer: '১-ক্লিক এরর ফিক্সার',
    tab_scanner: 'ড্রাইভ অটোস্ক্যান',
    tab_bridge: 'পিসি অ্যাপস ব্রিজ',
    badge_launcher: 'প্রসেস ওয়াচডগ • অটো পোর্ট :5173 / :3000',
    p1_title: 'পালস ডেভ প্রসেস ওয়াচডগ',
    p1_sub: 'স্বয়ংক্রিয় পোর্ট কলিশন সমাধান ও লাইভ সার্ভার টেলিমেট্রি',
    p1_desc: 'কোনো টার্মিনাল ঝামেলা ছাড়াই সব লোকাল ডেভেলপমেন্ট সার্ভার মনিটর করুন। পালস ক্রমাগত পোর্ট দখল পরীক্ষা করে, অকার্যকর প্রসেস বন্ধ করে এবং রিয়েল-টাইম হেলথ মেট্রিকসহ প্রজেক্ট বুট করে।',
    guide_title: 'সহজ ব্যবহার নির্দেশিকা:',
    p1_point1: 'অটো পোর্ট কলিশন ডিটেকশন: পোর্ট :5173, :3000 বা :8080 ব্লক হলে নিজে থেকেই মুক্ত করে দেয়।',
    p1_point2: 'রিয়েল-টাইম টেলিমেট্রি: মেমরি ব্যবহার, সিপিইউ লোড ও সার্ভার আপটাইম তাৎক্ষণিক দেখুন।',
    p1_point3: 'হট রিলোড ওয়াচডগ: কোনো চাইল্ড প্রসেস ক্র্যাশ করলে স্বয়ংক্রিয়ভাবে রিস্টার্ট করে।',
    btn_dl_setup: 'ডাউনলোড উইন্ডোজ সেটআপ (৮৮.৭ MB)',
    btn_try_sandbox: 'লাইভ স্যান্ডবক্স ডেমো দেখুন →',
    badge_roundtable: 'সম্মিলিত মতামত • ৭টি ৩ডি মিনিয়াচার',
    p2_title: 'মাল্টি-এজেন্ট রাউন্ডটেবিল স্টুডিও',
    p2_sub: 'নির্ভুল আর্কিটেকচারের জন্য ৭টি অ্যানিমেটেড ৩ডি এআই পারসোনা',
    p2_desc: 'আপনার ডেস্কটপেই তৈরি করুন বিশেষায়িত এআই ইঞ্জিনিয়ারদের পরামর্শ পরিষদ। লিড আর্কিটেক্ট, সিকিউরিটি অডিটর, ফ্রন্টএন্ড ইঞ্জিনিয়ার ও কিউএ টেস্টাররা ৩ডি মিনিয়াচার অবতার হিসেবে কোড রিভিউ করে।',
    p2_point1: 'এআই কাউন্সিল আহ্বান: যেকোনো জটিল সমস্যার সমাধানে বিশেষায়িত পারসোনাদের আলোচনা শুরু করুন।',
    p2_point2: 'যৌথ কোড যাচাই: কোড লেখার আগেই নিরাপত্তা ত্রুটি ও আর্কিটেকচার পুঙ্খানুপুঙ্খ পরীক্ষা করা হয়।',
    p2_point3: '৩ডি মিনিয়াচার স্ট্যাটাস: কে কথা বলছে, কে ভাবছে বা কে টেস্ট করছে তা জীবন্ত দেখতে পাবেন।',
    btn_roundtable_demo: 'মাল্টি-এজেন্ট স্যান্ডবক্স টেস্ট করুন →',
    btn_models: 'মডেল আর্কিটেকচার',
    badge_fixer: 'এএসটি ডায়াগনস্টিক ইঞ্জিন • তাৎক্ষণিক অটো-প্যাচ',
    p3_title: '১-ক্লিক স্বয়ংক্রিয় এরর ডায়াগনস্টিক',
    p3_sub: 'গভীর এএসটি লগ পার্সিং, মূল কারণ ব্যাখ্যা ও সেলফ-হিলিং প্যাচ',
    p3_desc: 'ডিবাগিংয়ের ক্লান্তি দূর করুন। টার্মিনাল ক্র্যাশ, ওয়েবপ্যাক বান্ডল এরর বা রিঅ্যাক্ট রানটাইম সমস্যা হলে এআই স্ট্যাক ট্রেস বিশ্লেষণ করে সরাসরি ডিস্কে ১-ক্লিক প্যাচ প্রয়োগ করে।',
    p3_point1: 'লাইভ টার্মিনাল ক্যাপচার: বিল্ড এরর, মিসিং ডিপেনডেন্সি ও সিনট্যাক্স সমস্যা স্বয়ংক্রিয়ভাবে চিহ্নিত করে।',
    p3_point2: 'মূল কারণ বিশ্লেষণ: সুস্পষ্ট ভাষায় লাইনের পার্থক্যের সাথে ভুলের সঠিক কারণ তুলে ধরে।',
    p3_point3: '১-ক্লিক অটো প্যাচ: ফাইল কোডে স্বয়ংক্রিয় প্যাচ বসায় এবং সেফটি রোলব্যাক সুবিধা দেয়।',
    btn_fixer_demo: 'এরর ফিক্সার ডেমো দেখুন →',
    btn_get_executable: 'এক্সিকিউটেবল ডাউনলোড করুন',
    badge_scanner: 'লোকাল ড্রাইভ ইনডেক্সার • জিরো ক্লাউড আপলোড',
    p4_title: 'স্বয়ংক্রিয় ড্রাইভ অটোস্ক্যান',
    p4_sub: 'C:, D:, এবং E: ড্রাইভের প্রজেক্ট স্বয়ংক্রিয়ভাবে শনাক্তকরণ',
    p4_desc: 'ম্যানুয়ালি ফোল্ডার না খুঁজে সব প্রজেক্ট একসাথে দেখুন। লোকাল ড্রাইভ স্ক্যানার কয়েক মিলি-সেকেন্ডে আপনার স্টোরেজ ড্রাইভ স্ক্যান করে গিট রিপো ও ফ্রেমওয়ার্ক কনফিগ খুঁজে বের করে।',
    p4_point1: '১-ক্লিক ড্রাইভ সুইপ: কোনো ডেটা ক্লাউডে না পাঠিয়ে C:, D:, E: ড্রাইভ নিরাপদে স্ক্যান করুন।',
    p4_point2: 'ফ্রেমওয়ার্ক শনাক্তকরণ: Vite, Next.js, React, Electron, Python ও Rust প্রজেক্ট শনাক্ত করে।',
    p4_point3: 'ইনস্ট্যান্ট স্যুইচার: ১০০ মিলিসেকেন্ডেরও কম সময়ে শত শত লোকাল রিপোজিটরিতে স্যুইচ করুন।',
    btn_scanner_demo: 'ড্রাইভ অটোস্ক্যান ডেমো দেখুন →',
    btn_architecture: 'আর্কিটেকচার বিস্তারিত',
    badge_bridge: 'নেটিভ ব্রিজ • VS Code, Figma ও Chrome',
    p5_title: 'পিসি অ্যাপস ও এনভায়রনমেন্ট ব্রিজ',
    p5_sub: 'ইনস্টল থাকা সকল ডেভেলপার অ্যাপ্লিকেশনের সমন্বিত হাব',
    p5_desc: 'আপনার ডেস্কটপ আইডিই, ব্রাউজার, ডিজাইন টুল ও টার্মিনালকে একটি একক কমান্ড সেন্টারের সাথে যুক্ত করুন। প্রজেক্ট কনটেক্সটসহ VS Code লঞ্চ করুন এবং Figma ডিজাইনের সাথে সিঙ্ক বজায় রাখুন।',
    p5_point1: 'অ্যাপস অটো-ডিটেকশন: পিসিতে ইনস্টল করা এডিটর, ব্রাউজার ও টার্মিনাল স্বয়ংক্রিয়ভাবে ডিটেক্ট করে।',
    p5_point2: 'ডিপ প্রজেক্ট লঞ্চ: এক ক্লিকে সরাসরি VS Code, Cursor বা WebStorm-এ প্রজেক্ট ওপেন করুন।',
    p5_point3: 'সমন্বিত ওয়ার্কফ্লো: Figma ডিজাইন থেকে কোড জেনারেশন ও ব্রাউজার প্রিভিউতে সরাসরি মুভ করুন।',
    btn_bridge_features: 'পিসি অ্যাপস ফিচার দেখুন →',
    dl_tag: 'অফিসিয়াল রিলিজ',
    dl_title: 'উইন্ডোজের জন্য এআই ডেভ ওয়ার্কস্পেস ডাউনলোড করুন',
    dl_subtitle: 'ফুল উইন্ডোজ ইনস্টলার উইজার্ড অথবা জিরো-ইনস্টল পোর্টেবল এক্সিকিউটেবল থেকে বেছে নিন। উভয় ফাইলই ক্রিপ্টোগ্রাফিকভাবে সাইন করা ও SHA-256 ভেরিফাইড।',
    dl_installer_title: 'উইন্ডোজ সেটআপ (.exe)',
    dl_installer_type: 'স্ট্যান্ডার্ড ডেস্কটপ ইনস্টলার উইজার্ড • ৬৪-বিট',
    dl_installer_desc: 'অটোমেটিক ডেস্কটপ শর্টকাট, স্টার্ট মেনু ইন্টিগ্রেশন এবং টার্মিনাল অ্যাক্সেসসহ এআই ডেভ ওয়ার্কস্পেস ইনস্টল করে।',
    dl_file_info: 'ফাইল: AI Dev Workspace Setup 1.0.0.exe (৮৮.৭ MB)',
    dl_btn: 'ডাউনলোড উইন্ডোজ সেটআপ (৮৮.৭ MB)',
    dl_portable_title: 'উইন্ডোজ পোর্টেবল (.exe)',
    dl_portable_type: 'স্ট্যান্ডঅ্যালোন সিঙ্গেল এক্সিকিউটেবল • ৬৪-বিট',
    dl_portable_desc: 'কোনো ইনস্টলেশন ছাড়াই যেকোনো পেনড্রাইভ বা লোকাল ফোল্ডার থেকে সরাসরি চালান। কোনো অ্যাডমিন সুবিধার প্রয়োজন নেই।',
    dl_portable_btn: 'ডাউনলোড পোর্টেবল (.exe — ৮৮.৪ MB)',
    box_title: 'বক্সের ভেতর কী কী আছে: এআই ডেভ ওয়ার্কস্পেসের সাথে যা যা পাচ্ছেন',
    box_sub: 'কোনো বাহ্যিক ব্লটওয়্যার নেই। ১০০% লোকাল উইন্ডোজ মেশিনে সার্বভৌম অফলাইন এক্সিকিউশন।',
    box_feat1_title: '৭টি স্বয়ংক্রিয় ৩ডি এজেন্ট অবতার',
    box_feat1_desc: 'ডিডক্স মাস্টার এআই, ফ্রন্টএন্ড আর্কিটেক্ট, ব্যাকএন্ড ইঞ্জিনিয়ার, সাইবার সিকিউরিটি অডিটর, ডেভঅপস ইঞ্জিনিয়ার, কিউএ টেস্টার ও বাগ হান্টার প্রো অ্যানিমেটেড অবতারসহ।',
    box_feat2_title: 'পালস সার্ভার অর্কেস্ট্রেটর',
    box_feat2_desc: 'Vite (:5173), Next.js (:3000), FastAPI (:8080)-এর জন্য স্বয়ংক্রিয় ব্যাকগ্রাউন্ড প্রসেস ম্যানেজার এবং পোর্ট কনফ্লিক্ট সমাধান।',
    box_feat3_title: '১-ক্লিক এএসটি এরর ফিক্সার',
    box_feat3_desc: 'রিয়েল-টাইম স্ট্যাক ট্রেস অ্যানালাইজার যা রানটাইম ক্র্যাশ ও মিসিং প্যাকেজ ডায়াগনসিস করে তাৎক্ষণিক সেলফ-হিলিং প্যাচ দেয়।',
    box_feat4_title: 'ড্রাইভ অটোস্ক্যান ইঞ্জিন',
    box_feat4_desc: 'C:, D:, এবং E: ড্রাইভে হাই-স্পিড লোকাল রিপোজিটরি ডিসকভারি। চোখের পলকে গিট রিপো ও কনফিগারেশন শনাক্ত করে।',
    box_feat5_title: 'পিসি অ্যাপস ও আইডিই ব্রিজ',
    box_feat5_desc: 'VS Code, Cursor, Chrome, Discord, এবং Figma-এর সাথে প্রি-কনফিগারেশন ছাড়াই সরাসরি সিঙ্ক ও লঞ্চিং।',
    box_feat6_title: 'এয়ার-গ্যাপড সার্বভৌম প্রাইভেসী',
    box_feat6_desc: 'আপনার কোড কখনোই কম্পিউটার ছেড়ে বাইরে যায় না। লোকাল এলএলএম (Ollama) ও সম্পূর্ণ অফলাইন স্যান্ডবক্সিংয়ে চলে।'
  }
};

function initLanguageToggle() {
  const langContainer = document.getElementById('langDropdownContainer');
  const langBtn = document.getElementById('langToggleBtn');
  const langLabel = document.getElementById('langToggleLabel');
  const langMenu = document.getElementById('langDropdownMenu');
  const optionBtns = document.querySelectorAll('.lang-option-btn');

  // English is DEFAULT
  const savedLang = localStorage.getItem('devworkspace_site_lang') || 'en';
  applyLanguage(savedLang);

  if (langBtn && langMenu) {
    langBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isVisible = langMenu.style.display === 'block';
      langMenu.style.display = isVisible ? 'none' : 'block';
      langBtn.setAttribute('aria-expanded', isVisible ? 'false' : 'true');
    });

    document.addEventListener('click', (e) => {
      if (langContainer && !langContainer.contains(e.target)) {
        langMenu.style.display = 'none';
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  optionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const targetLang = btn.getAttribute('data-lang');
      applyLanguage(targetLang);
      if (langMenu) {
        langMenu.style.display = 'none';
        if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
      }
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--q-surface-subtle, rgba(0,0,0,0.06))';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
    });
  });

  function applyLanguage(lang) {
    localStorage.setItem('devworkspace_site_lang', lang);
    if (langLabel) {
      langLabel.textContent = (lang === 'en' ? 'English' : 'বাংলা');
    }

    optionBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.style.fontWeight = '700';
        btn.style.color = '#255A41';
      } else {
        btn.style.fontWeight = '500';
        btn.style.color = 'var(--q-text, #111827)';
      }
    });

    const dict = I18N_DICT[lang] || I18N_DICT.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[key]) {
        if (dict[key].includes('<') || el.children.length === 0) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });
  }
  window.applySiteLanguage = applyLanguage;
}

/**
 * 8. Synchronize theme directly to the embedded demo iframe
 */
function syncThemeToIframe(targetTheme) {
  const iframe = document.getElementById('liveProductIframe');
  if (!iframe) return;

  const wantsLight = (targetTheme === 'soft-light' || targetTheme === 'light');

  // 1. Post message to iframe window
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'SET_THEME', theme: targetTheme }, '*');
  }

  // 2. Direct DOM manipulation if ready (same-origin)
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (doc) {
      const root = doc.documentElement;
      if (wantsLight) {
        root.classList.remove('dark', 'theme-nova-dark');
        root.classList.add('light', 'theme-soft-light');
        if (doc.body) {
          doc.body.className = 'theme-soft-light bg-white text-zinc-900 overflow-hidden select-none font-sans antialiased';
        }
      } else {
        root.classList.remove('light', 'theme-soft-light');
        root.classList.add('dark', 'theme-nova-dark');
        if (doc.body) {
          doc.body.className = 'theme-nova-dark bg-[#080809] text-[#EDEDED] overflow-hidden select-none font-sans antialiased';
        }
      }

      // Trigger internal React toggle button if its state differs
      const lightBtn = doc.querySelector('button[title*="Light"]');
      const darkBtn = doc.querySelector('button[title*="Dark"]');
      if (wantsLight && lightBtn) {
        lightBtn.click();
      } else if (!wantsLight && darkBtn) {
        darkBtn.click();
      }
    }
  } catch (_) {}
}

/**
 * 9. Live Demo Controller (Controls the authentic React App inside the iframe)
 */
function initLiveDemoController() {
  const tabButtons = document.querySelectorAll('.demo-tab-btn');
  const iframe = document.getElementById('liveProductIframe');
  if (!iframe) return;

  // On iframe load: sync current website theme and activate Multi-Agent Roundtable
  iframe.addEventListener('load', () => {
    const currentSiteTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const targetAppTheme = currentSiteTheme === 'dark' ? 'nova-dark' : 'soft-light';

    syncThemeToIframe(targetAppTheme);

    setTimeout(() => {
      syncThemeToIframe(targetAppTheme);
      switchIframeView('ai-agent');
    }, 600);
  });

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-target');
      
      tabButtons.forEach(b => {
        b.classList.remove('active');
      });

      btn.classList.add('active');
      switchIframeView(target);
    });
  });

  function switchIframeView(target) {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'SET_VIEW', view: target }, '*');
    }
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      if (target === 'ai-agent') {
        const agentBtn = doc.querySelector('[data-view="ai-agent"]') || 
          Array.from(doc.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Agent') || b.textContent.includes('Copilot')));
        if (agentBtn) agentBtn.click();
      } else if (target === 'launcher') {
        const launcherBtn = doc.querySelector('[data-view="launcher"]') || 
          Array.from(doc.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Launcher') || b.textContent.includes('Pulse')));
        if (launcherBtn) launcherBtn.click();
      } else if (target === 'pc-apps') {
        const pcBtn = doc.querySelector('[data-view="pc-apps"]') || 
          Array.from(doc.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('PC Apps'));
        if (pcBtn) pcBtn.click();
      }
    } catch (_) {}
  }
}


/**
 * 10. Dynamic Content Synchronization from site_content.json / API
 * Allows real-time live site updates configured via admin.html
 */
function initDynamicContentSync() {
  fetch('/api/site-content')
    .catch(() => fetch('assets/config/site_content.json'))
    .then(res => res.json())
    .then(config => {
      if (!config) return;
      applyDynamicContent(config);
    })
    .catch(err => {
      console.log('Dynamic content sync notice:', err);
    });
}

function applyDynamicContent(config) {
  if (!config) return;

  // 1. Branding sync
  if (config.branding) {
    if (config.branding.logo_url) {
      document.querySelectorAll('img[src*="deedox-logo"], img[data-img-id="site_logo"]').forEach(img => {
        img.src = config.branding.logo_url;
      });
    }
  }

  // 2. Contact Sync (email, phone, URLs)
  if (config.contact) {
    if (config.contact.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
        el.href = `mailto:${config.contact.email}`;
        if (el.textContent && el.textContent.includes('@')) {
          el.textContent = config.contact.email;
        }
      });
    }
    if (config.contact.phone) {
      document.querySelectorAll('[data-sync="contact-phone"]').forEach(el => {
        el.textContent = config.contact.phone;
        if (el.tagName === 'A') el.href = `tel:${config.contact.phone}`;
      });
    }
    if (config.contact.website_url) {
      document.querySelectorAll('[data-sync="website-url"]').forEach(el => {
        if (el.tagName === 'A') el.href = config.contact.website_url;
        el.textContent = config.contact.website_url.replace(/^https?:\/\//, '');
      });
    }
  }

  // 3. Hero sync (index.html)
  if (config.hero) {
    const heroTitle = document.querySelector('.HeroSection_heroHeader__05VmK h1') || document.querySelector('[data-sync="hero-title"]');
    if (heroTitle && config.hero.title) heroTitle.textContent = config.hero.title;
    
    const heroDesc = document.querySelector('.HeroSection_heroHeader__05VmK p') || document.querySelector('[data-sync="hero-desc"]');
    if (heroDesc && config.hero.description) heroDesc.textContent = config.hero.description;

    const heroPrimaryBtn = document.querySelector('[data-sync="hero-btn-primary"]');
    if (heroPrimaryBtn && config.hero.primary_btn_url) heroPrimaryBtn.href = config.hero.primary_btn_url;
  }

  // 4. Build Your Way Modules sync
  if (config.build_your_way && Array.isArray(config.build_your_way.modules)) {
    config.build_your_way.modules.forEach(mod => {
      const panel = document.getElementById(mod.id);
      if (!panel) return;

      const img = panel.querySelector('.feature-img-wrap img, .ProductPreviewSlot_previewSlot__SlTaq img');
      if (img && mod.image_url) {
        img.src = mod.image_url;
      }

      const title = panel.querySelector('.ProductCard_name__vtIxq');
      if (title && mod.title) title.textContent = mod.title;

      const subtitle = panel.querySelector('.ProductCard_subtitle__NzJZo');
      if (subtitle && mod.subtitle) subtitle.textContent = mod.subtitle;

      const desc = panel.querySelector('.ProductCard_description__L9doS');
      if (desc && mod.description) desc.textContent = mod.description;

      const badge = panel.querySelector('[data-i18n^="badge_"]');
      if (badge && mod.badge) badge.textContent = mod.badge;

      const points = panel.querySelectorAll('ul li');
      if (points && Array.isArray(mod.points)) {
        points.forEach((pt, idx) => {
          if (mod.points[idx]) {
            const colonIdx = mod.points[idx].indexOf(':');
            if (colonIdx > -1) {
              pt.innerHTML = `<strong>${mod.points[idx].substring(0, colonIdx + 1)}</strong>${mod.points[idx].substring(colonIdx + 1)}`;
            } else {
              pt.textContent = mod.points[idx];
            }
          }
        });
      }
    });
  }

  // 5. Registered Images sync
  if (Array.isArray(config.images)) {
    config.images.forEach(imgObj => {
      if (!imgObj || !imgObj.path) return;
      const targetImgs = document.querySelectorAll(`img[data-img-id="${imgObj.id}"]`);
      targetImgs.forEach(img => {
        img.src = imgObj.path;
      });
    });
  } else if (config.images && typeof config.images === 'object') {
    for (const [imgId, imgObj] of Object.entries(config.images)) {
      if (!imgObj || !imgObj.path) continue;
      const targetImgs = document.querySelectorAll(`img[data-img-id="${imgId}"]`);
      targetImgs.forEach(img => {
        img.src = imgObj.path;
      });
    }
  }

  // 6. Downloads sync
  if (config.downloads) {
    if (config.downloads.installer) {
      document.querySelectorAll('[data-sync="installer-version"]').forEach(el => el.textContent = config.downloads.installer.version);
      document.querySelectorAll('[data-sync="installer-size"]').forEach(el => el.textContent = config.downloads.installer.size);
      document.querySelectorAll('[data-sync="installer-sha256"]').forEach(el => el.textContent = config.downloads.installer.sha256);
      if (config.downloads.installer.filename) {
        document.querySelectorAll('a[download*="Setup"]').forEach(a => {
          a.setAttribute('download', config.downloads.installer.filename);
          a.href = `downloads/${encodeURIComponent(config.downloads.installer.filename)}`;
        });
      }
    }
    if (config.downloads.portable) {
      document.querySelectorAll('[data-sync="portable-version"]').forEach(el => el.textContent = config.downloads.portable.version);
      document.querySelectorAll('[data-sync="portable-size"]').forEach(el => el.textContent = config.downloads.portable.size);
      document.querySelectorAll('[data-sync="portable-sha256"]').forEach(el => el.textContent = config.downloads.portable.sha256);
      if (config.downloads.portable.filename) {
        document.querySelectorAll('a[download*="Portable"]').forEach(a => {
          a.setAttribute('download', config.downloads.portable.filename);
          a.href = `downloads/${encodeURIComponent(config.downloads.portable.filename)}`;
        });
      }
    }
  }

  // 7. Mobile Demo Preview & Testimonials Sync
  if (config.mobile_preview) {
    if (typeof config.mobile_preview.animation_enabled === 'boolean') {
      window.mobileAnimationEnabled = config.mobile_preview.animation_enabled;
    }
    if (config.mobile_preview.interval_ms) {
      window.mobileAnimationInterval = config.mobile_preview.interval_ms;
    }
    if (Array.isArray(config.mobile_preview.slides) && config.mobile_preview.slides.length) {
      window.mobileSlides = config.mobile_preview.slides;
    }
    if (window.renderMobileSlide) window.renderMobileSlide(0);
  }
}


/**
 * 11. Mobile Software Preview Carousel / Auto-Slideshow
 * Responsive mobile mockup that dynamically displays Light vs Dark screenshots
 * and auto-cycles with crossfade (configurable via admin).
 */
function initMobilePreviewSlider() {
  const container = document.querySelector('.demo-mobile-showcase');
  if (!container) return;

  const imgEl = document.getElementById('mobilePreviewImg');
  const badgeEl = document.getElementById('mobileModuleBadge');
  const countEl = document.getElementById('mobileSlideCount');
  const themeBadge = document.getElementById('mobileThemeBadge');
  const dotBtns = document.querySelectorAll('.mobile-slider-dot');

  let currentSlideIndex = 0;
  let sliderTimer = null;

  const defaultSlides = [
    {
      id: "pulse",
      badge: "⚡ Pulse Dev Watchdog (:5173)",
      light_image: "assets/images/software/software_launcher_light.png",
      dark_image: "assets/images/software/software_launcher_light.png"
    },
    {
      id: "roundtable",
      badge: "🤖 Multi-Agent 3D Studio",
      light_image: "assets/images/software/software_multiagent_light.png",
      dark_image: "assets/images/software/software_multiagent_dark.png"
    },
    {
      id: "fixer",
      badge: "🛠️ 1-Click AST Auto-Fixer",
      light_image: "assets/images/software/software_error_diagnostic.png",
      dark_image: "assets/images/software/software_error_diagnostic.png"
    },
    {
      id: "scanner",
      badge: "📂 Drive AutoScan Indexer",
      light_image: "assets/images/software/software_autoscan_captured.png",
      dark_image: "assets/images/software/software_autoscan_drives.png"
    }
  ];

  window.mobileSlides = defaultSlides;
  window.mobileAnimationEnabled = true;
  window.mobileAnimationInterval = 3500;

  function updateSlide(index) {
    if (!imgEl) return;
    if (typeof index === 'number') { currentSlideIndex = (index + window.mobileSlides.length) % window.mobileSlides.length; }
    const slide = window.mobileSlides[currentSlideIndex];
    if (!slide) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';

    const targetSrc = isDark ? (slide.dark_image || slide.light_image) : (slide.light_image || slide.dark_image);

    // Smooth crossfade
    imgEl.style.opacity = '0.35';
    setTimeout(() => {
      imgEl.src = targetSrc;
      imgEl.alt = slide.badge;
      imgEl.style.opacity = '1';
    }, 180);

    if (badgeEl) badgeEl.textContent = slide.badge;
    if (countEl) countEl.textContent = `${currentSlideIndex + 1}/${window.mobileSlides.length}`;
    if (themeBadge) {
      themeBadge.textContent = isDark ? 'Night Mode' : 'Day Mode';
      themeBadge.style.background = isDark ? 'rgba(56,189,248,0.15)' : 'rgba(37,90,65,0.12)';
      themeBadge.style.color = isDark ? '#38BDF8' : '#255A41';
    }

    // Update dots
    dotBtns.forEach((btn, i) => {
      if (i === currentSlideIndex) {
        btn.classList.add('active');
        btn.style.background = '#255A41';
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(128,128,128,0.3)';
      }
    });
  }

  window.renderMobileSlide = updateSlide;

  // Dot click listeners
  dotBtns.forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      updateSlide(i);
      resetTimer();
    });
  });

  function startTimer() {
    if (sliderTimer) clearInterval(sliderTimer);
    if (!window.mobileAnimationEnabled) return;
    sliderTimer = setInterval(() => {
      updateSlide(currentSlideIndex + 1);
    }, window.mobileAnimationInterval || 3500);
  }

  function resetTimer() {
    if (sliderTimer) clearInterval(sliderTimer);
    startTimer();
  }

  // Initial update and start
  updateSlide(0);
  startTimer();

  // Watch for theme changes to automatically update mobile screenshot mode
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        updateSlide(currentSlideIndex);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

// High-performance scroll lock for iframes: prevents mouse-wheel trapping & lag
(function() {
  let isScrollingTimer;
  window.addEventListener('scroll', function() {
    document.body.classList.add('is-scrolling');
    clearTimeout(isScrollingTimer);
    isScrollingTimer = setTimeout(function() {
      document.body.classList.remove('is-scrolling');
    }, 120);
  }, { passive: true });
})();

/**
 * Mobile Navigation Drawer & Hamburger Menu
 */
function initMobileNavigation() {
  const headerRight = document.querySelector('.FullHeader_headerRight__Gc9Qc');
  if (!headerRight) return;

  // 1. Inject Hamburger button if not present
  let menuBtn = document.getElementById('mobileNavToggleBtn');
  if (!menuBtn) {
    menuBtn = document.createElement('button');
    menuBtn.id = 'mobileNavToggleBtn';
    menuBtn.className = 'mobile-nav-toggle-btn';
    menuBtn.setAttribute('aria-label', 'Open Navigation Menu');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML = `
      <span class="hamburger-box">
        <span class="hamburger-inner"></span>
      </span>
    `;
    headerRight.appendChild(menuBtn);
  }

  // 2. Inject Mobile Drawer if not present
  let drawer = document.getElementById('mobileNavDrawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'mobileNavDrawer';
    drawer.className = 'mobile-nav-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="mobile-nav-backdrop" id="mobileNavBackdrop"></div>
      <div class="mobile-nav-panel">
        <div class="mobile-nav-header">
          <a href="index.html" class="mobile-nav-brand">
            <img src="assets/images/deedox-logo.png" alt="DEEDOX" />
            <div class="mobile-nav-brand-text">
              <span class="brand-title">DEEDOX</span>
              <span class="brand-tagline">AI Dev Workspace</span>
            </div>
          </a>
          <button id="mobileNavCloseBtn" class="mobile-nav-close-btn" aria-label="Close Navigation Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="mobile-nav-body">
          <a href="downloads/AI%20Dev%20Workspace%20Setup%201.0.0.exe" download="AI Dev Workspace Setup 1.0.0.exe" class="mobile-nav-download-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span data-i18n="btn_download">Download Windows (.exe)</span>
          </a>

          <nav class="mobile-nav-links">
            <div class="mobile-nav-section-title">Navigation</div>
            <a href="index.html" class="mobile-nav-item">
              <span class="mobile-nav-icon">🏠</span>
              <span data-i18n="menu_home">Home Hub</span>
            </a>
            <a href="demo.html" class="mobile-nav-item">
              <span class="mobile-nav-icon">💻</span>
              <span data-i18n="menu_sandbox">Interactive Demo Sandbox</span>
              <span class="mobile-nav-badge">LIVE</span>
            </a>
            <a href="download.html" class="mobile-nav-item">
              <span class="mobile-nav-icon">📥</span>
              <span data-i18n="menu_download">Official Windows Downloads</span>
            </a>
            <a href="features.html" class="mobile-nav-item">
              <span class="mobile-nav-icon">⚙️</span>
              <span data-i18n="menu_features">Features &amp; Architecture</span>
            </a>
            <a href="about.html" class="mobile-nav-item">
              <span class="mobile-nav-icon">👥</span>
              <span data-i18n="menu_about">About DEEDOX &amp; Founder</span>
            </a>

            <div class="mobile-nav-section-title">Core Capabilities</div>
            <a href="index.html#launcher" class="mobile-nav-item">
              <span class="mobile-nav-icon">⚡</span>
              <span data-i18n="nav_launcher">Pulse Dev Watchdog (:5173)</span>
            </a>
            <a href="index.html#roundtable" class="mobile-nav-item">
              <span class="mobile-nav-icon">🤖</span>
              <span data-i18n="nav_roundtable">Multi-Agent Roundtable</span>
            </a>
            <a href="index.html#error-fixer" class="mobile-nav-item">
              <span class="mobile-nav-icon">🛠️</span>
              <span data-i18n="nav_fixer">1-Click AST Error Fixer</span>
            </a>
            <a href="index.html#drive-scanner" class="mobile-nav-item">
              <span class="mobile-nav-icon">🔍</span>
              <span data-i18n="nav_scanner">Multi-Drive AutoScan</span>
            </a>
          </nav>

          <div class="mobile-nav-footer-controls">
            <div class="mobile-ctrl-row">
              <span class="mobile-ctrl-label">Language:</span>
              <div class="mobile-lang-group">
                <button type="button" class="mobile-lang-chip" data-mobile-lang="en">🇬🇧 English</button>
                <button type="button" class="mobile-lang-chip" data-mobile-lang="bn">🇧🇩 বাংলা</button>
              </div>
            </div>
            <div class="mobile-ctrl-row">
              <span class="mobile-ctrl-label">Theme Mode:</span>
              <button type="button" id="mobileDrawerThemeToggle" class="mobile-drawer-theme-btn">
                <span id="mobileDrawerThemeIcon">☀️</span>
                <span id="mobileDrawerThemeText">Day Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
  }

  // Event handlers
  function openMobileMenu() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    menuBtn.classList.add('active');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    updateDrawerUI();
  }

  function closeMobileMenu() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (drawer.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  const closeBtn = document.getElementById('mobileNavCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);

  const backdrop = document.getElementById('mobileNavBackdrop');
  if (backdrop) backdrop.addEventListener('click', closeMobileMenu);

  // Close when clicking any nav item link
  drawer.querySelectorAll('.mobile-nav-item, .mobile-nav-download-btn').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // ESC key closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Mobile language chips
  drawer.querySelectorAll('.mobile-lang-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const targetLang = chip.getAttribute('data-mobile-lang');
      if (window.applySiteLanguage) {
        window.applySiteLanguage(targetLang);
      }
      updateDrawerUI();
    });
  });

  // Mobile drawer theme button
  const drawerThemeBtn = document.getElementById('mobileDrawerThemeToggle');
  if (drawerThemeBtn) {
    drawerThemeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      if (window.applySiteTheme) {
        window.applySiteTheme(next);
      }
      updateDrawerUI();
    });
  }

  function updateDrawerUI() {
    const curTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const curLang = localStorage.getItem('devworkspace_site_lang') || 'en';
    const isDark = (curTheme === 'dark');

    const themeIcon = document.getElementById('mobileDrawerThemeIcon');
    const themeText = document.getElementById('mobileDrawerThemeText');
    if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
    if (themeText) themeText.textContent = isDark ? 'Night Mode' : 'Day Mode';

    drawer.querySelectorAll('.mobile-lang-chip').forEach(chip => {
      const lang = chip.getAttribute('data-mobile-lang');
      chip.classList.toggle('active', lang === curLang);
    });
  }
}

