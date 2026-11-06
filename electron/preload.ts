import { contextBridge, ipcRenderer, webUtils } from 'electron';
import type { 
  ProjectConfig, WorkspaceCategory, AppSettings, ProjectStatus, 
  AIErrorAnalysis, GitHubRepo, TechNewsArticle, MiniApp, DetectedScanProject,
  PersonalAIAgentPermissions, AgentChatMessage, RepoDownloadProgressEvent
} from '../src/types';

const electronAPI = {
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // File system & project detection
  selectFolder: () => ipcRenderer.invoke('dialog-select-folder'),
  detectProject: (dirPath: string) => ipcRenderer.invoke('detect-project', dirPath),
  openPathInExplorer: (dirPath: string) => ipcRenderer.invoke('open-in-explorer', dirPath),
  openInVSCode: (dirPath: string) => ipcRenderer.invoke('open-in-vscode', dirPath),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  getPathForFile: (file: File): string => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        return webUtils.getPathForFile(file);
      }
    } catch (_) {}
    return (file as any).path || '';
  },

  // File & Executable selection
  selectFile: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog-select-file', options),
  selectFiles: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) =>
    ipcRenderer.invoke('dialog-select-files', options),
  selectShortcutFolder: () =>
    ipcRenderer.invoke('dialog-select-shortcut-folder'),
  scanFolderShortcuts: (folderPath?: string) =>
    ipcRenderer.invoke('scan-folder-shortcuts', folderPath),

  // Auto-scan local drives for projects
  getAvailableDrives: (): Promise<string[]> => ipcRenderer.invoke('get-available-drives'),
  scanDirectoryProjects: (targetPath: string, maxDepth?: number): Promise<DetectedScanProject[]> =>
    ipcRenderer.invoke('scan-directory-projects', { targetPath, maxDepth }),

  // PC Installed Apps execution & scanner
  launchPcApp: (appPath: string, args?: string[]) =>
    ipcRenderer.invoke('launch-pc-app', { appPath, args }),
  scanInstalledPcApps: () => ipcRenderer.invoke('scan-installed-pc-apps'),
  getFileIcon: (filePath: string) => ipcRenderer.invoke('get-file-icon', filePath),
  getBatchFileIcons: (items: Array<string | { id?: string; path: string; name?: string }>) => ipcRenderer.invoke('get-batch-file-icons', items),

  // Web to Mini-App metadata fetching
  fetchUrlMetadata: (url: string) => ipcRenderer.invoke('fetch-url-metadata', url),

  // Data persistence
  getStoreData: () => ipcRenderer.invoke('get-store-data'),
  saveProjects: (projects: ProjectConfig[]) => ipcRenderer.invoke('save-projects', projects),
  saveMiniApps: (miniApps: MiniApp[]) => ipcRenderer.invoke('save-mini-apps', miniApps),
  saveCategories: (categories: WorkspaceCategory[]) => ipcRenderer.invoke('save-categories', categories),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('save-settings', settings),
  saveAgentMessages: (messages: AgentChatMessage[]) => ipcRenderer.invoke('save-agent-messages', messages),
  savePcApps: (pcApps: any[]) => ipcRenderer.invoke('save-pc-apps', pcApps),

  // Project process execution
  startProject: (projectId: string, command: string, cwd: string) =>
    ipcRenderer.invoke('start-project', { projectId, command, cwd }),
  stopProject: (projectId: string) => ipcRenderer.invoke('stop-project', projectId),
  restartProject: (projectId: string, command: string, cwd: string) =>
    ipcRenderer.invoke('restart-project', { projectId, command, cwd }),
  sendTerminalInput: (projectId: string, input: string) =>
    ipcRenderer.send('terminal-input', { projectId, input }),

  // Process event listeners
  onProjectLog: (callback: (data: { projectId: string; text: string; type: 'stdout' | 'stderr' | 'system' }) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('project-log', handler);
    return () => ipcRenderer.removeListener('project-log', handler);
  },
  onProjectUrlDetected: (callback: (data: { projectId: string; url: string; port?: number }) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('project-url-detected', handler);
    return () => ipcRenderer.removeListener('project-url-detected', handler);
  },
  onProjectStatusChange: (callback: (data: { projectId: string; status: ProjectStatus; error?: string }) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('project-status-change', handler);
    return () => ipcRenderer.removeListener('project-status-change', handler);
  },

  // Detached tabs & multi-window
  detachTab: (tabData: { id: string; title: string; url: string; projectId?: string }) =>
    ipcRenderer.invoke('detach-tab', tabData),

  // AI Error solver
  analyzeErrorWithAI: (errorLog: string, projectContext: { name: string; framework?: string; command: string }): Promise<AIErrorAnalysis> =>
    ipcRenderer.invoke('analyze-error-ai', { errorLog, projectContext }),

  // Personal AI Agent Chat
  chatWithPersonalAgent: (
    messages: { role: string; content: string }[],
    systemContext: string,
    permissions: PersonalAIAgentPermissions,
    model?: string
  ): Promise<{ reply: string; suggestedAction?: any }> =>
    ipcRenderer.invoke('chat-personal-agent', { messages, systemContext, permissions, model }),

  // GitHub Trending & Custom Downloader & Download Manager
  fetchGitHubTrending: (timeframe?: 'daily' | 'weekly' | 'monthly', language?: string, topic?: string, sort?: 'stars' | 'forks' | 'updated', searchQuery?: string): Promise<GitHubRepo[]> =>
    ipcRenderer.invoke('fetch-github-trending', { timeframe, language, topic, sort, searchQuery }),
  cloneRepository: (
    repoUrl: string, 
    targetPath: string, 
    branch?: string,
    installDeps?: boolean,
    downloadId?: string
  ): Promise<{ 
    success: boolean; 
    path?: string; 
    name?: string; 
    framework?: string; 
    suggestedCommand?: string; 
    detectedPort?: number; 
    icon?: string;
    error?: string; 
  }> =>
    ipcRenderer.invoke('clone-repo', { repoUrl, targetPath, branch, installDeps, downloadId }),
  cancelDownload: (downloadId: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('cancel-download', downloadId),
  onDownloadProgress: (callback: (data: RepoDownloadProgressEvent) => void) => {
    const handler = (_: any, data: RepoDownloadProgressEvent) => callback(data);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },

  // Tech & AI News Scraping Engine
  fetchTechNews: (forceRefresh?: boolean, category?: string, source?: string): Promise<TechNewsArticle[]> =>
    ipcRenderer.invoke('fetch-tech-news', { forceRefresh, category, source }),
  fetchArticleBody: (url: string): Promise<string> =>
    ipcRenderer.invoke('fetch-article-body', url),
  translateText: (text: string, targetLang: string): Promise<string> =>
    ipcRenderer.invoke('translate-text', { text, targetLang }),
  summarizeNewsArticle: (article: { title: string; summary: string; content?: string }, lang?: string): Promise<string> =>
    ipcRenderer.invoke('summarize-news-article', { article, lang }),
  chatWithNewsAI: (messages: { role: string; content: string }[], newsContext: string, lang?: string): Promise<string> =>
    ipcRenderer.invoke('chat-news-ai', { messages, newsContext, lang }),

  // Internal AI Agent Local Data Bridge
  queryLocalData: (options: { type: 'news' | 'github' | 'all'; query?: string; category?: string; limit?: number }): Promise<any> =>
    ipcRenderer.invoke('query-local-data', options),

  // Local Image & Project Icon Reader
  readLocalImage: (filePath: string) =>
    ipcRenderer.invoke('read-local-image', filePath),

  // Store update notifications
  onStoreUpdated: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('store-updated', handler);
    return () => ipcRenderer.removeListener('store-updated', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
