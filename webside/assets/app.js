/**
 * AI Dev Workspace — 100% Exact Software Replication Engine
 * Replicates the authentic desktop application with pixel-perfect fidelity:
 * - Mobile Squircle App Drawer Grid (rounded-[22px], gradient gloss, tech framework SVGs)
 * - Running Timer Pills (02:14 :5173 ↗) & Emerald Glow Status Rings
 * - Hover Action Circles Overlay (Play/Stop, Preview, Pin, Terminal, Folder, VS Code, Trash)
 * - Real Floating Bottom Dock (FloatingNavBar with 8 tool icons)
 * - Authentic Left Sidebar (Workspace Switcher, Categories, Running Servers, System Controls)
 * - Status Bar & Scope Switcher (All Items, Repositories, Web Mini-Apps, PC Apps)
 * - Complete AI Studio with All AI Modes:
 *   1. Single Specialist Copilot (7 Personas, 3D animated miniature avatar, code replies)
 *   2. Autonomous Multi-Agent Roundtable (Seated Council, sequential debate & active speaker halo)
 *   3. OpenRouter AI Error Diagnostic Solver (1-click EADDRINUSE fix command)
 *   4. OpenRouter Model Switcher & Preferences Modal
 * - Integrated xterm.js Terminal Drawer with ANSI colors & stdout/stderr stream
 * - In-App Webview Browser Tab simulation
 * - Recursive Local Drive Scanner Modal
 * - Nova Dark & Soft Light Themes
 */

(function () {
  'use strict';

  // ---------------- Exact Software State ----------------
  const state = {
    theme: 'dark', // 'dark' | 'light'
    activeView: 'launcher', // 'launcher' | 'agents' | 'miniapps' | 'pcapps' | 'inapp' | 'trending' | 'news'
    activeScope: 'all', // 'all' | 'repos' | 'miniapps' | 'pcapps'
    activeCategory: 'all',
    searchQuery: '',
    runningCount: 1,
    selectedProjectForTerminal: 'sample-vite',
    terminalCollapsed: true,

    // AI Studio State
    aiMode: 'copilot', // 'copilot' | 'roundtable' | 'diagnostic'
    activeAgentId: 'agent-master-ai',
    roundtableRunning: false,
    roundtableTimer: null,
    selectedCouncilIds: ['agent-master-ai', 'agent-backend-dev', 'agent-frontend-dev', 'agent-cyber-security', 'agent-devops'],

    // Projects (Matching main software defaults)
    projects: [
      {
        id: 'sample-vite',
        name: 'NeuroFlow Studio',
        framework: 'vite',
        techLabel: 'Vite + React',
        iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#BD34FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
        path: 'C:\\Workspace\\neuroflow-studio',
        category: 'websites',
        port: 5173,
        status: 'running',
        elapsed: 142,
        command: 'npm run dev',
        isPinned: true,
        tag: 'Production',
        logs: [
          { type: 'info', text: '➜  Local:   http://localhost:5173/' },
          { type: 'info', text: '➜  Network: use --host to expose' },
          { type: 'success', text: '✔ [vite] 14 modules transformed in 42ms' },
          { type: 'info', text: '[HMR] Connected to Vite WebSocket server' }
        ]
      },
      {
        id: 'sample-fastapi',
        name: 'FastAPI Agent Core',
        framework: 'fastapi',
        techLabel: 'Python / FastAPI',
        iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#009688" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`,
        path: 'C:\\Workspace\\fastapi-agent-core',
        category: 'apis',
        port: 8000,
        status: 'stopped',
        elapsed: 0,
        command: 'python -m uvicorn main:app --reload',
        isPinned: false,
        tag: 'API',
        logs: [
          { type: 'info', text: 'Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)' },
          { type: 'info', text: 'Application startup complete.' }
        ]
      },
      {
        id: 'sample-react-app',
        name: 'Spatial Aptitude UI',
        framework: 'react',
        techLabel: 'React 18',
        iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00D8FF" stroke-width="1.8"><ellipse cx="12" cy="12" rx="10" ry="4"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"></ellipse><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"></ellipse><circle cx="12" cy="12" r="1.5" fill="#00D8FF"></circle></svg>`,
        path: 'C:\\Workspace\\spatial-aptitude',
        category: 'websites',
        port: 3000,
        status: 'stopped',
        elapsed: 0,
        command: 'npm run dev',
        isPinned: true,
        tag: 'Frontend',
        logs: [
          { type: 'info', text: 'Ready on http://localhost:3000' }
        ]
      },
      {
        id: 'sample-autogpt',
        name: 'AutoGPT Worker',
        framework: 'python',
        techLabel: 'Python AI Agent',
        iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3776AB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v12a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z"></path><circle cx="9" cy="6" r="1" fill="#FFF"></circle><circle cx="15" cy="18" r="1" fill="#FFF"></circle></svg>`,
        path: 'C:\\Workspace\\autogpt-worker',
        category: 'ai-agents',
        port: 8080,
        status: 'stopped',
        elapsed: 0,
        command: 'python agent.py',
        isPinned: false,
        tag: 'AI',
        logs: [
          { type: 'info', text: 'AutoGPT Worker listening on port 8080' }
        ]
      },
      {
        id: 'sample-rust-core',
        name: 'Rust Tensor Engine',
        framework: 'rust',
        techLabel: 'Rust / Cargo',
        iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#DEA584" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>`,
        path: 'C:\\Workspace\\rust-engine',
        category: 'tools',
        port: 7070,
        status: 'stopped',
        elapsed: 0,
        command: 'cargo run --release',
        isPinned: false,
        tag: 'Engine',
        logs: [
          { type: 'info', text: 'Finished release [optimized] target(s) in 1.48s' },
          { type: 'info', text: 'Listening on http://127.0.0.1:7070' }
        ]
      },
      {
        id: 'sample-error-svc',
        name: 'Broken Microservice',
        framework: 'node',
        techLabel: 'Node Express',
        iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        path: 'C:\\Workspace\\auth-service',
        category: 'apis',
        port: 3000,
        status: 'error',
        elapsed: 0,
        command: 'npm start',
        isPinned: false,
        tag: 'Crash',
        logs: [
          { type: 'cmd', text: '$ npm start' },
          { type: 'error', text: 'Error: listen EADDRINUSE: address already in use :::3000' },
          { type: 'warning', text: '⚡ DevWorkspace AI Diagnostic: Port 3000 occupied by zombie process PID 19842' }
        ]
      }
    ],

    // Web Mini-Apps (Exact match from main software)
    miniApps: [
      { id: 'miniapp-chatgpt', name: 'ChatGPT Plus', category: 'ai-agents', url: 'https://chatgpt.com', icon: '🤖', badge: 'GPT-4o', session: 'Saved' },
      { id: 'miniapp-claude', name: 'Claude 3.7', category: 'ai-agents', url: 'https://claude.ai', icon: '🧠', badge: 'Artifacts', session: 'Saved' },
      { id: 'miniapp-github', name: 'GitHub Web', category: 'tools', url: 'https://github.com', icon: '🐙', badge: 'Repos', session: 'Saved' },
      { id: 'miniapp-notion', name: 'Notion', category: 'tools', url: 'https://notion.so', icon: '📝', badge: 'Docs', session: 'Saved' },
      { id: 'miniapp-figma', name: 'Figma', category: 'websites', url: 'https://figma.com', icon: '🎨', badge: 'Design', session: 'Saved' },
      { id: 'miniapp-reddit', name: 'Reddit', category: 'websites', url: 'https://reddit.com', icon: '💬', badge: 'Social', session: 'Saved' }
    ],

    // Installed PC Apps
    pcApps: [
      { id: 'pc-1', name: 'Visual Studio Code', category: 'code', icon: '💻', desc: 'Code editing redefined' },
      { id: 'pc-2', name: 'Google Chrome', category: 'browser', icon: '🌐', desc: 'Fast, secure web browser' },
      { id: 'pc-3', name: 'Git Bash', category: 'code', icon: '⚡', desc: 'Git distributed version control' },
      { id: 'pc-4', name: 'Windows Terminal', category: 'utilities', icon: '⌨', desc: 'Modern tabbed terminal' },
      { id: 'pc-5', name: 'Docker Desktop', category: 'tools', icon: '🐳', desc: 'Container development environment' },
      { id: 'pc-6', name: 'Postman', category: 'code', icon: '🚀', desc: 'API development and testing' }
    ],

    // AI Specialists (Exact definitions from agentPresets.ts)
    agents: [
      {
        id: 'agent-master-ai',
        name: 'DEEDOX Master AI',
        role: 'Core Orchestrator & Master Intelligence',
        avatar: '🌐',
        color: '#5E6AD2',
        desc: 'The central DEEDOX intelligence orchestrating multi-agent collaboration, workspace automation, and architecture planning.',
        model: 'openrouter/free',
        permissions: ['Master Access', 'Read Projects', 'Read Terminal Logs', 'Execute Shell']
      },
      {
        id: 'agent-frontend-dev',
        name: 'Frontend UI Architect',
        role: 'React, Tailwind & Design System Specialist',
        avatar: '🎨',
        color: '#E11D48',
        desc: 'Specializes in responsive layouts, CSS micro-animations, glassmorphic interfaces, and modern React 18 UX.',
        model: 'openrouter/free',
        permissions: ['Read Component Tree', 'Write Tailwind CSS', 'Inspect DOM']
      },
      {
        id: 'agent-backend-dev',
        name: 'Backend & API Engineer',
        role: 'APIs, Databases, WebSockets & Server Logic',
        avatar: '⚙️',
        color: '#EA580C',
        desc: 'Specializes in FastAPI, Node/Express, WebSocket synchronization, database schemas, and robust server logic.',
        model: 'openrouter/free',
        permissions: ['Read Endpoints', 'Database Migration', 'Port Sniffing']
      },
      {
        id: 'agent-devops',
        name: 'DevOps & Cloud Engineer',
        role: 'Docker, CI/CD & Infrastructure Architect',
        avatar: '🐳',
        color: '#475569',
        desc: 'Specializes in multi-stage Dockerfiles, docker-compose, Nginx reverse proxies, and automated deployment pipelines.',
        model: 'openrouter/free',
        permissions: ['Docker Socket', 'Port Forwarding', 'Shell Execution']
      },
      {
        id: 'agent-cyber-security',
        name: 'Cyber Security Auditor',
        role: 'Threat Intel, Auth & Vulnerability Auditor',
        avatar: '🛡️',
        color: '#DC2626',
        desc: 'Scrutinizes code for SQL injection, XSS, token leakage, CORS flaws, and enforces strict sanitization protocols.',
        model: 'openrouter/free',
        permissions: ['Security Headers', 'Token Audit', 'Dependency Audit']
      },
      {
        id: 'agent-bug-hunter',
        name: 'Bug Hunter & Diagnostic Pro',
        role: 'Crash Diagnostics & Root-Cause Analyst',
        avatar: '🔬',
        color: '#7C3AED',
        desc: 'Inspects runtime logs, analyzes stack traces, and delivers surgical copy-pasteable bug fixes.',
        model: 'openrouter/free',
        permissions: ['Read Stack Traces', 'Memory Profiler', 'Execute Fix']
      },
      {
        id: 'agent-qa-tester',
        name: 'QA Automation Tester',
        role: 'Automated Tests, Edge Cases & Verification',
        avatar: '♾️',
        color: '#0284C7',
        desc: 'Generates Vitest/Jest unit tests, Playwright end-to-end suites, and stress tests edge cases.',
        model: 'openrouter/free',
        permissions: ['Run Test Runner', 'Coverage Report', 'Mock Data']
      }
    ]
  };

  // ---------------- DOM References ----------------
  const demoWindow = document.getElementById('demoWindow');
  const demoToast = document.getElementById('demoToast');
  const toastMessage = document.getElementById('toastMessage');
  const stageScrollArea = document.getElementById('stageScrollArea');
  const stageBreadcrumb = document.getElementById('stageBreadcrumb');
  const stageRunningCount = document.getElementById('stageRunningCount');
  const stageReposCount = document.getElementById('stageReposCount');

  // Terminal Drawer
  const demoTerminalDrawer = document.getElementById('demoTerminalDrawer');
  const terminalProjectName = document.getElementById('terminalProjectName');
  const terminalLogContent = document.getElementById('terminalLogContent');
  const toggleTerminalBtn = document.getElementById('toggleTerminalBtn');
  const clearTerminalBtn = document.getElementById('clearTerminalBtn');

  // Modals
  const demoDiagnosticModal = document.getElementById('demoDiagnosticModal');
  const closeDiagnosticBtn = document.getElementById('closeDiagnosticBtn');
  const runFixBtn = document.getElementById('runFixBtn');

  const scanModalOverlay = document.getElementById('scanModalOverlay');
  const openScanModalBtn = document.getElementById('openScanModalBtn');
  const closeScanModalBtn = document.getElementById('closeScanModalBtn');
  const runScanBtn = document.getElementById('runScanBtn');
  const importScannedBtn = document.getElementById('importScannedBtn');

  const settingsModalOverlay = document.getElementById('settingsModalOverlay');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const testApiKeyBtn = document.getElementById('testApiKeyBtn');

  // ---------------- Toast ----------------
  let toastTimer = null;
  function showToast(msg) {
    if (!toastMessage || !demoToast) return;
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    demoToast.classList.add('show');
    toastTimer = setTimeout(() => {
      if (demoToast) demoToast.classList.remove('show');
    }, 2800);
  }

  // ---------------- View Navigation ----------------
  function setView(viewName) {
    state.activeView = viewName;

    // Update TitleBar Tabs
    document.querySelectorAll('.titlebar-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === viewName);
    });

    // Update Sidebar items
    document.querySelectorAll('.sidebar-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-view') === viewName);
    });

    // Update Dock
    document.querySelectorAll('.dock-item-btn').forEach(d => {
      d.classList.toggle('active', d.getAttribute('data-dock') === viewName);
    });

    renderStage();
  }

  // ---------------- Stage Renderer ----------------
  function renderStage() {
    if (!stageScrollArea) return;
    updateStageStatusbar();

    if (state.activeView === 'launcher') {
      renderLauncherGrid();
    } else if (state.activeView === 'agents') {
      renderAIStudio();
    } else if (state.activeView === 'miniapps') {
      renderMiniAppsGrid();
    } else if (state.activeView === 'pcapps') {
      renderPcAppsGrid();
    } else if (state.activeView === 'inapp') {
      renderInAppBrowser();
    } else if (state.activeView === 'trending') {
      renderTrendingView();
    } else if (state.activeView === 'news') {
      renderNewsView();
    }
  }

  function updateStageStatusbar() {
    if (stageBreadcrumb) {
      stageBreadcrumb.textContent = state.activeCategory === 'all' ? 'All Projects' : state.activeCategory.toUpperCase();
    }
    if (stageRunningCount) {
      stageRunningCount.textContent = `${state.runningCount} running`;
    }
    if (stageReposCount) {
      stageReposCount.textContent = `${state.projects.length} repos · ${state.miniApps.length} apps`;
    }
    const titlebarRunEl = document.getElementById('runningServerCount');
    if (titlebarRunEl) {
      titlebarRunEl.textContent = `${state.runningCount} Running`;
    }
  }

  // ================= 1. THE AUTHENTIC SQUIRCLE APP LAUNCHER =================
  function renderLauncherGrid() {
    const q = state.searchQuery.toLowerCase().trim();
    const cat = state.activeCategory;
    const scope = state.activeScope;

    const filteredProjects = state.projects.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(q) || p.framework.toLowerCase().includes(q) || p.path.toLowerCase().includes(q);
      const matchCat = cat === 'all' || p.category === cat;
      return matchSearch && matchCat;
    });

    let html = `
      <!-- Scope Bar -->
      <div class="scope-bar">
        <div class="scope-tabs-group">
          <button class="scope-tab ${scope === 'all' ? 'active' : ''}" data-scope="all">All Items</button>
          <button class="scope-tab ${scope === 'repos' ? 'active' : ''}" data-scope="repos">Repositories (${filteredProjects.length})</button>
          <button class="scope-tab ${scope === 'miniapps' ? 'active' : ''}" data-scope="miniapps">Web Mini-Apps (${state.miniApps.length})</button>
          <button class="scope-tab ${scope === 'pcapps' ? 'active' : ''}" data-scope="pcapps">PC Apps (${state.pcApps.length})</button>
        </div>
        <div style="font-size:11px;color:#8A8F98;">Double-click icon to launch</div>
      </div>

      <!-- Category Pills -->
      <div class="category-pills-row">
        <button class="cat-pill ${cat === 'all' ? 'active' : ''}" data-cat="all">⚡ All</button>
        <button class="cat-pill ${cat === 'websites' ? 'active' : ''}" data-cat="websites">🌐 Websites & Apps</button>
        <button class="cat-pill ${cat === 'apis' ? 'active' : ''}" data-cat="apis">⚙️ APIs & Services</button>
        <button class="cat-pill ${cat === 'ai-agents' ? 'active' : ''}" data-cat="ai-agents">🤖 AI Agents</button>
        <button class="cat-pill ${cat === 'tools' ? 'active' : ''}" data-cat="tools">🔧 Tools & Utilities</button>
      </div>

      <!-- Repositories Section Title -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 14px 0;">
        <div style="display:flex;align-items:center;gap:8px;font-size:11px;font-weight:600;letter-spacing:0.06em;color:#8A8F98;text-transform:uppercase;">
          <span>📁 Repositories & Local Projects</span>
          <span style="padding:1px 6px;border-radius:4px;background:rgba(255,255,255,0.06);color:#D4D4D8;">${filteredProjects.length}</span>
        </div>
        <button class="circle-action-btn" id="demoAddProjectBtn" title="Add New Project" style="width:24px;height:24px;border-radius:6px;font-size:14px;">+</button>
      </div>

      <!-- SQUIRCLE GRID (Mobile App Launcher Style) -->
      <div class="squircle-app-grid">
    `;

    filteredProjects.forEach(p => {
      const isRunning = p.status === 'running';
      const isStarting = p.status === 'starting';
      const hasError = p.status === 'error';

      let statusDot = '';
      if (isRunning) statusDot = `<div class="squircle-status-dot green"></div>`;
      else if (isStarting) statusDot = `<div class="squircle-status-dot amber"></div>`;
      else if (hasError) statusDot = `<div class="squircle-status-dot red"></div>`;

      let timerBadge = '';
      if (isRunning) {
        timerBadge = `
          <button class="running-timer-badge" data-action="preview" data-id="${p.id}" title="Click to open running webview">
            <span class="pulse-green-dot" style="width:5px;height:5px;"></span>
            <span>02:14</span>
            <span style="opacity:0.8;">:${p.port} ↗</span>
          </button>
        `;
      } else if (isStarting) {
        timerBadge = `
          <div class="running-timer-badge" style="border-color:#F59E0B;color:#FBBF24;">
            <span>Starting...</span>
          </div>
        `;
      }

      html += `
        <div class="squircle-item-wrap" id="squircle-${p.id}" data-id="${p.id}">
          <div class="squircle-box ${isRunning ? 'running' : ''}">
            ${p.iconSvg}
            ${statusDot}

            <!-- Pin Badge -->
            ${p.isPinned ? `<div style="position:absolute;top:6px;left:6px;font-size:10px;">📌</div>` : ''}

            <!-- Hover Action Overlay -->
            <div class="squircle-hover-overlay">
              ${isRunning
                ? `<button class="circle-action-btn" data-action="stop" data-id="${p.id}" title="Stop Server">■</button>`
                : `<button class="circle-action-btn" data-action="run" data-id="${p.id}" title="Run Server">▶</button>`
              }
              ${isRunning ? `<button class="circle-action-btn" data-action="preview" data-id="${p.id}" title="Open Preview">↗</button>` : ''}
              ${hasError ? `<button class="circle-action-btn" data-action="diagnose" data-id="${p.id}" title="AI Fix Error" style="background:#DC2626;">⚡</button>` : ''}
              <button class="circle-action-btn" data-action="terminal" data-id="${p.id}" title="Terminal">⌨</button>
              <button class="circle-action-btn" data-action="vscode" data-id="${p.id}" title="VS Code">💻</button>
              <button class="circle-action-btn" data-action="folder" data-id="${p.id}" title="Folder">📁</button>
            </div>
          </div>

          ${timerBadge}
          <div class="squircle-app-title" title="${p.name}">${p.name}</div>
          <div class="squircle-app-meta">${p.techLabel}</div>
        </div>
      `;
    });

    html += `</div>`;
    stageScrollArea.innerHTML = html;
    attachSquircleListeners();
  }

  function attachSquircleListeners() {
    // Double click to run/stop
    stageScrollArea.querySelectorAll('.squircle-item-wrap').forEach(wrap => {
      wrap.addEventListener('dblclick', () => {
        const id = wrap.getAttribute('data-id');
        const proj = state.projects.find(p => p.id === id);
        if (proj) {
          if (proj.status === 'running') handleStopProject(proj);
          else handleRunProject(proj);
        }
      });
    });

    // Action buttons inside hover overlay
    stageScrollArea.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const proj = state.projects.find(p => p.id === id);
        if (!proj) return;

        if (action === 'run') handleRunProject(proj);
        else if (action === 'stop') handleStopProject(proj);
        else if (action === 'preview') openInAppTab(proj);
        else if (action === 'terminal') openTerminalFor(proj);
        else if (action === 'vscode') showToast(`Opening ${proj.name} in Visual Studio Code...`);
        else if (action === 'folder') showToast(`Revealing ${proj.path} in File Explorer...`);
        else if (action === 'diagnose') openDiagnosticModal();
      });
    });

    // Scope Tabs
    stageScrollArea.querySelectorAll('[data-scope]').forEach(tab => {
      tab.addEventListener('click', () => {
        const scope = tab.getAttribute('data-scope');
        state.activeScope = scope;
        if (scope === 'miniapps') setView('miniapps');
        else if (scope === 'pcapps') setView('pcapps');
        else renderLauncherGrid();
      });
    });

    // Category Pills
    stageScrollArea.querySelectorAll('[data-cat]').forEach(pill => {
      pill.addEventListener('click', () => {
        state.activeCategory = pill.getAttribute('data-cat');
        renderLauncherGrid();
      });
    });

    const addBtn = document.getElementById('demoAddProjectBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        showToast('Drag & drop any folder into the window to auto-import!');
      });
    }
  }

  function handleRunProject(proj) {
    proj.status = 'starting';
    renderLauncherGrid();
    openTerminalFor(proj);

    appendTerminalLog(proj, { type: 'cmd', text: `$ ${proj.command}` });
    appendTerminalLog(proj, { type: 'info', text: `Spawning background cross-platform shell...` });

    setTimeout(() => {
      proj.status = 'running';
      state.runningCount++;
      updateStageStatusbar();
      appendTerminalLog(proj, { type: 'success', text: `[DevWorkspace] Server ready & listening on http://localhost:${proj.port}` });
      renderLauncherGrid();
      showToast(`${proj.name} running on port :${proj.port}!`);
    }, 850);
  }

  function handleStopProject(proj) {
    proj.status = 'stopped';
    state.runningCount = Math.max(0, state.runningCount - 1);
    updateStageStatusbar();
    appendTerminalLog(proj, { type: 'warning', text: `[DevWorkspace] Process terminated (SIGINT). Port ${proj.port} released.` });
    renderLauncherGrid();
    showToast(`${proj.name} stopped.`);
  }

  // ================= 2. AI STUDIO VIEW (ALL AI MODES) =================
  function renderAIStudio() {
    const curAgent = state.agents.find(a => a.id === state.activeAgentId) || state.agents[0];

    let html = `
      <div style="display:flex;flex-direction:column;height:100%;gap:10px;">
        <!-- AI Modes Bar -->
        <div class="ai-view-modes-bar">
          <div style="display:flex;align-items:center;gap:6px;">
            <button class="ai-mode-pill-btn ${state.aiMode === 'copilot' ? 'active' : ''}" id="aiModeCopilotBtn">
              <span>👤</span> Single Specialist Copilot
            </button>
            <button class="ai-mode-pill-btn ${state.aiMode === 'roundtable' ? 'active' : ''}" id="aiModeRoundtableBtn">
              <span>👥</span> Multi-Agent Roundtable
            </button>
            <button class="ai-mode-pill-btn ${state.aiMode === 'diagnostic' ? 'active' : ''}" id="aiModeDiagnosticBtn">
              <span>⚡</span> AI Error Diagnostic
            </button>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:11px;padding:3px 8px;border-radius:9999px;background:#255A41;color:#FDFDFD;font-weight:600;">OpenRouter Live</span>
            <span style="font-size:11px;color:#71717A;">Model: openrouter/free</span>
          </div>
        </div>
    `;

    if (state.aiMode === 'copilot') {
      // Specialist Copilot
      html += `
        <!-- Specialist Carousel -->
        <div class="copilot-specialist-scroll">
      `;
      state.agents.forEach(ag => {
        const isSel = ag.id === state.activeAgentId;
        html += `
          <button class="specialist-card-btn ${isSel ? 'active' : ''}" data-agent-select="${ag.id}">
            <span>${ag.avatar}</span>
            <span>${ag.name}</span>
          </button>
        `;
      });
      html += `</div>`;

      // Profile Header
      html += `
        <div style="padding:10px 16px;display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border-radius:8px;margin:0 16px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="dock-miniature-sphere" style="width:34px;height:34px;font-size:18px;display:flex;align-items:center;justify-content:center;">
              ${curAgent.avatar}
            </div>
            <div>
              <div style="font-size:13px;font-weight:600;color:#FFF;">${curAgent.name}</div>
              <div style="font-size:11px;color:#8A8F98;">${curAgent.role}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            ${curAgent.permissions.map(p => `<span class="badge-tag" style="font-size:10px;padding:2px 7px;">✓ ${p}</span>`).join('')}
          </div>
        </div>

        <!-- Chat Stream -->
        <div class="chat-dialogue-stream" id="copilotChatStream">
          <div class="dialogue-msg ai">
            <strong style="color:${curAgent.color};">${curAgent.name} • Active Specialist:</strong><br>
            Hello! I am your workspace <strong>${curAgent.role}</strong>. I have read access to your 6 local repositories, detected ports (:5173, :8000, :3000), and terminal logs. What should we build or diagnose today?
          </div>
        </div>

        <!-- Prompt Chips -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;padding:0 16px;">
          <button class="cat-pill" data-copilot-prompt="Review overall workspace health and active port allocations">⚡ Review Workspace Health</button>
          <button class="cat-pill" data-copilot-prompt="Diagnose Port 3000 EADDRINUSE conflict and provide 1-click CLI solution">⚡ Diagnose Port 3000</button>
          <button class="cat-pill" data-copilot-prompt="Generate production multi-stage Dockerfile for Next.js 15 App Router">⚡ Multi-stage Dockerfile</button>
          <button class="cat-pill" data-copilot-prompt="Audit security headers, CORS settings, and JWT token rotation">⚡ Security Audit</button>
        </div>

        <!-- Input Box -->
        <div style="display:flex;gap:8px;padding:0 16px 12px 16px;">
          <input type="text" id="copilotInputBox" placeholder="Ask ${curAgent.name} anything about your projects..." class="demo-search-input" style="height:38px;padding-left:14px;border-radius:6px;width:100%;">
          <button class="btn-secondary" id="sendCopilotMsgBtn" style="height:38px;padding:0 18px;border-radius:6px;">Send</button>
        </div>
      `;

    } else if (state.aiMode === 'roundtable') {
      // Autonomous Multi-Agent Roundtable
      html += `
        <div class="roundtable-arena">
          <div style="width:100%;text-align:center;font-size:11px;color:#80C776;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">
            DEEDOX Autonomous Collaborative Council (Click to toggle agents)
          </div>
      `;
      state.agents.slice(0, 5).forEach(ag => {
        html += `
          <div class="roundtable-agent-seat" id="seat-${ag.id}">
            <div class="roundtable-agent-avatar" style="background:${ag.color}">
              ${ag.avatar}
            </div>
            <div style="font-size:11px;font-weight:600;color:#D4D4D8;">${ag.name.split(' ')[0]}</div>
            <div style="font-size:9.5px;color:#71717A;">${ag.role.split(' ')[0]}</div>
          </div>
        `;
      });
      html += `
        </div>

        <div class="chat-dialogue-stream" id="roundtableChatStream" style="min-height:220px;">
          <div class="dialogue-msg ai">
            <strong style="color:#5E6AD2;">DEEDOX Master AI • Council Orchestrator:</strong><br>
            Welcome to the <strong>Autonomous Multi-Agent Roundtable</strong>. Pick an engineering mission below or enter a prompt. The council of 5 specialized agents will autonomously debate, architect, and deliver the complete solution.
          </div>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;padding:0 16px;">
          <button class="cat-pill" data-roundtable-goal="Architect high-concurrency WebSocket notification pipeline with Redis">🎯 WebSocket + Redis Pipeline</button>
          <button class="cat-pill" data-roundtable-goal="Audit full-stack authentication, refresh token rotation & CSRF protection">🎯 Auth & CSRF Audit</button>
          <button class="cat-pill" data-roundtable-goal="Diagnose and eliminate zombie process and memory leak on port 3000">🎯 Port 3000 Zombie Fix</button>
        </div>

        <div style="display:flex;gap:8px;padding:0 16px 12px 16px;">
          <input type="text" id="roundtableGoalInput" placeholder="Enter engineering goal for the council..." class="demo-search-input" style="height:38px;padding-left:14px;border-radius:6px;width:100%;">
          <button class="btn-secondary" id="startRoundtableBtn" style="height:38px;padding:0 18px;border-radius:6px;white-space:nowrap;">
            ▶ Start Autonomous Roundtable
          </button>
        </div>
      `;

    } else if (state.aiMode === 'diagnostic') {
      // AI Error Diagnostic
      html += `
        <div style="padding:16px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:8px;background:#DC2626;display:flex;align-items:center;justify-content:center;color:#FFF;font-size:20px;">⚠️</div>
              <div>
                <div style="font-weight:600;font-size:14px;color:#FFF;">Active Error: Broken Microservice (auth-service)</div>
                <div style="font-size:11px;color:#A1A1AA;">Port 3000 blocked by lingering process</div>
              </div>
            </div>
            <span class="badge-tag" style="background:#7C3AED;color:#FFF;border:none;">OpenRouter 98% Confidence</span>
          </div>

          <div style="padding:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:6px;font-family:var(--font-mono);font-size:11.5px;color:#FCA5A5;">
            events.js:377 throw er; // Unhandled error event<br>
            Error: listen EADDRINUSE: address already in use :::3000<br>
            &nbsp;&nbsp;&nbsp;&nbsp;at Server.setupListenHandle [as _listen2] (net.js:1331:16)
          </div>

          <div style="padding:12px;background:rgba(128,199,118,0.08);border-left:3px solid #80C776;border-radius:6px;">
            <strong style="color:#80C776;">Root Cause & Surgical Fix:</strong>
            <p style="font-size:12px;color:#D4D4D8;margin-top:4px;">
              PID 19842 is holding socket 0.0.0.0:3000. Run the command below to terminate the zombie process and boot the service cleanly:
            </p>
            <div style="display:flex;align-items:center;justify-content:space-between;background:#050508;border:1px solid rgba(128,199,118,0.3);padding:8px 12px;border-radius:4px;margin-top:8px;">
              <span style="font-family:var(--font-mono);font-size:12px;color:#80C776;">$ npx kill-port 3000 && npm start</span>
              <button class="btn-secondary" id="executeDiagFixBtn" style="height:30px;padding:0 12px;font-size:11.5px;">1-Click Fix & Launch</button>
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    stageScrollArea.innerHTML = html;
    attachAIStudioEvents();
  }

  function attachAIStudioEvents() {
    const copilotBtn = document.getElementById('aiModeCopilotBtn');
    const roundtableBtn = document.getElementById('aiModeRoundtableBtn');
    const diagnosticBtn = document.getElementById('aiModeDiagnosticBtn');

    if (copilotBtn) copilotBtn.addEventListener('click', () => { state.aiMode = 'copilot'; renderAIStudio(); });
    if (roundtableBtn) roundtableBtn.addEventListener('click', () => { state.aiMode = 'roundtable'; renderAIStudio(); });
    if (diagnosticBtn) diagnosticBtn.addEventListener('click', () => { state.aiMode = 'diagnostic'; renderAIStudio(); });

    stageScrollArea.querySelectorAll('[data-agent-select]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeAgentId = btn.getAttribute('data-agent-select');
        renderAIStudio();
      });
    });

    const copilotInput = document.getElementById('copilotInputBox');
    const copilotSend = document.getElementById('sendCopilotMsgBtn');
    if (copilotSend && copilotInput) {
      const handleSend = (text) => {
        if (!text.trim()) return;
        const chatBox = document.getElementById('copilotChatStream');
        if (!chatBox) return;

        const uMsg = document.createElement('div');
        uMsg.className = 'dialogue-msg user';
        uMsg.textContent = text;
        chatBox.appendChild(uMsg);
        copilotInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        const ag = state.agents.find(a => a.id === state.activeAgentId) || state.agents[0];
        setTimeout(() => {
          const aiMsg = document.createElement('div');
          aiMsg.className = 'dialogue-msg ai';
          aiMsg.innerHTML = `
            <strong style="color:${ag.color}">${ag.name} • ${ag.role}:</strong><br>
            ${generateCopilotReply(text)}
          `;
          chatBox.appendChild(aiMsg);
          chatBox.scrollTop = chatBox.scrollHeight;
        }, 550);
      };

      copilotSend.addEventListener('click', () => handleSend(copilotInput.value));
      copilotInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(copilotInput.value); });
      stageScrollArea.querySelectorAll('[data-copilot-prompt]').forEach(chip => {
        chip.addEventListener('click', () => handleSend(chip.getAttribute('data-copilot-prompt')));
      });
    }

    const startRoundtableBtn = document.getElementById('startRoundtableBtn');
    const roundtableGoalInput = document.getElementById('roundtableGoalInput');
    if (startRoundtableBtn && roundtableGoalInput) {
      startRoundtableBtn.addEventListener('click', () => {
        const goal = roundtableGoalInput.value.trim() || 'Architect high-concurrency WebSocket notification pipeline with Redis';
        runRoundtable(goal);
      });
      stageScrollArea.querySelectorAll('[data-roundtable-goal]').forEach(chip => {
        chip.addEventListener('click', () => {
          const goal = chip.getAttribute('data-roundtable-goal');
          roundtableGoalInput.value = goal;
          runRoundtable(goal);
        });
      });
    }

    const diagFix = document.getElementById('executeDiagFixBtn');
    if (diagFix) diagFix.addEventListener('click', executeFixCommand);
  }

  function generateCopilotReply(prompt) {
    const p = prompt.toLowerCase();
    if (p.includes('port') || p.includes('3000')) {
      return `
        Diagnostic check completed. Port 3000 is occupied by a dangling node process. Fix command ready:
        <div class="code-preview-box">$ npx kill-port 3000 && npm start</div>
      `;
    } else if (p.includes('docker')) {
      return `
        Multi-stage Next.js 15 Dockerfile prepared:
        <div class="code-preview-box">
          FROM node:22-alpine AS runner<br>
          WORKDIR /app<br>
          COPY --from=builder /app/.next/standalone ./<br>
          EXPOSE 3000<br>
          CMD ["node", "server.js"]
        </div>
      `;
    } else {
      return `I have inspected your workspace state for <code>${escapeHtml(prompt)}</code>. Everything is cleanly aligned and dependencies are optimal.`;
    }
  }

  function runRoundtable(goal) {
    const chatBox = document.getElementById('roundtableChatStream');
    if (!chatBox) return;

    chatBox.innerHTML = `<div class="dialogue-msg user"><strong>Mission:</strong> ${escapeHtml(goal)}</div>`;

    const rounds = [
      { id: 'agent-master-ai', name: 'DEEDOX Master AI', color: '#5E6AD2', speech: `Council assembled for: <em>"${escapeHtml(goal)}"</em>. Backend will define the async pipeline, Frontend will structure the optimistic React hook, Security will review tokens, and DevOps will build the deployment container.` },
      { id: 'agent-backend-dev', name: 'Backend Engineer', color: '#EA580C', speech: `Proposal: FastAPI + Redis Pub/Sub. Each user session binds to a light WebSocket channel with heartbeat ping every 15s.` },
      { id: 'agent-frontend-dev', name: 'Frontend Architect', color: '#E11D48', speech: `Client side hooked via <code>useWorkspaceSocket</code> with exponential backoff and zero UI lag.` },
      { id: 'agent-cyber-security', name: 'Security Auditor', color: '#DC2626', speech: `Verified. HMAC token validation added to WS handshake. Rate-limit enforced at 100 frames/sec.` },
      { id: 'agent-devops', name: 'DevOps Engineer', color: '#475569', speech: `Docker-compose manifest ready with Redis 7 Alpine and healthchecks configured.` }
    ];

    let idx = 0;
    function nextSpeaker() {
      if (idx >= rounds.length) {
        document.querySelectorAll('.roundtable-agent-seat').forEach(s => s.classList.remove('speaking'));
        showToast('Autonomous Roundtable mission complete! Blueprint generated.');
        return;
      }
      const item = rounds[idx];
      document.querySelectorAll('.roundtable-agent-seat').forEach(s => s.classList.remove('speaking'));
      const seat = document.getElementById(`seat-${item.id}`);
      if (seat) seat.classList.add('speaking');

      const msg = document.createElement('div');
      msg.className = 'dialogue-msg ai';
      msg.innerHTML = `<strong style="color:${item.color}">${item.name}:</strong><br>${item.speech}`;
      chatBox.appendChild(msg);
      chatBox.scrollTop = chatBox.scrollHeight;

      idx++;
      state.roundtableTimer = setTimeout(nextSpeaker, 1400);
    }
    nextSpeaker();
  }

  // ================= 3. MINI-APPS & PC APPS SQUIRCLE GRIDS =================
  function renderMiniAppsGrid() {
    let html = `
      <div style="padding:10px 0;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:12px;color:#8A8F98;">Web to Mini-App Launcher (NovaWeb Grid with Persistent Sessions)</span>
        <button class="btn-secondary" style="height:30px;font-size:11px;" onclick="alert('Auto-scraped site title & icon! Added to Launcher.')">+ Add URL</button>
      </div>
      <div class="squircle-app-grid">
    `;
    state.miniApps.forEach(app => {
      html += `
        <div class="squircle-item-wrap" onclick="alert('Launching ${app.name} with persistent login session.')">
          <div class="squircle-box" style="font-size:28px;">
            ${app.icon}
            <div class="squircle-status-dot green"></div>
          </div>
          <div class="running-timer-badge" style="border-color:#5E6AD2;color:#A5B4FC;">
            <span>${app.badge}</span>
          </div>
          <div class="squircle-app-title">${app.name}</div>
          <div class="squircle-app-meta">Mini-App</div>
        </div>
      `;
    });
    html += `</div>`;
    stageScrollArea.innerHTML = html;
  }

  function renderPcAppsGrid() {
    let html = `
      <div style="padding:10px 0;font-size:12px;color:#8A8F98;">
        Installed Desktop Applications auto-discovered on Windows
      </div>
      <div class="squircle-app-grid">
    `;
    state.pcApps.forEach(pc => {
      html += `
        <div class="squircle-item-wrap" onclick="alert('Spawning native executable: ${pc.name}')">
          <div class="squircle-box" style="font-size:28px;">
            ${pc.icon}
          </div>
          <div class="squircle-app-title">${pc.name}</div>
          <div class="squircle-app-meta">${pc.category}</div>
        </div>
      `;
    });
    html += `</div>`;
    stageScrollArea.innerHTML = html;
  }

  // ================= 4. IN-APP WEB BROWSER TAB =================
  function renderInAppBrowser() {
    let html = `
      <div style="height:100%;display:flex;flex-direction:column;border-radius:6px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <div style="height:36px;background:#14141A;display:flex;align-items:center;padding:0 12px;gap:8px;font-size:12px;">
          <span style="color:#8A8F98;cursor:pointer;">◀</span>
          <span style="color:#8A8F98;cursor:pointer;">▶</span>
          <span style="color:#8A8F98;cursor:pointer;">↻</span>
          <div style="flex:1;background:rgba(255,255,255,0.06);border-radius:4px;padding:3px 10px;font-family:var(--font-mono);font-size:11.5px;color:#80C776;display:flex;justify-content:space-between;">
            <span>🔒 http://localhost:5173/</span>
            <span style="color:#34D399;font-size:10px;">HMR Connected (42ms)</span>
          </div>
          <button class="circle-action-btn" id="inappSplitTerminalBtn" title="Split Terminal" style="width:24px;height:24px;border-radius:4px;">⌨</button>
        </div>
        <div style="flex:1;background:#09090C;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;">
          <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg, #7928CA, #4338CA);display:flex;align-items:center;justify-content:center;color:#FFF;font-size:28px;margin-bottom:12px;box-shadow:0 8px 24px rgba(121,40,202,0.4);">
            ⚡
          </div>
          <h3 style="font-size:18px;font-weight:600;color:#FFF;margin-bottom:4px;">NeuroFlow Studio Local Server</h3>
          <p style="font-size:12.5px;color:#8A8F98;max-width:380px;line-height:1.5;margin-bottom:16px;">
            In-App webview isolated from external browser cookies. Multi-task without cluttering desktop windows.
          </p>
          <div style="display:flex;gap:8px;">
            <button class="btn-secondary" style="height:32px;font-size:12px;" onclick="alert('HMR refresh triggered!')">Trigger Fast Refresh</button>
            <button class="btn-outline" style="height:32px;font-size:12px;" onclick="alert('DevTools Console opened!')">Inspect Element</button>
          </div>
        </div>
      </div>
    `;
    stageScrollArea.innerHTML = html;

    const splitBtn = document.getElementById('inappSplitTerminalBtn');
    if (splitBtn) {
      splitBtn.addEventListener('click', () => {
        state.terminalCollapsed = !state.terminalCollapsed;
        demoTerminalDrawer.classList.toggle('collapsed', state.terminalCollapsed);
      });
    }
  }

  function openInAppTab(proj) {
    setView('inapp');
    showToast(`Loaded ${proj.name} into in-app webview tab (:5173)`);
  }

  function renderTrendingView() {
    stageScrollArea.innerHTML = `
      <div style="padding:10px 0;font-size:12px;color:#8A8F98;">Trending Repositories with 1-Click Clone</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
        <div style="padding:14px;background:#121215;border:1px solid rgba(255,255,255,0.08);border-radius:8px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:14px;font-weight:600;color:#80C776;">deepseek-ai/DeepSeek-V3</div>
            <div style="font-size:12px;color:#8A8F98;margin-top:2px;">An open-source mixture-of-experts 671B parameter language model.</div>
            <div style="font-size:11px;color:#686870;margin-top:4px;">⭐ 48.2k • 🔱 6.1k • 🔷 Python</div>
          </div>
          <button class="btn-secondary" style="height:32px;font-size:12px;" onclick="alert('Cloning to C:\\\\Workspace\\\\DeepSeek-V3...')">1-Click Clone</button>
        </div>
      </div>
    `;
  }

  function renderNewsView() {
    stageScrollArea.innerHTML = `
      <div style="padding:10px 0;font-size:12px;color:#8A8F98;">Parallel Scraped Feeds (Hacker News, TechCrunch, The Verge)</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
        <div style="padding:14px;background:#121215;border:1px solid rgba(255,255,255,0.08);border-radius:8px;cursor:pointer;" onclick="alert('Opening in in-app webview reader')">
          <div style="font-size:11px;color:#80C776;font-weight:600;margin-bottom:4px;">Hacker News • 12m ago</div>
          <div style="font-size:14px;font-weight:500;color:#FFF;">DeepSeek releases new reasoning benchmarks outperforming legacy frontiers</div>
        </div>
      </div>
    `;
  }

  // ================= 5. TERMINAL & DIAGNOSTIC FIX =================
  function openTerminalFor(proj) {
    state.selectedProjectForTerminal = proj.id;
    terminalProjectName.textContent = `${proj.name} (${proj.command})`;
    renderTerminalLogs(proj);
    demoTerminalDrawer.classList.remove('collapsed');
    state.terminalCollapsed = false;
  }

  function appendTerminalLog(proj, log) {
    proj.logs.push(log);
    if (state.selectedProjectForTerminal === proj.id) {
      renderTerminalLogs(proj);
    }
  }

  function renderTerminalLogs(proj) {
    if (!terminalLogContent || !proj) return;
    let html = '';
    proj.logs.forEach(l => {
      let cls = 'log-info';
      if (l.type === 'success') cls = 'log-success';
      if (l.type === 'warning') cls = 'log-warning';
      if (l.type === 'error') cls = 'log-error';
      if (l.type === 'cmd') cls = 'log-cmd';
      html += `<div class="${cls}">${escapeHtml(l.text)}</div>`;
    });
    terminalLogContent.innerHTML = html;
    terminalLogContent.scrollTop = terminalLogContent.scrollHeight;
  }

  function openDiagnosticModal() {
    demoDiagnosticModal.classList.add('open');
  }

  function closeDiagnosticModal() {
    demoDiagnosticModal.classList.remove('open');
  }

  function executeFixCommand() {
    const errorProj = state.projects.find(p => p.id === 'sample-error-svc');
    if (!errorProj) return;

    closeDiagnosticModal();
    openTerminalFor(errorProj);

    appendTerminalLog(errorProj, { type: 'cmd', text: `$ npx kill-port 3000` });
    appendTerminalLog(errorProj, { type: 'success', text: `[AI Diagnostic] PID 19842 killed. Port 3000 released.` });
    appendTerminalLog(errorProj, { type: 'cmd', text: `$ npm start` });

    setTimeout(() => {
      errorProj.status = 'running';
      errorProj.port = 3000;
      state.runningCount++;
      updateStageStatusbar();
      appendTerminalLog(errorProj, { type: 'success', text: `Server listening at http://localhost:3000` });
      renderStage();
      showToast('AI Fix applied! Broken Microservice running on port :3000');
    }, 800);
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ================= 6. INITIALIZATION & GLOBAL LISTENERS =================
  function init() {
    // TitleBar Tabs
    document.querySelectorAll('.titlebar-tab').forEach(t => {
      t.addEventListener('click', () => setView(t.getAttribute('data-tab')));
    });

    // Sidebar items
    document.querySelectorAll('.sidebar-btn').forEach(b => {
      b.addEventListener('click', () => {
        const v = b.getAttribute('data-view');
        if (v) setView(v);
      });
    });

    // Sidebar Category clicks
    document.querySelectorAll('[data-sidebar-cat]').forEach(sc => {
      sc.addEventListener('click', () => {
        state.activeCategory = sc.getAttribute('data-sidebar-cat');
        setView('launcher');
      });
    });

    // Floating Bottom Dock Buttons
    document.querySelectorAll('.dock-item-btn').forEach(d => {
      d.addEventListener('click', () => {
        const action = d.getAttribute('data-dock');
        if (action === 'scan') {
          if (scanModalOverlay) scanModalOverlay.classList.add('open');
        } else if (action === 'settings') {
          if (settingsModalOverlay) settingsModalOverlay.classList.add('open');
        } else if (action === 'download') {
          showToast('Navigating to Official Releases section below...');
          window.location.hash = '#download';
        } else {
          setView(action);
        }
      });
    });

    // Theme Toggle & Persistence (Qoder Light Default + Dark Toggle)
    function applySavedTheme() {
      const savedTheme = localStorage.getItem('agy_theme') || 'light';
      const isDark = savedTheme === 'dark';
      state.theme = isDark ? 'dark' : 'light';
      document.documentElement.classList.toggle('theme-dark', isDark);
      if (demoWindow) demoWindow.classList.toggle('theme-light', !isDark);
      const themeText = document.getElementById('themeToggleText');
      if (themeText) themeText.textContent = isDark ? 'Nova Dark' : 'Qoder Light';
      document.querySelectorAll('.theme-icon-indicator').forEach(ic => {
        ic.textContent = isDark ? '☀️' : '🌙';
      });
    }

    applySavedTheme();

    function toggleTheme() {
      const isCurrentlyDark = document.documentElement.classList.contains('theme-dark');
      const nextTheme = isCurrentlyDark ? 'light' : 'dark';
      localStorage.setItem('agy_theme', nextTheme);
      applySavedTheme();
      if (typeof showToast === 'function') {
        showToast(nextTheme === 'light' ? 'Switched to Qoder Light Mode' : 'Switched to Nova OLED Dark Mode');
      }
    }

    document.querySelectorAll('.theme-toggle-switch, .global-theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Terminal Drawer Controls
    if (toggleTerminalBtn) {
      toggleTerminalBtn.addEventListener('click', () => {
        state.terminalCollapsed = !state.terminalCollapsed;
        demoTerminalDrawer.classList.toggle('collapsed', state.terminalCollapsed);
      });
    }
    if (clearTerminalBtn) {
      clearTerminalBtn.addEventListener('click', () => {
        const p = state.projects.find(x => x.id === state.selectedProjectForTerminal);
        if (p) { p.logs = []; renderTerminalLogs(p); }
      });
    }

    // Modals
    if (closeDiagnosticBtn) closeDiagnosticBtn.addEventListener('click', closeDiagnosticModal);
    if (runFixBtn) runFixBtn.addEventListener('click', executeFixCommand);

    if (openScanModalBtn && scanModalOverlay) openScanModalBtn.addEventListener('click', () => scanModalOverlay.classList.add('open'));
    if (closeScanModalBtn && scanModalOverlay) closeScanModalBtn.addEventListener('click', () => scanModalOverlay.classList.remove('open'));
    if (runScanBtn) {
      runScanBtn.addEventListener('click', () => {
        const pArea = document.getElementById('scanProgressArea');
        if (pArea) {
          pArea.innerHTML = '<span style="color:#80C776;">Scanning C:\\, D:\\, E:\\... Pruning node_modules, .next & venv...</span>';
          setTimeout(() => {
            pArea.innerHTML = `
              <div style="color:#10B981;font-weight:600;">✓ Scan Complete in 2.1s — 14,280 directories inspected</div>
              <div style="font-size:12px;color:#D4D4D8;margin-top:4px;">Discovered: Trendshift Analytics, Go Proxy, Swarm Core</div>
            `;
            if (importScannedBtn) importScannedBtn.style.display = 'inline-flex';
          }, 1100);
        }
      });
    }
    if (importScannedBtn) {
      importScannedBtn.addEventListener('click', () => {
        scanModalOverlay.classList.remove('open');
        state.projects.push({
          id: 'proj-scanned-trend',
          name: 'Trendshift Analytics',
          framework: 'vite',
          techLabel: 'Vite + React',
          iconSvg: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
          path: 'C:\\Workspace\\trendshift',
          category: 'tools',
          port: 5174,
          status: 'stopped',
          elapsed: 0,
          command: 'npm run dev',
          logs: []
        });
        renderStage();
        showToast('Imported scanned repositories into App Drawer!');
      });
    }

    if (openSettingsBtn && settingsModalOverlay) openSettingsBtn.addEventListener('click', () => settingsModalOverlay.classList.add('open'));
    if (closeSettingsBtn && settingsModalOverlay) closeSettingsBtn.addEventListener('click', () => settingsModalOverlay.classList.remove('open'));
    if (testApiKeyBtn) {
      testApiKeyBtn.addEventListener('click', () => {
        testApiKeyBtn.textContent = 'Testing...';
        setTimeout(() => {
          testApiKeyBtn.textContent = '✓ Verified (142ms)';
          testApiKeyBtn.style.background = '#255A41';
          showToast('OpenRouter API key verified! Connected to openrouter/free.');
        }, 700);
      });
    }

    // Search Box
    const sBox = document.getElementById('demoSearchInput');
    if (sBox) {
      sBox.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (state.activeView === 'launcher') renderLauncherGrid();
      });
    }

    // Qoder Hero Prompt Box Interactions ("Everything starts from here...")
    const heroPromptInput = document.getElementById('heroPromptInput');
    const heroPromptSubmitBtn = document.getElementById('heroPromptSubmitBtn');
    function executeHeroPrompt(cmd) {
      if (!cmd) return;
      const lower = cmd.toLowerCase();
      if (lower.includes('scan')) {
        if (scanModalOverlay) scanModalOverlay.classList.add('open');
        showToast('Running Drive Scanner...');
      } else if (lower.includes('fix') || lower.includes('error') || lower.includes('eaddrinuse')) {
        openDiagnosticModal();
        showToast('Opening OpenRouter AI Diagnostic...');
      } else if (lower.includes('roundtable') || lower.includes('agent') || lower.includes('copilot') || lower.includes('claude')) {
        setView('agents');
        showToast('Switching to AI Studio Roundtable Council...');
      } else if (lower.includes('neuroflow') || lower.includes('vite') || lower.includes('run')) {
        const p = state.projects.find(x => x.id === 'sample-vite');
        if (p) {
          p.status = 'running';
          p.elapsed = 180;
          renderStage();
          openTerminalFor(p);
          showToast('Launched NeuroFlow Studio (:5173)');
        }
      } else {
        showToast(`Executed: "${cmd}" in workspace cockpit.`);
      }
      const demoEl = document.getElementById('demoWindow');
      if (demoEl) {
        demoEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    if (heroPromptSubmitBtn && heroPromptInput) {
      heroPromptSubmitBtn.addEventListener('click', () => {
        executeHeroPrompt(heroPromptInput.value || 'Launch NeuroFlow Studio');
      });
      heroPromptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          executeHeroPrompt(heroPromptInput.value || 'Launch NeuroFlow Studio');
        }
      });
    }

    document.querySelectorAll('.prompt-pill-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const action = tag.getAttribute('data-action');
        if (action === 'run-neuroflow') executeHeroPrompt('Launch NeuroFlow Studio');
        else if (action === 'fix-error') executeHeroPrompt('Fix EADDRINUSE error');
        else if (action === 'scan-drives') executeHeroPrompt('Scan drives');
        else if (action === 'open-roundtable') executeHeroPrompt('Open Roundtable AI Council');
      });
    });

    // Build Your Way Tabs Switcher (Qoder Style)
    const showcaseData = {
      desktop: {
        pill: 'Made for Everyone',
        title: 'Desktop App & Squircle Workspace',
        subtitle: 'The all-new AI Dev Workspace — your native desktop coding platform.',
        desc: 'Concurrently launch local dev servers with sub-second port sniffing, manage background processes, and run terminal commands with zero tab clutter.',
        code: `// DevWorkspace Native Process Engine\nconst server = await workspace.launch("neuroflow-studio");\n=> { status: "running", port: 5173, elapsed: "02:14" }`
      },
      mobile: {
        pill: 'Remote Supervision',
        title: 'Mobile Companion Hub',
        subtitle: 'Agent and server supervision wherever you are.',
        desc: 'Monitor background compilation progress, view live server health, approve critical terminal operations, and get push alerts on crashes.',
        code: `// Mobile Companion WebSocket Stream\nsocket.on("server:crash", (event) => {\n  notifyUser({ action: "AI Auto-Fix", port: 3000 });\n});`
      },
      ide: {
        pill: 'NovaWeb Architecture',
        title: 'Web Mini-Apps with Persistent Sessions',
        subtitle: 'Never log in twice across desktop restarts.',
        desc: 'Dedicated Electron partitions (partition="persist:devworkspace_webapps") retain session cookies, auth tokens, and local storage for ChatGPT, Claude, GitHub, and Notion.',
        code: `<webview\n  src="https://claude.ai"\n  partition="persist:devworkspace_webapps"\n  allowpopups\n/>`
      },
      jetbrains: {
        pill: 'IDE Integration',
        title: 'VS Code, Cursor & JetBrains Synchronization',
        subtitle: 'One-click launch directly into your favorite editor.',
        desc: 'Seamlessly opens any discovered repository in VS Code, Cursor, WebStorm, or PyCharm with project context and pre-configured run scripts.',
        code: `$ code C:\\Workspace\\neuroflow-studio\n=> Dispatched to VS Code with DevWorkspace extension link`
      },
      cli: {
        pill: 'Terminal Native',
        title: 'xterm.js Engine & OpenRouter CLI Fixer',
        subtitle: 'Real-time ANSI stdout/stderr streaming with self-healing AI.',
        desc: 'Inspect process logs with syntax coloring, detect EADDRINUSE socket collisions automatically, and execute verified recovery commands with 1-click.',
        code: `$ npx kill-port 3000 && npm start\n=> [AI Healer] Port 3000 freed. Server listening at :3000`
      }
    };

    document.querySelectorAll('.product-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.product-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tabKey = btn.getAttribute('data-showcase');
        const data = showcaseData[tabKey];
        if (data) {
          const pillEl = document.getElementById('showcasePill');
          const titleEl = document.getElementById('showcaseTitle');
          const subEl = document.getElementById('showcaseSubtitle');
          const descEl = document.getElementById('showcaseDesc');
          const codeEl = document.getElementById('showcaseCode');
          if (pillEl) pillEl.textContent = data.pill;
          if (titleEl) titleEl.textContent = data.title;
          if (subEl) subEl.textContent = data.subtitle;
          if (descEl) descEl.textContent = data.desc;
          if (codeEl) codeEl.textContent = data.code;
        }
      });
    });

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(q => {
      q.addEventListener('click', () => q.parentElement.classList.toggle('active'));
    });

    renderStage();
    const defProj = state.projects[0];
    if (defProj && terminalLogContent) {
      renderTerminalLogs(defProj);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
