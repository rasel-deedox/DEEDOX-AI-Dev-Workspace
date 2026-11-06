import React, { useEffect, useState, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { AppDrawer } from './components/AppDrawer';
import { AddProjectModal } from './components/AddProjectModal';
import { AutoScanModal } from './components/AutoScanModal';
import { AddMiniAppModal } from './components/AddMiniAppModal';
import { BrowserTabManager } from './components/BrowserTabManager';
import { AIErrorDiagnosticModal } from './components/AIErrorDiagnosticModal';
import { GitHubTrendingView } from './components/GitHubTrendingView';
import { TechNewsPortal } from './components/TechNewsPortal';
import { SettingsModal } from './components/SettingsModal';
import { GitHubDownloadModal } from './components/GitHubDownloadModal';
import { PersonalAIAgentView } from './components/PersonalAIAgentView';
import { PcAppsView, resolvePcAppIcon, isGenericShortcutIcon } from './components/PcAppsView';
import { FloatingNavBar } from './components/FloatingNavBar';
import { FolderPlus } from 'lucide-react';
import type { 
  ProjectConfig, WorkspaceCategory, WorkspaceTab, 
  ProjectRuntime, TerminalLog, AppSettings, AIErrorAnalysis, GitHubRepo, MiniApp, PcAppConfig 
} from './types';

// Dynamic Localhost Port Extraction Regex
function extractLocalhostUrl(text: string): string | null {
  if (!text) return null;
  const clean = text
    .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '')
    .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
    .replace(/\[[0-9]{1,2}(?:;[0-9]{1,2})*m/g, '');

  const match = clean.match(/(https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]):[0-9]{2,5}(?:\/[^\s"'`<>)]*)?)/i);
  if (match && match[1]) {
    let cleanUrl = match[1].trim();
    cleanUrl = cleanUrl
      .replace('://0.0.0.0:', '://localhost:')
      .replace('://[::1]:', '://localhost:')
      .replace('://127.0.0.1:', '://localhost:');
    return cleanUrl.replace(/[.,;)]+$/, '');
  }

  const portMatch = clean.match(/(?:listening on|server running on|ready on|running on|started on|port:?)\s*(?:port\s*)?([0-9]{2,5})/i);
  if (portMatch && portMatch[1]) {
    const p = parseInt(portMatch[1], 10);
    if (p >= 1000 && p <= 65535) {
      return `http://localhost:${p}`;
    }
  }
  return null;
}

export const App: React.FC = () => {
  // Store state
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [miniApps, setMiniApps] = useState<MiniApp[]>([]);
  const [categories, setCategories] = useState<WorkspaceCategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('devworkspace_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          openRouterApiKey: parsed.openRouterApiKey || '',
          openRouterModel: parsed.openRouterModel && !parsed.openRouterModel.includes('deepseek-r1:free') ? parsed.openRouterModel : 'openrouter/free',
          useFreeModelsOnly: parsed.useFreeModelsOnly ?? true,
          defaultCloneLocation: parsed.defaultCloneLocation || 'C:\\Workspace',
          githubToken: parsed.githubToken || '',
          terminalFontSize: 13,
          glassmorphismBlur: 20,
          autoOpenUrlOnDetection: true,
          theme: (parsed.theme === 'soft-light' ? 'soft-light' : 'nova-dark') as any,
          windowControlsStyle: parsed.windowControlsStyle || 'macos',
          ...parsed,
        };
      }
    } catch (_) {}
    return {
      openRouterApiKey: '',
      openRouterModel: 'openrouter/free',
      useFreeModelsOnly: true,
      defaultCloneLocation: 'C:\\Workspace',
      githubToken: '',
      terminalFontSize: 13,
      glassmorphismBlur: 20,
      autoOpenUrlOnDetection: true,
      theme: 'nova-dark',
      windowControlsStyle: 'macos',
    };
  });

  const currentTheme = settings.theme === 'soft-light' ? 'soft-light' : 'nova-dark';
  const handleToggleTheme = () => {
    const nextTheme: AppSettings['theme'] = currentTheme === 'soft-light' ? 'nova-dark' : 'soft-light';
    const updated: AppSettings = { ...settings, theme: nextTheme };
    setSettings(updated);
    try {
      localStorage.setItem('devworkspace_settings', JSON.stringify(updated));
    } catch (_) {}
    window.electronAPI?.saveSettings(updated);
  };

  // Sync theme class to documentElement and body
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'soft-light') {
      root.classList.remove('dark');
      root.classList.add('light', 'theme-soft-light');
      root.classList.remove('theme-nova-dark');
      document.body.className = 'theme-soft-light bg-white text-zinc-900 overflow-hidden select-none font-sans antialiased';
    } else {
      root.classList.add('dark', 'theme-nova-dark');
      root.classList.remove('light', 'theme-soft-light');
      document.body.className = 'theme-nova-dark bg-[#080809] text-[#EDEDED] overflow-hidden select-none font-sans antialiased';
    }
  }, [currentTheme]);

  // Navigation & Category state
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [activeView, setActiveView] = useState<'launcher' | 'trending' | 'news' | 'ai-agent' | 'pc-apps'>('launcher');
  const [pcApps, setPcApps] = useState<PcAppConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tabs state
  const [tabs, setTabs] = useState<WorkspaceTab[]>([
    { id: 'home', type: 'home', title: 'App Drawer', canClose: false },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('home');

  // Process runtimes and logs
  const [runtimes, setRuntimes] = useState<Record<string, ProjectRuntime>>({});
  const [logs, setLogs] = useState<Record<string, TerminalLog[]>>({});

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAutoScanModalOpen, setIsAutoScanModalOpen] = useState(false);
  const [isAddMiniAppModalOpen, setIsAddMiniAppModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // AI Diagnostic Modal state
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    projectId: string;
    errorLog: string;
    analysis: AIErrorAnalysis | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    projectId: '',
    errorLog: '',
    analysis: null,
    isLoading: false,
  });

  // Initial Data Load
  useEffect(() => {
    const loadInitialData = async () => {
      if (window.electronAPI) {
        try {
          const store = await window.electronAPI.getStoreData();
          if (store.projects) {
            setProjects(store.projects);

            // Auto-detect authentic native icons for any previously imported projects missing an icon
            const missingIconProjects = store.projects.filter((p) => !p.icon && p.path);
            if (missingIconProjects.length > 0 && window.electronAPI) {
              const api = window.electronAPI;
              Promise.all(
                missingIconProjects.map(async (p) => {
                  try {
                    const detected = await api.detectProject(p.path);
                    if (detected?.icon) {
                      return { id: p.id, icon: detected.icon };
                    }
                  } catch (_) {}
                  return null;
                })
              ).then((resolved) => {
                const updates = resolved.filter(Boolean) as { id: string; icon: string }[];
                if (updates.length > 0) {
                  setProjects((prev) => {
                    const iconMap = new Map(updates.map((u) => [u.id, u.icon]));
                    const next = prev.map((p) => (iconMap.has(p.id) ? { ...p, icon: iconMap.get(p.id) } : p));
                    api.saveProjects(next);
                    return next;
                  });
                }
              });
            }
          }
          if (store.miniApps) setMiniApps(store.miniApps);
          if (store.categories) setCategories(store.categories);
          if (store.settings) setSettings(store.settings);
          const existingPcApps = store.pcApps;
          if (existingPcApps && existingPcApps.length > 0) {
            // Check if store.pcApps only has hardcoded mock starter apps
            const isOnlyStarters = existingPcApps.every((a) => a.id.startsWith('pcapp-') && !a.id.includes('scanned') && !a.id.includes('user'));
            if (isOnlyStarters && window.electronAPI?.scanInstalledPcApps) {
              window.electronAPI.scanInstalledPcApps().then((scanned) => {
                if (scanned && scanned.length > 0) {
                  const merged: PcAppConfig[] = scanned.map((s, idx) => ({
                    id: `pcapp-scanned-${idx}-${Date.now()}`,
                    name: s.name,
                    path: s.path,
                    icon: resolvePcAppIcon(s.name, s.path, s.icon),
                    category: s.category,
                    description: s.description || 'Installed software',
                    isFavorite: idx < 4,
                    createdAt: Date.now() - idx * 1000,
                  }));
                  setPcApps(merged);
                  window.electronAPI?.savePcApps?.(merged);
                } else {
                  const enriched = existingPcApps.map((a) => ({
                    ...a,
                    icon: resolvePcAppIcon(a.name, a.path, a.icon),
                  }));
                  setPcApps(enriched);
                }
              }).catch(() => {
                const enriched = existingPcApps.map((a) => ({
                  ...a,
                  icon: resolvePcAppIcon(a.name, a.path, a.icon),
                }));
                setPcApps(enriched);
              });
            } else {
              const enriched = existingPcApps.map((a) => ({
                ...a,
                icon: resolvePcAppIcon(a.name, a.path, a.icon),
              }));
              setPcApps(enriched);

              // Auto-heal missing or generic icons asynchronously
              const appsNeedingHeal = enriched.filter(
                (appItem) => !appItem.icon || !appItem.icon.startsWith('data:image') || isGenericShortcutIcon(appItem.icon)
              );

              if (appsNeedingHeal.length > 0) {
                if (window.electronAPI?.getBatchFileIcons) {
                  window.electronAPI.getBatchFileIcons(
                    appsNeedingHeal.map((a) => ({ id: a.id, path: a.path, name: a.name }))
                  ).then((iconMap) => {
                    if (iconMap && Object.keys(iconMap).length > 0) {
                      setPcApps((prev) => {
                        let hasChanges = false;
                        const updated = prev.map((item) => {
                          const newIcon = iconMap[item.id];
                          if (newIcon && !isGenericShortcutIcon(newIcon) && newIcon !== item.icon) {
                            hasChanges = true;
                            return { ...item, icon: newIcon };
                          }
                          return item;
                        });
                        if (hasChanges) {
                          window.electronAPI?.savePcApps?.(updated);
                        }
                        return updated;
                      });
                    }
                  }).catch(() => {});
                } else if (window.electronAPI?.getFileIcon) {
                  appsNeedingHeal.forEach((appItem) => {
                    window.electronAPI!.getFileIcon!(appItem.path).then((realIcon) => {
                      if (realIcon && !isGenericShortcutIcon(realIcon)) {
                        setPcApps((prev) => {
                          const updated = prev.map((item) => (item.id === appItem.id ? { ...item, icon: realIcon } : item));
                          window.electronAPI?.savePcApps?.(updated);
                          return updated;
                        });
                      }
                    }).catch(() => {});
                  });
                }
              }
            }
          } else {
            const starterPcApps: PcAppConfig[] = [
              {
                id: 'pcapp-vscode',
                name: 'Visual Studio Code',
                path: 'code',
                icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
                category: 'code',
                description: 'Code editing redefined',
                isFavorite: true,
                launchCount: 0,
                createdAt: Date.now() - 50000,
              },
              {
                id: 'pcapp-chrome',
                name: 'Google Chrome',
                path: 'chrome',
                icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg',
                category: 'browser',
                description: 'Fast, secure web browser',
                isFavorite: true,
                launchCount: 0,
                createdAt: Date.now() - 40000,
              },
              {
                id: 'pcapp-git',
                name: 'Git Bash',
                path: 'C:\\Program Files\\Git\\git-bash.exe',
                icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
                category: 'code',
                description: 'Git distributed version control',
                isFavorite: true,
                launchCount: 0,
                createdAt: Date.now() - 35000,
              },
              {
                id: 'pcapp-discord',
                name: 'Discord',
                path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Discord\\Update.exe',
                icon: 'https://cdn.simpleicons.org/discord/5865F2',
                category: 'productivity',
                description: 'Voice, video and text chat',
                isFavorite: false,
                launchCount: 0,
                createdAt: Date.now() - 32000,
              },
              {
                id: 'pcapp-figma',
                name: 'Figma',
                path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Figma\\Figma.exe',
                icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
                category: 'design',
                description: 'Interface design tool',
                isFavorite: false,
                launchCount: 0,
                createdAt: Date.now() - 31000,
              },
              {
                id: 'pcapp-terminal',
                name: 'Windows Terminal',
                path: 'wt',
                icon: 'https://cdn.simpleicons.org/windowsterminal/4D4D4D',
                category: 'utilities',
                description: 'Command line terminal',
                isFavorite: false,
                launchCount: 0,
                createdAt: Date.now() - 30000,
              },
              {
                id: 'pcapp-steam',
                name: 'Steam',
                path: 'C:\\Program Files (x86)\\Steam\\steam.exe',
                icon: 'https://cdn.simpleicons.org/steam/white',
                category: 'games',
                description: 'Ultimate entertainment platform',
                isFavorite: false,
                launchCount: 0,
                createdAt: Date.now() - 28000,
              },
              {
                id: 'pcapp-postman',
                name: 'Postman',
                path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Postman\\Postman.exe',
                icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
                category: 'code',
                description: 'API development and testing',
                isFavorite: false,
                launchCount: 0,
                createdAt: Date.now() - 25000,
              },
            ];

            // If in Electron, scan real Windows desktop shortcuts & installed programs
            if (window.electronAPI?.scanInstalledPcApps) {
              window.electronAPI.scanInstalledPcApps().then((scanned) => {
                if (scanned && scanned.length > 0) {
                  const merged: PcAppConfig[] = scanned.map((s, idx) => ({
                    id: `pcapp-scanned-${idx}-${Date.now()}`,
                    name: s.name,
                    path: s.path,
                    icon: resolvePcAppIcon(s.name, s.path, s.icon),
                    category: s.category,
                    description: s.description || 'Desktop shortcut / app',
                    isFavorite: idx < 4,
                    createdAt: Date.now() - idx * 1000,
                  }));
                  setPcApps(merged);
                  window.electronAPI?.savePcApps?.(merged);
                } else {
                  setPcApps(starterPcApps);
                  window.electronAPI?.savePcApps?.(starterPcApps);
                }
              }).catch(() => {
                setPcApps(starterPcApps);
                window.electronAPI?.savePcApps?.(starterPcApps);
              });
            } else {
              setPcApps(starterPcApps);
              window.electronAPI?.savePcApps?.(starterPcApps);
            }
          }

          // If no projects exist initially, create sample starter projects
          if (!store.projects || store.projects.length === 0) {
            const sampleProjects: ProjectConfig[] = [
              {
                id: 'sample-ai-agent',
                name: 'AutoGPT Agent Worker',
                path: 'C:\\Workspace\\AutoGPT-Agent',
                category: 'ai-agents',
                framework: 'python',
                command: 'python agent.py',
                defaultPort: 8000,
                createdAt: Date.now(),
              },
              {
                id: 'sample-vite-app',
                name: 'NextGen Dashboard UI',
                path: 'C:\\Workspace\\NextGen-UI',
                category: 'websites',
                framework: 'vite',
                command: 'npm run dev',
                defaultPort: 5173,
                createdAt: Date.now(),
              },
              {
                id: 'sample-api-server',
                name: 'FastAPI Microservice',
                path: 'C:\\Workspace\\FastAPI-Backend',
                category: 'apis',
                framework: 'fastapi',
                command: 'python -m uvicorn main:app --reload',
                defaultPort: 8080,
                createdAt: Date.now(),
              },
            ];
            setProjects(sampleProjects);
            window.electronAPI.saveProjects(sampleProjects);
          }
        } catch (err) {
          console.error('Failed to load store data:', err);
        }
      } else {
        // Fallback for web preview
        setCategories([
          { id: 'all', name: 'All Projects', icon: 'LayoutGrid' },
          { id: 'ai-agents', name: 'AI Agents', icon: 'Bot' },
          { id: 'websites', name: 'Websites & Apps', icon: 'Globe' },
          { id: 'apis', name: 'APIs & Services', icon: 'Server' },
          { id: 'tools', name: 'Tools & Utilities', icon: 'Wrench' },
        ]);
        let savedProjects: ProjectConfig[] | null = null;
        try {
          const rawP = localStorage.getItem('devworkspace_projects');
          if (rawP) savedProjects = JSON.parse(rawP);
        } catch (_) {}

        if (savedProjects && Array.isArray(savedProjects) && savedProjects.length > 0) {
          setProjects(savedProjects);
        } else {
          setProjects([
            {
              id: 'sample-spatial',
              name: 'Spatial Aptitude',
              path: 'C:\\Workspace\\Spatial-Aptitude',
              category: 'websites',
              framework: 'react',
              command: 'npm run dev',
              defaultPort: 3000,
              createdAt: Date.now() - 50000,
              isPinned: true,
              tag: 'Production',
            },
            {
              id: 'sample-ai-agent',
              name: 'AutoGPT Agent Worker',
              path: 'C:\\Workspace\\AutoGPT-Agent',
              category: 'ai-agents',
              framework: 'python',
              command: 'python agent.py',
              defaultPort: 8000,
              createdAt: Date.now() - 40000,
              tag: 'AI',
            },
            {
              id: 'sample-trendshift',
              name: 'Trendshift Analytics',
              path: 'C:\\Workspace\\Trendshift',
              category: 'tools',
              framework: 'vite',
              command: 'npm run dev',
              defaultPort: 5174,
              createdAt: Date.now() - 30000,
            },
            {
              id: 'sample-fastapi',
              name: 'FastAPI Backend',
              path: 'C:\\Workspace\\FastAPI-Backend',
              category: 'apis',
              framework: 'fastapi',
              command: 'python -m uvicorn main:app --reload',
              defaultPort: 8080,
              createdAt: Date.now() - 20000,
              tag: 'API',
            },
          ]);
        }

        let savedMiniApps: MiniApp[] | null = null;
        try {
          const rawM = localStorage.getItem('devworkspace_miniapps');
          if (rawM) savedMiniApps = JSON.parse(rawM);
        } catch (_) {}

        if (savedMiniApps && Array.isArray(savedMiniApps) && savedMiniApps.length > 0) {
          setMiniApps(savedMiniApps);
        } else {
          setMiniApps([
            {
              id: 'miniapp-reddit',
              name: 'Reddit',
              url: 'https://reddit.com',
              icon: 'https://www.redditstatic.com/shreddit/assets/favicon/192x192.png',
              category: 'Social',
              createdAt: Date.now() - 80000,
              badge: 'Hot',
            },
            {
              id: 'miniapp-producthunt',
              name: 'Producthunt',
              url: 'https://producthunt.com',
              icon: 'https://ph-static.imgix.net/ph-favicon-coral.ico',
              category: 'Productivity',
              createdAt: Date.now() - 70000,
              badge: 'New',
            },
            {
              id: 'miniapp-notion',
              name: 'Notion',
              url: 'https://notion.so',
              icon: 'https://www.notion.so/images/favicon.ico',
              category: 'Productivity',
              createdAt: Date.now() - 60000,
            },
            {
              id: 'miniapp-figma',
              name: 'Figma',
              url: 'https://figma.com',
              icon: 'https://static.figma.com/app/icon/1/favicon.png',
              category: 'Design',
              createdAt: Date.now() - 50000,
              isPinned: true,
            },
            {
              id: 'miniapp-github',
              name: 'GitHub',
              url: 'https://github.com',
              icon: 'https://github.githubassets.com/favicons/favicon.png',
              category: 'Dev Tools',
              createdAt: Date.now() - 40000,
              badge: 'Git',
              isPinned: true,
            },
            {
              id: 'miniapp-medium',
              name: 'Medium',
              url: 'https://medium.com',
              icon: 'https://miro.medium.com/v2/resize:fill:152:152/1*sHhtYhaCe2Uc3IU0IgKwIQ.png',
              category: 'Social',
              createdAt: Date.now() - 30000,
            },
            {
              id: 'miniapp-chatgpt',
              name: 'ChatGPT',
              url: 'https://chatgpt.com',
              icon: 'https://chatgpt.com/favicon.ico',
              category: 'AI Tools',
              createdAt: Date.now() - 20000,
              badge: 'AI',
            },
          ]);
        }
        setPcApps([
            {
              id: 'pcapp-vscode',
              name: 'Visual Studio Code',
              path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
              category: 'code',
              description: 'Code editing redefined',
              isFavorite: true,
              launchCount: 0,
              createdAt: Date.now() - 50000,
            },
            {
              id: 'pcapp-chrome',
              name: 'Google Chrome',
              path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg',
              category: 'browser',
              description: 'Fast, secure web browser',
              isFavorite: true,
              launchCount: 0,
              createdAt: Date.now() - 40000,
            },
            {
              id: 'pcapp-git',
              name: 'Git Bash',
              path: 'C:\\Program Files\\Git\\git-bash.exe',
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
              category: 'code',
              description: 'Git distributed version control',
              isFavorite: true,
              launchCount: 0,
              createdAt: Date.now() - 35000,
            },
            {
              id: 'pcapp-discord',
              name: 'Discord',
              path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Discord\\Update.exe',
              icon: 'https://cdn.simpleicons.org/discord/5865F2',
              category: 'productivity',
              description: 'Voice, video and text chat',
              isFavorite: false,
              launchCount: 0,
              createdAt: Date.now() - 32000,
            },
            {
              id: 'pcapp-figma',
              name: 'Figma',
              path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Figma\\Figma.exe',
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
              category: 'design',
              description: 'Interface design tool',
              isFavorite: false,
              launchCount: 0,
              createdAt: Date.now() - 31000,
            },
            {
              id: 'pcapp-terminal',
              name: 'Windows Terminal',
              path: 'wt',
              icon: 'https://cdn.simpleicons.org/windowsterminal/4D4D4D',
              category: 'utilities',
              description: 'Command line terminal',
              isFavorite: false,
              launchCount: 0,
              createdAt: Date.now() - 30000,
            },
            {
              id: 'pcapp-steam',
              name: 'Steam',
              path: 'C:\\Program Files (x86)\\Steam\\steam.exe',
              icon: 'https://cdn.simpleicons.org/steam/white',
              category: 'games',
              description: 'Ultimate entertainment platform',
              isFavorite: false,
              launchCount: 0,
              createdAt: Date.now() - 28000,
            },
            {
              id: 'pcapp-postman',
              name: 'Postman',
              path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Postman\\Postman.exe',
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
              category: 'code',
              description: 'API development and testing',
              isFavorite: false,
              launchCount: 0,
              createdAt: Date.now() - 25000,
            },
          ]);
        }
      };

    loadInitialData();
  }, []);

  // Listen to IPC Events from Electron Main Process
  useEffect(() => {
    if (!window.electronAPI) return;

    // 1. Logs listener
    const unsubLogs = window.electronAPI.onProjectLog(({ projectId, text, type }) => {
      setLogs((prev) => {
        const currentList = prev[projectId] || [];
        const newLog: TerminalLog = {
          id: `${Date.now()}-${Math.random()}`,
          projectId,
          text,
          type,
          timestamp: Date.now(),
        };
        return {
          ...prev,
          [projectId]: [...currentList.slice(-1500), newLog], // Keep last 1500 lines
        };
      });

      // Dynamic Localhost Port Extraction regex on every incoming terminal output
      const dynamicDetected = extractLocalhostUrl(text);
      if (dynamicDetected) {
        setRuntimes((prev) => {
          const cur = prev[projectId];
          if (cur?.detectedUrl === dynamicDetected) return prev;
          return {
            ...prev,
            [projectId]: {
              ...(cur || { id: projectId, status: 'running', elapsedSeconds: 0 }),
              status: 'running',
              detectedUrl: dynamicDetected,
            },
          };
        });
        if (settings.autoOpenUrlOnDetection) {
          openProjectBrowserTab(projectId, dynamicDetected);
        }
      }
    });

    // 2. Localhost URL detected listener (CRITICAL ONE-CLICK AUTO-ROUTING)
    const unsubUrl = window.electronAPI.onProjectUrlDetected(({ projectId, url, port }) => {
      setRuntimes((prev) => ({
        ...prev,
        [projectId]: {
          ...(prev[projectId] || { id: projectId, status: 'running', elapsedSeconds: 0 }),
          status: 'running',
          detectedUrl: url,
          port,
        },
      }));

      // Automatically open in an in-app browser tab!
      openProjectBrowserTab(projectId, url);
    });

    // 3. Status change listener
    const unsubStatus = window.electronAPI.onProjectStatusChange(({ projectId, status, error }) => {
      setRuntimes((prev) => {
        const existing = prev[projectId] || { id: projectId, status, elapsedSeconds: 0 };
        return {
          ...prev,
          [projectId]: {
            ...existing,
            status,
            lastError: error,
          },
        };
      });
    });

    // 4. Store updated listener (for auto-healed icons or updates from main process)
    const unsubStore = window.electronAPI.onStoreUpdated
      ? window.electronAPI.onStoreUpdated((updatedStore) => {
          if (updatedStore.pcApps && updatedStore.pcApps.length > 0) {
            setPcApps(updatedStore.pcApps);
          }
        })
      : undefined;

    return () => {
      unsubLogs();
      unsubUrl();
      unsubStatus();
      unsubStore?.();
    };
  }, [projects, settings.autoOpenUrlOnDetection]);

  // Elapsed timer ticker for active/starting projects
  useEffect(() => {
    const timer = setInterval(() => {
      setRuntimes((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [id, rt] of Object.entries(next)) {
          if (rt.status === 'starting' || rt.status === 'running') {
            next[id] = { ...rt, elapsedSeconds: rt.elapsedSeconds + 1 };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Helper to open project in browser tab — always uses runtime detectedUrl first (terminal-announced URL)
  const openProjectBrowserTab = (projectId: string, detectedUrl?: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Priority: 1) explicitly passed URL  2) runtime detectedUrl from terminal  3) defaultPort fallback
    const runtime = runtimes[projectId];
    const targetUrl =
      detectedUrl ||
      runtime?.detectedUrl ||
      project.detectedUrl ||
      (project.defaultPort ? `http://localhost:${project.defaultPort}` : 'http://localhost:3000');

    const tabId = `proj-tab-${projectId}`;

    setTabs((prev) => {
      const exists = prev.find((t) => t.id === tabId);
      if (exists) {
        return prev.map((t) => (t.id === tabId ? { ...t, url: targetUrl } : t));
      }
      return [
        ...prev,
        {
          id: tabId,
          type: 'project',
          title: project.name,
          projectId: project.id,
          url: targetUrl,
          canClose: true,
          isSplitView: false,
        },
      ];
    });

    setActiveTabId(tabId);
  };

  // Helper to open arbitrary browser tab (e.g. from Trending or News)
  const openGenericBrowserTab = (title: string, url: string) => {
    const tabId = `browser-${Date.now()}`;
    setTabs((prev) => [
      ...prev,
      {
        id: tabId,
        type: 'browser',
        title: title.slice(0, 24),
        url,
        canClose: true,
      },
    ]);
    setActiveTabId(tabId);
  };

  // Helper to open a Mini-App in an in-app browser tab
  const handleOpenMiniApp = (app: MiniApp) => {
    let targetUrl = (app.url || '').trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    const tabId = `miniapp-tab-${app.id}`;
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === tabId);
      if (exists) {
        return prev.map((t) => (t.id === tabId ? { ...t, url: targetUrl } : t));
      }
      return [
        ...prev,
        {
          id: tabId,
          type: 'miniapp',
          title: app.name,
          miniAppId: app.id,
          url: targetUrl,
          canClose: true,
        },
      ];
    });
    setActiveTabId(tabId);
  };

  // Open Terminal tab
  const openTerminalTab = (project: ProjectConfig) => {
    const tabId = `term-tab-${project.id}`;
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === tabId);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: tabId,
          type: 'project',
          title: `${project.name} (Terminal)`,
          projectId: project.id,
          canClose: true,
          isSplitView: true,
        },
      ];
    });
    setActiveTabId(tabId);
  };

  // Run Project One-Click
  const handleRunProject = async (project: ProjectConfig) => {
    setRuntimes((prev) => ({
      ...prev,
      [project.id]: {
        id: project.id,
        status: 'starting',
        elapsedSeconds: 0,
        startTime: Date.now(),
      },
    }));

    if (window.electronAPI) {
      const res = await window.electronAPI.startProject(project.id, project.command, project.path);
      if (!res.success) {
        setRuntimes((prev) => ({
          ...prev,
          [project.id]: {
            id: project.id,
            status: 'error',
            lastError: res.error,
            elapsedSeconds: 0,
          },
        }));
      }
    } else {
      setTimeout(() => {
        setRuntimes((prev) => ({
          ...prev,
          [project.id]: {
            id: project.id,
            status: 'running',
            detectedUrl: `http://localhost:${project.defaultPort || 3000}`,
            elapsedSeconds: 2,
          },
        }));
      }, 2000);
    }
  };

  const handleStopProject = async (projectId: string) => {
    if (window.electronAPI) {
      await window.electronAPI.stopProject(projectId);
    }
    setRuntimes((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || { id: projectId, elapsedSeconds: 0 }),
        status: 'stopped',
      },
    }));
  };

  const handleRestartProject = async (projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    if (window.electronAPI) {
      await window.electronAPI.restartProject(proj.id, proj.command, proj.path);
    }
  };

  // Add project to workspace
  const handleAddProject = (newProj: Omit<ProjectConfig, 'id' | 'createdAt'>) => {
    const fullProj: ProjectConfig = {
      ...newProj,
      id: `proj-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [...projects, fullProj];
    setProjects(updated);
    try {
      localStorage.setItem('devworkspace_projects', JSON.stringify(updated));
    } catch (_) {}
    window.electronAPI?.saveProjects(updated);
  };

  // Reorder projects via drag & drop
  const handleReorderProjects = (newOrder: ProjectConfig[]) => {
    setProjects(newOrder);
    try {
      localStorage.setItem('devworkspace_projects', JSON.stringify(newOrder));
    } catch (_) {}
    window.electronAPI?.saveProjects(newOrder);
  };

  // Reorder mini apps via drag & drop
  const handleReorderMiniApps = (newOrder: MiniApp[]) => {
    setMiniApps(newOrder);
    try {
      localStorage.setItem('devworkspace_miniapps', JSON.stringify(newOrder));
    } catch (_) {}
    window.electronAPI?.saveMiniApps(newOrder);
  };

  // Toggle pin project to top
  const handleTogglePinProject = (projectId: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === projectId ? { ...p, isPinned: !p.isPinned } : p));
      try {
        localStorage.setItem('devworkspace_projects', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveProjects(updated);
      return updated;
    });
  };

  // Toggle pin mini app to top
  const handleTogglePinMiniApp = (appId: string) => {
    setMiniApps((prev) => {
      const updated = prev.map((a) => (a.id === appId ? { ...a, isPinned: !a.isPinned } : a));
      try {
        localStorage.setItem('devworkspace_miniapps', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveMiniApps(updated);
      return updated;
    });
  };

  // Update custom tag for project
  const handleUpdateProjectTag = (projectId: string, tag: string) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === projectId ? { ...p, tag: tag || undefined } : p));
      try {
        localStorage.setItem('devworkspace_projects', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveProjects(updated);
      return updated;
    });
  };

  // Update custom tag for mini app
  const handleUpdateMiniAppTag = (appId: string, tag: string) => {
    setMiniApps((prev) => {
      const updated = prev.map((a) => (a.id === appId ? { ...a, tag: tag || undefined } : a));
      try {
        localStorage.setItem('devworkspace_miniapps', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveMiniApps(updated);
      return updated;
    });
  };

  // Batch import projects from drive scanner
  const handleBatchImportProjects = (scannedProjects: Omit<ProjectConfig, 'id' | 'createdAt'>[]) => {
    const newItems: ProjectConfig[] = scannedProjects.map((p, idx) => ({
      ...p,
      id: `proj-scan-${Date.now()}-${idx}`,
      createdAt: Date.now(),
    }));
    const updated = [...projects, ...newItems];
    setProjects(updated);
    try {
      localStorage.setItem('devworkspace_projects', JSON.stringify(updated));
    } catch (_) {}
    window.electronAPI?.saveProjects(updated);
  };

  // Add Mini-App
  const handleAddMiniApp = (newApp: Omit<MiniApp, 'id' | 'createdAt'>) => {
    const fullApp: MiniApp = {
      ...newApp,
      id: `miniapp-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [...miniApps, fullApp];
    setMiniApps(updated);
    try {
      localStorage.setItem('devworkspace_miniapps', JSON.stringify(updated));
    } catch (_) {}
    window.electronAPI?.saveMiniApps(updated);
  };

  // Delete Mini-App
  const handleDeleteMiniApp = (appId: string) => {
    setMiniApps((prev) => {
      const updated = prev.filter((a) => a.id !== appId);
      try {
        localStorage.setItem('devworkspace_miniapps', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveMiniApps(updated);
      return updated;
    });
    setTabs((prev) => prev.filter((t) => t.miniAppId !== appId));
    if (activeTabId.includes(appId)) {
      setActiveTabId('home');
    }
  };

  // Batch delete Mini-Apps
  const handleDeleteMiniAppsBatch = (appIds: string[]) => {
    const idSet = new Set(appIds);
    setMiniApps((prev) => {
      const updated = prev.filter((a) => !idSet.has(a.id));
      try {
        localStorage.setItem('devworkspace_miniapps', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveMiniApps(updated);
      return updated;
    });
    setTabs((prev) => prev.filter((t) => !t.miniAppId || !idSet.has(t.miniAppId)));
    if (appIds.some((id) => activeTabId.includes(id))) {
      setActiveTabId('home');
    }
  };

  // PC Apps Handlers
  const handleAddPcApp = (newApp: Omit<PcAppConfig, 'id' | 'createdAt'>) => {
    const fullApp: PcAppConfig = {
      ...newApp,
      id: `pcapp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      launchCount: 0,
    };
    setPcApps((prev) => {
      const existing = prev.find((a) => a.path.toLowerCase() === fullApp.path.toLowerCase());
      if (existing) return prev;
      const updated = [fullApp, ...prev];
      window.electronAPI?.savePcApps?.(updated);
      return updated;
    });
  };

  const handleAddBatchPcApps = (newAppsList: Array<Omit<PcAppConfig, 'id' | 'createdAt'>>) => {
    if (!newAppsList || newAppsList.length === 0) return;
    const fullApps: PcAppConfig[] = newAppsList.map((app, index) => ({
      ...app,
      id: `pcapp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now() + index,
      launchCount: 0,
    }));
    setPcApps((prev) => {
      const existingPaths = new Set(prev.map((a) => a.path.toLowerCase()));
      const filteredNew = fullApps.filter((a) => !existingPaths.has(a.path.toLowerCase()));
      if (filteredNew.length === 0) return prev;
      const updated = [...filteredNew, ...prev];
      window.electronAPI?.savePcApps?.(updated);
      return updated;
    });
  };

  const handleUpdatePcApp = (updatedApp: PcAppConfig) => {
    const updated = pcApps.map((a) => (a.id === updatedApp.id ? updatedApp : a));
    setPcApps(updated);
    window.electronAPI?.savePcApps?.(updated);
  };

  const handleDeletePcApp = (appId: string) => {
    const updated = pcApps.filter((a) => a.id !== appId);
    setPcApps(updated);
    window.electronAPI?.savePcApps?.(updated);
  };

  const handleLaunchPcApp = async (app: PcAppConfig) => {
    const updatedApp = {
      ...app,
      launchCount: (app.launchCount || 0) + 1,
      lastLaunchedAt: Date.now(),
    };
    handleUpdatePcApp(updatedApp);

    if (window.electronAPI?.launchPcApp) {
      const args = app.arguments ? app.arguments.split(' ').filter(Boolean) : undefined;
      return await window.electronAPI.launchPcApp(app.path, args);
    }
    return { success: false, error: 'Electron API unavailable' };
  };

  // Fallback if PC Apps view is disabled in settings
  useEffect(() => {
    if (settings.enablePcApps === false && activeView === 'pc-apps') {
      setActiveView('launcher');
    }
  }, [settings.enablePcApps, activeView]);

  // Delete project from workspace
  const handleDeleteProject = (projectId: string) => {
    handleStopProject(projectId);
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      try {
        localStorage.setItem('devworkspace_projects', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveProjects(updated);
      return updated;
    });

    setTabs((prev) => prev.filter((t) => t.projectId !== projectId));
    if (activeTabId.includes(projectId)) {
      setActiveTabId('home');
    }
  };

  // Batch delete projects from workspace
  const handleDeleteProjectsBatch = (projectIds: string[]) => {
    const idSet = new Set(projectIds);
    projectIds.forEach((id) => handleStopProject(id));
    setProjects((prev) => {
      const updated = prev.filter((p) => !idSet.has(p.id));
      try {
        localStorage.setItem('devworkspace_projects', JSON.stringify(updated));
      } catch (_) {}
      window.electronAPI?.saveProjects(updated);
      return updated;
    });

    setTabs((prev) => prev.filter((t) => !t.projectId || !idSet.has(t.projectId)));
    if (projectIds.some((id) => activeTabId.includes(id))) {
      setActiveTabId('home');
    }
  };

  // Add category
  const handleAddCategory = (name: string, icon: string) => {
    const newCat: WorkspaceCategory = {
      id: `cat-${Date.now()}`,
      name,
      icon,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    window.electronAPI?.saveCategories(updated);
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    window.electronAPI?.saveCategories(updated);
    if (activeCategoryId === catId) {
      setActiveCategoryId('all');
    }
  };

  // Detach tab to independent window
  const handleDetachTab = async (tab: WorkspaceTab) => {
    if (window.electronAPI) {
      await window.electronAPI.detachTab({
        id: tab.id,
        title: tab.title,
        url: tab.url || '',
        projectId: tab.projectId,
      });
      handleCloseTab(tab.id);
    }
  };

  const handleCloseTab = (tabId: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(remaining[remaining.length - 1]?.id || 'home');
      }
      return remaining;
    });
  };

  const handleToggleSplitView = () => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, isSplitView: !t.isSplitView } : t))
    );
  };

  // AI Error Diagnostic Trigger
  const handleDiagnoseError = async (projectId: string, errorLogInput?: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const projectLogs = logs[projectId] || [];
    const fullLogText = errorLogInput || projectLogs.map((l) => l.text).join('\n') || runtimes[projectId]?.lastError || 'Unknown build error';

    setAiModal({
      isOpen: true,
      projectId,
      errorLog: fullLogText,
      analysis: null,
      isLoading: true,
    });

    if (window.electronAPI) {
      try {
        const analysis = await window.electronAPI.analyzeErrorWithAI(fullLogText, {
          name: project.name,
          framework: project.framework,
          command: project.command,
        });
        setAiModal((prev) => ({ ...prev, analysis, isLoading: false }));
      } catch (err) {
        console.error('Error in AI analysis:', err);
        setAiModal((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setTimeout(() => {
        setAiModal((prev) => ({
          ...prev,
          isLoading: false,
          analysis: {
            errorSummary: 'Module not found: react-router-dom',
            rootCause: 'The project depends on react-router-dom but it is not installed in node_modules.',
            solution: '1. Run the suggested install command\n2. Restart the development server.',
            suggestedCommand: 'npm install react-router-dom',
            confidence: 96,
            modelUsed: 'DeepSeek R1',
          },
        }));
      }, 1500);
    }
  };

  // Run suggested fix in terminal
  const handleRunSuggestedCommand = (command: string) => {
    if (aiModal.projectId && window.electronAPI) {
      window.electronAPI.sendTerminalInput(aiModal.projectId, `${command}\n`);
    }
  };

  // Clone repo and add to workspace
  const handleCloneAndAddRepo = async (repo: GitHubRepo) => {
    let targetPath = 'C:\\Workspace';
    if (window.electronAPI) {
      const selected = await window.electronAPI.selectFolder();
      if (!selected) return;
      targetPath = selected;

      const cloneRes = await window.electronAPI.cloneRepository(repo.cloneUrl, targetPath);
      if (cloneRes.success && cloneRes.path) {
        const detected = await window.electronAPI.detectProject(cloneRes.path);
        handleAddProject({
          name: repo.name,
          path: cloneRes.path,
          category: 'ai-agents',
          framework: detected.framework as any || 'other',
          command: detected.suggestedCommand || 'npm start',
          defaultPort: detected.detectedPort || 3000,
        });
        setActiveView('launcher');
        setActiveTabId('home');
      } else {
        alert(`Failed to clone repository: ${cloneRes.error}`);
      }
    }
  };

  // Direct GitHub Downloader handler with instant Run
  const handleProjectDownloaded = (project: ProjectConfig, shouldRunImmediately: boolean) => {
    handleAddProject({
      name: project.name,
      path: project.path,
      category: project.category,
      framework: project.framework,
      command: project.command,
      defaultPort: project.defaultPort,
    });

    if (shouldRunImmediately) {
      setTimeout(() => {
        handleRunProject(project);
      }, 300);
    }
  };

  // Run shell command on demand (from Personal AI Agent)
  const handleRunShellCommand = (command: string, cwd?: string) => {
    if (projects.length > 0 && window.electronAPI) {
      const targetProj = projects[0];
      window.electronAPI.sendTerminalInput(targetProj.id, `${command}\n`);
    }
  };

  // Drag & drop handlers with counter to prevent child-element flicker
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFileDrag = Array.from(e.dataTransfer?.types || []).includes('Files');
    if (!isFileDrag) return;
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFileDrag = Array.from(e.dataTransfer?.types || []).includes('Files');
    if (!isFileDrag) return;
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isFileDrag = Array.from(e.dataTransfer?.types || []).includes('Files');
    if (!isFileDrag) return;
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const processDroppedFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let folderPath = '';
      if (window.electronAPI?.getPathForFile) {
        try {
          folderPath = window.electronAPI.getPathForFile(file);
        } catch (_) {}
      }
      if (!folderPath && (file as any).path) {
        folderPath = (file as any).path;
      }

      if (folderPath && window.electronAPI) {
        try {
          const detected = await window.electronAPI.detectProject(folderPath);
          const folderName = detected.name || folderPath.split(/[\\/]/).filter(Boolean).pop() || 'Imported Project';

          // Auto-assign category
          let cat = activeCategoryId !== 'all' ? activeCategoryId : 'websites';
          if (
            detected.framework === 'python' || 
            detected.framework === 'fastapi' || 
            folderName.toLowerCase().includes('agent') ||
            detected.suggestedCommand.toLowerCase().includes('agent')
          ) {
            cat = 'ai-agents';
          }

          handleAddProject({
            name: folderName,
            path: folderPath,
            category: cat,
            framework: (detected.framework as any) || 'other',
            command: detected.suggestedCommand || 'npm start',
            defaultPort: detected.detectedPort || 3000,
            icon: detected.icon,
          });
        } catch (err) {
          console.error('Failed to detect/add dropped project:', err);
        }
      } else {
        // Fallback for browser / demo mode
        const folderName = file.name || 'Imported Project';
        let cat = activeCategoryId !== 'all' ? activeCategoryId : 'websites';
        handleAddProject({
          name: folderName,
          path: folderPath || `C:\\Workspace\\${folderName}`,
          category: cat,
          framework: 'react',
          command: 'npm run dev',
          defaultPort: 3000,
        });
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);

    const isFileDrag = Array.from(e.dataTransfer?.types || []).includes('Files');
    if (!isFileDrag) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processDroppedFiles(e.dataTransfer.files);
    }
  };

  // Global window drop listener to ensure drag-and-drop works seamlessly from any part of the screen
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      const isFileDrag = Array.from(e.dataTransfer?.types || []).includes('Files');
      if (!isFileDrag) return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      setIsDragOver(true);
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        dragCounter.current = 0;
        setIsDragOver(false);
      }
    };

    const handleGlobalDrop = async (e: DragEvent) => {
      dragCounter.current = 0;
      setIsDragOver(false);
      const isFileDrag = Array.from(e.dataTransfer?.types || []).includes('Files');
      if (!isFileDrag) return;
      e.preventDefault();
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        await processDroppedFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('dragleave', handleGlobalDragLeave);
    window.addEventListener('drop', handleGlobalDrop);
    return () => {
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragleave', handleGlobalDragLeave);
      window.removeEventListener('drop', handleGlobalDrop);
    };
  }, [activeCategoryId, projects]);

  // Filter projects by category and search query
  const filteredProjects = projects.filter((p) => {
    const matchesCat = activeCategoryId === 'all' || p.category === activeCategoryId;
    if (!matchesCat) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q) || p.command.toLowerCase().includes(q);
  });

  const activeCategoryObj = categories.find((c) => c.id === activeCategoryId);
  const activeCategoryName = activeCategoryObj?.name || 'All Projects';

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const activeTabProject = activeTab.projectId ? projects.find((p) => p.id === activeTab.projectId) : undefined;
  const existingPaths = new Set(projects.map((p) => p.path));

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-screen w-screen overflow-hidden select-none relative transition-colors duration-200 ${
        currentTheme === 'soft-light'
          ? 'theme-soft-light bg-white text-zinc-900 font-sans'
          : 'theme-nova-dark bg-[#080809] text-[#EDEDED] font-sans'
      }`}
      style={{
        backgroundColor: currentTheme === 'soft-light' ? '#ffffff' : '#080809',
      }}
    >
      {/* Sleek Drag & Drop Overlay (Gray // Black Software Theme) */}
      {isDragOver && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center p-8 pointer-events-none animate-in fade-in duration-200 ${
          currentTheme === 'soft-light'
            ? 'bg-white/85 backdrop-blur-2xl border-4 border-dashed border-zinc-400 text-zinc-900'
            : 'bg-black/85 backdrop-blur-2xl border-4 border-dashed border-white/25 text-white'
        }`}>
          <div className="flex flex-col items-center justify-center text-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-2xl animate-bounce ${
              currentTheme === 'soft-light'
                ? 'bg-zinc-100 border border-zinc-300 text-zinc-800'
                : 'bg-[#141417] border border-white/15 text-white'
            }`}>
              <FolderPlus className="w-10 h-10" />
            </div>
            <h2 className={`text-xl font-bold mb-2 ${currentTheme === 'soft-light' ? 'text-zinc-900' : 'text-white'}`}>
              Drop Project Folder Here
            </h2>
            <p className={`text-sm max-w-sm ${currentTheme === 'soft-light' ? 'text-zinc-600' : 'text-[#8A8F98]'}`}>
              DEEDOX will instantly inspect dependencies, detect the authentic repository icon, and configure launch commands.
            </p>
          </div>
        </div>
      )}

      {/* macOS Style TitleBar with Browser Tabs */}
      <TitleBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCloseTab={handleCloseTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleSplitView={handleToggleSplitView}
        onDetachTab={handleDetachTab}
        runtimes={runtimes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentTheme={currentTheme}
        onToggleTheme={handleToggleTheme}
        windowControlsStyle={settings.windowControlsStyle || 'macos'}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Render Sidebar only on Home / App Drawer tab */}
        {activeTab.type === 'home' && (
          <Sidebar
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            activeView={activeView}
            onSelectView={(v) => {
              setActiveView(v);
              setActiveTabId('home');
            }}
            projects={projects}
            miniApps={miniApps}
            runtimes={runtimes}
            onOpenProjectTab={(p) => openProjectBrowserTab(p.id)}
            onStopProject={handleStopProject}
            onOpenAutoScanModal={() => setIsAutoScanModalOpen(true)}
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            currentTheme={currentTheme}
            enablePcApps={settings.enablePcApps !== false}
            enableWebApps={settings.enableWebApps !== false}
          />
        )}

        {/* View Switcher based on Active Tab */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab.type === 'home' ? (
            activeView === 'pc-apps' ? (
              <PcAppsView
                pcApps={pcApps}
                onAddPcApp={handleAddPcApp}
                onAddBatchPcApps={handleAddBatchPcApps}
                onUpdatePcApp={handleUpdatePcApp}
                onDeletePcApp={handleDeletePcApp}
                onLaunchPcApp={handleLaunchPcApp}
                currentTheme={currentTheme}
              />
            ) : activeView === 'ai-agent' ? (
              <PersonalAIAgentView
                projects={projects}
                runtimes={runtimes}
                logs={logs}
                miniApps={miniApps}
                settings={settings}
                onSaveSettings={(newSettings) => {
                  const updated = { ...settings, ...newSettings };
                  setSettings(updated);
                  window.electronAPI?.saveSettings(newSettings);
                }}
                onRunProject={handleRunProject}
                onStopProject={handleStopProject}
                onRunCommand={handleRunShellCommand}
                onOpenProjectTab={(p) => openProjectBrowserTab(p.id)}
                currentTheme={currentTheme}
              />
            ) : activeView === 'trending' ? (
              <GitHubTrendingView
                onCloneAndAdd={handleCloneAndAddRepo}
                onOpenInTab={openGenericBrowserTab}
                currentTheme={currentTheme}
              />
            ) : activeView === 'news' ? (
              <TechNewsPortal
                onOpenArticleInTab={openGenericBrowserTab}
                currentTheme={currentTheme}
              />
            ) : (
              <AppDrawer
                projects={filteredProjects}
                miniApps={miniApps}
                runtimes={runtimes}
                onRunProject={handleRunProject}
                onStopProject={handleStopProject}
                onOpenProjectTab={(p) => openProjectBrowserTab(p.id)}
                onOpenTerminalTab={openTerminalTab}
                onOpenFolder={(p) => window.electronAPI?.openPathInExplorer(p)}
                onOpenVSCode={(p) => window.electronAPI?.openInVSCode(p)}
                onDeleteProject={handleDeleteProject}
                onDeleteProjectsBatch={handleDeleteProjectsBatch}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenAutoScanModal={() => setIsAutoScanModalOpen(true)}
                onOpenAddMiniAppModal={() => setIsAddMiniAppModalOpen(true)}
                onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
                onOpenMiniApp={handleOpenMiniApp}
                onDeleteMiniApp={handleDeleteMiniApp}
                onDeleteMiniAppsBatch={handleDeleteMiniAppsBatch}
                onDiagnoseError={(pId) => handleDiagnoseError(pId)}
                searchQuery={searchQuery}
                activeCategoryName={activeCategoryName}
                currentTheme={currentTheme}
                onToggleTheme={handleToggleTheme}
                enableContextMenu={settings.enableContextMenu !== false}
                enableMultiSelect={settings.enableMultiSelect !== false}
                enableWebApps={settings.enableWebApps !== false}
                onReorderProjects={handleReorderProjects}
                onReorderMiniApps={handleReorderMiniApps}
                onTogglePinProject={handleTogglePinProject}
                onTogglePinMiniApp={handleTogglePinMiniApp}
                onUpdateProjectTag={handleUpdateProjectTag}
                onUpdateMiniAppTag={handleUpdateMiniAppTag}
              />
            )
          ) : (
            /* Browser or Project Webview Tab (with persistent logins/session) */
            <BrowserTabManager
              tab={activeTab}
              project={activeTabProject}
              runtime={activeTabProject ? runtimes[activeTabProject.id] : undefined}
              logs={activeTabProject ? logs[activeTabProject.id] || [] : []}
              currentTheme={currentTheme}
              onDiagnoseAI={(errorLog) => {
                if (activeTabProject) handleDiagnoseError(activeTabProject.id, errorLog);
              }}
              onRestartProject={() => {
                if (activeTabProject) handleRestartProject(activeTabProject.id);
              }}
              onStopProject={() => {
                if (activeTabProject) handleStopProject(activeTabProject.id);
              }}
              onStartProject={() => {
                if (activeTabProject) handleRunProject(activeTabProject);
              }}
              onDetachTab={() => handleDetachTab(activeTab)}
              onToggleSplitView={handleToggleSplitView}
            />
          )}
        </main>
      </div>

      {/* Floating Pill Navigation Dock (NovaWeb & Soft Education App style) */}
      {activeTab.type === 'home' && (
        <FloatingNavBar
          activeView={activeView}
          onSelectView={(v) => {
            setActiveView(v);
            setActiveTabId('home');
          }}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          onOpenAutoScanModal={() => setIsAutoScanModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentTheme={currentTheme}
          onToggleTheme={handleToggleTheme}
          enablePcApps={settings.enablePcApps !== false}
        />
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProject={handleAddProject}
        categories={categories}
        currentTheme={currentTheme}
      />

      {/* Auto-Scan Local Drives Modal */}
      <AutoScanModal
        isOpen={isAutoScanModalOpen}
        onClose={() => setIsAutoScanModalOpen(false)}
        onImportProjects={handleBatchImportProjects}
        existingPaths={existingPaths}
        currentTheme={currentTheme}
      />

      {/* Add Web to Mini-App Modal */}
      <AddMiniAppModal
        isOpen={isAddMiniAppModalOpen}
        onClose={() => setIsAddMiniAppModalOpen(false)}
        onAddMiniApp={handleAddMiniApp}
        currentTheme={currentTheme}
      />

      {/* AI Error Diagnostic Modal */}
      {activeTabProject || projects.find((p) => p.id === aiModal.projectId) ? (
        <AIErrorDiagnosticModal
          isOpen={aiModal.isOpen}
          onClose={() => setAiModal((prev) => ({ ...prev, isOpen: false }))}
          errorLog={aiModal.errorLog}
          project={
            projects.find((p) => p.id === aiModal.projectId) ||
            activeTabProject ||
            projects[0]
          }
          analysis={aiModal.analysis}
          isLoading={aiModal.isLoading}
          onReAnalyze={() => handleDiagnoseError(aiModal.projectId, aiModal.errorLog)}
          onRunSuggestedCommand={handleRunSuggestedCommand}
          onOpenSettings={() => {
            setAiModal((prev) => ({ ...prev, isOpen: false }));
            setIsSettingsOpen(true);
          }}
        />
      ) : null}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        currentTheme={currentTheme}
        onSaveSettings={(newSettings) => {
          const updated = { ...settings, ...newSettings };
          setSettings(updated);
          try {
            localStorage.setItem('devworkspace_settings', JSON.stringify(updated));
          } catch (_) {}
          window.electronAPI?.saveSettings(newSettings);
        }}
      />

      {/* GitHub Repository Downloader Modal */}
      <GitHubDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        defaultLocation={settings.defaultCloneLocation || 'C:\\Workspace'}
        categories={categories}
        onProjectAdded={handleProjectDownloaded}
        currentTheme={currentTheme}
      />
    </div>
  );
};
export default App;
