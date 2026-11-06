export type ProjectStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface ProjectConfig {
  id: string;
  name: string;
  path: string;
  category: string;
  icon?: string;
  framework?: 'react' | 'vite' | 'next' | 'vue' | 'angular' | 'python' | 'fastapi' | 'flask' | 'django' | 'node' | 'rust' | 'go' | 'docker' | 'other';
  command: string; // e.g. "npm run dev" or "python main.py"
  defaultPort?: number;
  detectedUrl?: string;
  env?: Record<string, string>;
  createdAt: number;
  lastRunAt?: number;
  isPinned?: boolean;
  tag?: string;
  stats?: {
    runCount: number;
    totalUptimeSec: number;
  };
}

export interface MiniApp {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string; // 'All' | 'Social' | 'Productivity' | 'Utility' | 'AI Tools' | 'Dev Tools'
  createdAt: number;
  badge?: string;
  notes?: string;
  isPinned?: boolean;
  tag?: string;
}

export interface DetectedScanProject {
  name: string;
  path: string;
  framework: string;
  suggestedCommand: string;
  detectedPort?: number;
  icon?: string;
  isGit: boolean;
}

export interface ProjectRuntime {
  id: string;
  status: ProjectStatus;
  startTime?: number;
  elapsedSeconds: number;
  detectedUrl?: string;
  port?: number;
  lastError?: string;
  pid?: number;
}

export interface WorkspaceCategory {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface WorkspaceTab {
  id: string; // tab id
  type: 'home' | 'project' | 'trending' | 'news' | 'browser' | 'miniapp' | 'settings' | 'ai-agent';
  title: string;
  projectId?: string;
  miniAppId?: string;
  url?: string;
  canClose: boolean;
  isSplitView?: boolean; // webview + terminal side by side
  terminalHeight?: number; // split height or width
}

export interface TerminalLog {
  id: string;
  projectId: string;
  text: string;
  type: 'stdout' | 'stderr' | 'system' | 'error';
  timestamp: number;
}

export interface AIErrorAnalysis {
  errorSummary: string;
  rootCause: string;
  solution: string;
  suggestedCommand?: string;
  confidence: number;
  modelUsed: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description: string;
  htmlUrl: string;
  cloneUrl: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  updatedAt: string;
  starsToday?: number;
}

export interface TechNewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  category: 'AI' | 'Company' | 'Launch' | 'Viral' | 'Tech' | 'Startups';
  publishedAt: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  fundingAmount?: string;
  location?: string;
  score?: number;
  commentsCount?: number;
  readTime?: string;
}

// Personal AI Agent Permissions & Configuration
export interface PersonalAIAgentPermissions {
  masterAccess: boolean; // Master ON/OFF toggle for AI access
  readProjects: boolean; // Access to inspect all added repositories and project configs
  readTerminalLogs: boolean; // Access to read live terminal stdout/stderr & process errors
  executeCommands: boolean; // Permission to trigger 1-click runs and shell fixes
  readMiniApps: boolean; // Access to web mini-apps
  readNews: boolean; // Access to tech & AI news
}

export interface PersonalAIAgentConfig {
  id?: string;
  name: string;
  role: string;
  systemPrompt?: string;
  temperature: number;
  selectedModel: string;
  permissions: PersonalAIAgentPermissions;
  avatarIcon?: string;
  badgeColor?: string;
  miniatureShape?: string; // e.g. 'signature', 'circle', 'shield', 'gear', etc.
  miniatureColor?: string;
  eyeStyle?: 'normal' | 'fast-blink' | 'no-look';
  category?: 'admin' | 'tech' | 'creative' | 'finance' | 'custom';
  description?: string;
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  agentId?: string;
  agentName?: string;
  agentRole?: string;
  miniatureShape?: string;
  miniatureColor?: string;
  suggestedAction?: {
    type: 'run_project' | 'stop_project' | 'run_command' | 'open_tab';
    projectId?: string;
    command?: string;
    label: string;
  };
}

export interface MultiAgentSession {
  id: string;
  title: string;
  participatingAgentIds: string[];
  messages: AgentChatMessage[];
  status: 'idle' | 'running' | 'paused' | 'completed';
  activeSpeakerId?: string;
  createdAt: number;
}

export interface PcAppConfig {
  id: string;
  name: string;
  path: string;
  icon?: string;
  category: 'code' | 'browser' | 'design' | 'productivity' | 'utilities' | 'games' | 'other';
  arguments?: string;
  description?: string;
  isFavorite?: boolean;
  lastLaunchedAt?: number;
  launchCount?: number;
  createdAt: number;
}

export interface AppSettings {
  openRouterApiKey: string;
  openRouterModel: string;
  useFreeModelsOnly: boolean;
  defaultCloneLocation: string;
  githubToken: string;
  terminalFontSize: number;
  glassmorphismBlur: number;
  autoOpenUrlOnDetection: boolean;
  theme: 'nova-dark' | 'soft-light' | 'dark' | 'glass-midnight' | 'glass-cyberpunk';
  aiAgentConfig?: PersonalAIAgentConfig;
  customAgents?: PersonalAIAgentConfig[];
  activeAgentId?: string;
  enableContextMenu?: boolean;   // Right-click multi-select context menu
  enableMultiSelect?: boolean;   // Multi-select delete mode
  enablePcApps?: boolean;        // Toggle PC Installed Apps Page
  enableWebApps?: boolean;       // Toggle Web Apps & Cloud Services section
  windowControlsStyle?: 'macos' | 'windows'; // macOS traffic lights vs Windows classic controls
}

export interface ElectronAPI {
  // Window controls
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;

  // File system & project detection
  selectFolder: () => Promise<string | null>;
  selectFile?: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<any>;
  selectFiles?: (options?: { title?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<Array<{ name: string; path: string; icon?: string; category?: PcAppConfig['category'] }>>;
  selectShortcutFolder?: () => Promise<{ folderPath: string; shortcuts: Array<{ name: string; path: string; icon?: string; category: PcAppConfig['category']; description?: string }> } | null>;
  scanFolderShortcuts?: (folderPath?: string) => Promise<Array<{ name: string; path: string; icon?: string; category: PcAppConfig['category']; description?: string }>>;
  getFileIcon?: (filePath: string) => Promise<string | null>;
  getBatchFileIcons?: (items: Array<string | { id?: string; path: string; name?: string }>) => Promise<Record<string, string>>;
  detectProject: (dirPath: string) => Promise<{
    name: string;
    framework: string;
    suggestedCommand: string;
    detectedPort?: number;
    icon?: string;
  }>;
  openPathInExplorer: (dirPath: string) => Promise<void>;
  openInVSCode: (dirPath: string) => Promise<void>;
  openExternal?: (url: string) => Promise<boolean>;
  getPathForFile?: (file: File) => string;

  // Auto-scan drives
  getAvailableDrives: () => Promise<string[]>;
  scanDirectoryProjects: (targetPath: string, maxDepth?: number) => Promise<DetectedScanProject[]>;

  // PC Installed Apps execution & scanner
  launchPcApp?: (appPath: string, args?: string[]) => Promise<{ success: boolean; pid?: number; error?: string }>;
  scanInstalledPcApps?: () => Promise<Array<{ name: string; path: string; icon?: string; category: PcAppConfig['category']; description?: string }>>;

  // Web to Mini-App
  fetchUrlMetadata: (url: string) => Promise<{
    title: string;
    iconUrl: string;
    domain: string;
    suggestedCategory: string;
  }>;

  // Data persistence
  getStoreData: () => Promise<{
    projects: ProjectConfig[];
    miniApps: MiniApp[];
    categories: WorkspaceCategory[];
    settings: AppSettings;
    agentMessages?: AgentChatMessage[];
    pcApps?: PcAppConfig[];
  }>;
  saveProjects: (projects: ProjectConfig[]) => Promise<boolean>;
  saveMiniApps: (miniApps: MiniApp[]) => Promise<boolean>;
  saveCategories: (categories: WorkspaceCategory[]) => Promise<boolean>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
  saveAgentMessages: (messages: AgentChatMessage[]) => Promise<boolean>;
  savePcApps?: (pcApps: PcAppConfig[]) => Promise<boolean>;

  // Project process execution
  startProject: (projectId: string, command: string, cwd: string) => Promise<{ success: boolean; pid?: number; error?: string }>;
  stopProject: (projectId: string) => Promise<{ success: boolean }>;
  restartProject: (projectId: string, command: string, cwd: string) => Promise<{ success: boolean }>;
  sendTerminalInput: (projectId: string, input: string) => void;

  // Process event listeners
  onProjectLog: (callback: (data: { projectId: string; text: string; type: 'stdout' | 'stderr' | 'system' }) => void) => () => void;
  onProjectUrlDetected: (callback: (data: { projectId: string; url: string; port?: number }) => void) => () => void;
  onProjectStatusChange: (callback: (data: { projectId: string; status: ProjectStatus; error?: string }) => void) => () => void;

  // Detached tabs & multi-window
  detachTab: (tabData: { id: string; title: string; url: string; projectId?: string }) => Promise<void>;

  // AI Error solver
  analyzeErrorWithAI: (errorLog: string, projectContext: { name: string; framework?: string; command: string }) => Promise<AIErrorAnalysis>;

  // Personal AI Agent Chat
  chatWithPersonalAgent: (
    messages: { role: string; content: string }[],
    systemContext: string,
    permissions: PersonalAIAgentPermissions,
    model?: string
  ) => Promise<{ reply: string; suggestedAction?: any }>;

  // GitHub Trending & Custom Downloader & Download Manager
  fetchGitHubTrending: (timeframe?: 'daily' | 'weekly' | 'monthly', language?: string, topic?: string, sort?: 'stars' | 'forks' | 'updated', searchQuery?: string) => Promise<GitHubRepo[]>;
  cloneRepository: (
    repoUrl: string, 
    targetPath: string, 
    branch?: string,
    installDeps?: boolean,
    downloadId?: string
  ) => Promise<{ 
    success: boolean; 
    path?: string; 
    name?: string; 
    framework?: string; 
    suggestedCommand?: string; 
    detectedPort?: number;
    icon?: string; 
    error?: string; 
  }>;
  cancelDownload: (downloadId: string) => Promise<{ success: boolean }>;
  onDownloadProgress: (callback: (data: RepoDownloadProgressEvent) => void) => () => void;

  // Tech & AI News Scraping Engine
  fetchTechNews: (forceRefresh?: boolean, category?: string, source?: string) => Promise<TechNewsArticle[]>;
  fetchArticleBody: (url: string) => Promise<string>;

  // Real-Time Multi-Language Translation
  translateText?: (text: string, targetLang: string) => Promise<string>;

  // News AI Summarization & Chat Copilot
  summarizeNewsArticle?: (article: { title: string; summary: string; content?: string }, lang?: string) => Promise<string>;
  chatWithNewsAI?: (messages: { role: string; content: string }[], newsContext: string, lang?: string) => Promise<string>;

  // Internal AI Agent Local Data Bridge
  queryLocalData: (options: { type: 'news' | 'github' | 'all'; query?: string; category?: string; limit?: number }) => Promise<any>;

  // Local Image Reader
  readLocalImage?: (filePath: string) => Promise<string | null>;

  // Store Notifications
  onStoreUpdated?: (callback: (data: any) => void) => () => void;
}

export interface RepoDownloadProgressEvent {
  downloadId: string;
  progress: number; // 0 to 100
  speed: string; // e.g. "3.45 MiB/s"
  speedMbps: string; // e.g. "27.6 Mbps"
  downloadedSize: string; // e.g. "14.2 MB"
  totalSize?: string; // e.g. "32.0 MB"
  stage: string; // e.g. "Receiving objects", "Resolving deltas", "Installing dependencies"
  rawOutput?: string;
}

export interface RepoDownloadItem {
  id: string;
  repoUrl: string;
  repoName: string;
  targetPath: string;
  branch?: string;
  category: string;
  autoInstallDeps: boolean;
  runImmediately: boolean;
  status: 'queued' | 'downloading' | 'installing' | 'completed' | 'cancelled' | 'error';
  progress: number;
  downloadSpeed: string; // e.g. "3.4 MB/s"
  speedMbps: string; // e.g. "27.2 Mbps"
  downloadedSize: string; // e.g. "15.4 MB"
  totalSize?: string;
  stage: string;
  startTime: number;
  completedTime?: number;
  error?: string;
  clonedProject?: ProjectConfig;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
