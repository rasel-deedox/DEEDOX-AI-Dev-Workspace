import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Folder, GitBranch, Terminal, Play, 
  CheckCircle2, AlertCircle, RefreshCw, Sparkles, HardDrive, 
  ExternalLink, Zap, Activity, Trash2, RotateCcw, Square, 
  Clock, Package, ListFilter, ArrowDownRight, Check
} from 'lucide-react';
import type { WorkspaceCategory, ProjectConfig, RepoDownloadItem, RepoDownloadProgressEvent } from '../types';

interface GitHubDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLocation: string;
  categories: WorkspaceCategory[];
  onProjectAdded: (project: ProjectConfig, shouldRunImmediately: boolean) => void;
  initialRepoUrl?: string;
  currentTheme?: string;
}

const STORAGE_KEY = 'devworkspace_repo_downloads';

export const GitHubDownloadModal: React.FC<GitHubDownloadModalProps> = ({
  isOpen,
  onClose,
  defaultLocation,
  categories,
  onProjectAdded,
  initialRepoUrl = '',
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';

  // Active Tab: 'clone' (Input form) | 'manager' (Download Manager list)
  const [activeTab, setActiveTab] = useState<'clone' | 'manager'>('clone');

  // Clone Form State
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [customPath, setCustomPath] = useState(defaultLocation || 'C:\\Workspace');
  const [branch, setBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoInstallDeps, setAutoInstallDeps] = useState(true);
  const [runImmediately, setRunImmediately] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Download Manager State
  const [downloads, setDownloads] = useState<RepoDownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return [
      {
        id: 'sample-dl-1',
        repoUrl: 'https://github.com/facebook/react',
        repoName: 'react',
        targetPath: 'C:\\Workspace\\react',
        category: 'websites',
        autoInstallDeps: true,
        runImmediately: true,
        status: 'completed',
        progress: 100,
        downloadSpeed: 'Complete',
        speedMbps: '38.4 Mbps',
        downloadedSize: '34.2 MB',
        totalSize: '34.2 MB',
        stage: 'Download & Setup Complete',
        startTime: Date.now() - 3600000,
        completedTime: Date.now() - 3550000,
      }
    ];
  });

  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  // Simulation timer ref for browser mode
  const simulationTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sync initialRepoUrl if changed
  useEffect(() => {
    if (initialRepoUrl) {
      setRepoUrl(initialRepoUrl);
    }
  }, [initialRepoUrl]);

  // Save downloads to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(downloads));
    } catch (_) {}
  }, [downloads]);

  // Subscribe to real Electron download progress events
  useEffect(() => {
    if (!window.electronAPI) return;

    const unsubscribe = window.electronAPI.onDownloadProgress((event: RepoDownloadProgressEvent) => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.id === event.downloadId) {
            const isFinished = event.progress >= 100;
            return {
              ...item,
              progress: event.progress,
              downloadSpeed: event.speed || item.downloadSpeed,
              speedMbps: event.speedMbps || item.speedMbps,
              downloadedSize: event.downloadedSize || item.downloadedSize,
              totalSize: event.totalSize || item.totalSize,
              stage: event.stage || item.stage,
              status: isFinished 
                ? 'completed' 
                : event.stage?.includes('Installing') 
                  ? 'installing' 
                  : 'downloading',
              completedTime: isFinished ? Date.now() : item.completedTime,
            };
          }
          return item;
        })
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  // Active downloads count
  const activeDownloadsCount = downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'installing' || d.status === 'queued'
  ).length;

  // Aggregate active download speed in Mbps
  const calculateTotalSpeedMbps = (): string => {
    const activeItems = downloads.filter((d) => d.status === 'downloading');
    if (activeItems.length === 0) return '0.0 Mbps';

    let totalMbps = 0;
    for (const item of activeItems) {
      const match = item.speedMbps.match(/([\d\.]+)/);
      if (match) {
        totalMbps += parseFloat(match[1]);
      }
    }
    return totalMbps > 0 ? `${totalMbps.toFixed(1)} Mbps` : 'Active';
  };

  const handleBrowseFolder = async () => {
    if (window.electronAPI) {
      const selected = await window.electronAPI.selectFolder();
      if (selected) {
        setCustomPath(selected);
      }
    }
  };

  // Helper to extract clean repo name
  const extractRepoName = (url: string): string => {
    const clean = url.trim().replace(/\/+$/, '');
    const parts = clean.split('/');
    const last = parts[parts.length - 1] || 'custom-repo';
    return last.replace(/\.git$/i, '');
  };

  // Start Clone & add to Download Manager
  const handleStartDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setErrorMsg('Please enter a valid GitHub repository URL or owner/repo shorthand');
      return;
    }
    if (!customPath.trim()) {
      setErrorMsg('Please select a destination folder');
      return;
    }

    setErrorMsg(null);
    const downloadId = `dl-${Date.now()}`;
    const cleanName = extractRepoName(repoUrl);
    const targetFolder = `${customPath.replace(/[\\/]+$/, '')}\\${cleanName}`;

    const newDownload: RepoDownloadItem = {
      id: downloadId,
      repoUrl: repoUrl.trim(),
      repoName: cleanName,
      targetPath: targetFolder,
      branch: branch.trim() || undefined,
      category: selectedCategory === 'all' ? 'websites' : selectedCategory,
      autoInstallDeps,
      runImmediately,
      status: 'downloading',
      progress: 5,
      downloadSpeed: 'Calculating...',
      speedMbps: '24.5 Mbps',
      downloadedSize: '0.5 MB',
      totalSize: 'Calculating...',
      stage: 'Connecting to GitHub repository...',
      startTime: Date.now(),
    };

    // Add to list and switch to Download Manager tab immediately
    setDownloads((prev) => [newDownload, ...prev]);
    setActiveTab('manager');

    // Electron Execution
    if (window.electronAPI) {
      try {
        const result = await window.electronAPI.cloneRepository(
          repoUrl.trim(),
          customPath.trim(),
          branch.trim() || undefined,
          autoInstallDeps,
          downloadId
        );

        if (!result.success || !result.path) {
          setDownloads((prev) =>
            prev.map((d) =>
              d.id === downloadId
                ? {
                    ...d,
                    status: 'error',
                    error: result.error || 'Clone operation failed',
                    stage: 'Download failed',
                  }
                : d
            )
          );
          return;
        }

        const project: ProjectConfig = {
          id: `proj-${Date.now()}`,
          name: result.name || cleanName,
          path: result.path,
          category: selectedCategory === 'all' ? 'websites' : selectedCategory,
          framework: (result.framework as any) || 'other',
          command: result.suggestedCommand || 'npm run dev',
          defaultPort: result.detectedPort || 3000,
          icon: result.icon,
          createdAt: Date.now(),
        };

        setDownloads((prev) =>
          prev.map((d) =>
            d.id === downloadId
              ? {
                  ...d,
                  status: 'completed',
                  progress: 100,
                  downloadSpeed: 'Complete',
                  speedMbps: 'Finished',
                  stage: 'Configured & Ready to Run',
                  clonedProject: project,
                  completedTime: Date.now(),
                }
              : d
          )
        );

        onProjectAdded(project, runImmediately);
      } catch (err: any) {
        setDownloads((prev) =>
          prev.map((d) =>
            d.id === downloadId
              ? {
                  ...d,
                  status: 'error',
                  error: err.message || 'Unknown network error',
                  stage: 'Failed',
                }
              : d
          )
        );
      }
      return;
    }

    // Realistic Browser Preview Simulation (0% -> 100% with live Mbps, MB counters, and stages)
    let currentPct = 5;
    let currentTransferredMb = 0.5;
    const estTotalMb = (Math.random() * 25 + 15).toFixed(1);

    const stages = [
      { at: 10, name: 'Counting remote objects...', speed: 28.5 },
      { at: 20, name: 'Compressing objects...', speed: 34.2 },
      { at: 40, name: 'Receiving objects (chunks 240/800)...', speed: 45.8 },
      { at: 65, name: 'Receiving objects (chunks 620/800)...', speed: 52.4 },
      { at: 85, name: 'Resolving deltas (100%)...', speed: 38.1 },
      { at: 92, name: 'Extracting and checking out files...', speed: 22.0 },
      { at: 97, name: 'Running auto npm install...', speed: 18.5 },
    ];

    const timer = setInterval(() => {
      currentPct += Math.floor(Math.random() * 8) + 6;
      currentTransferredMb = Math.min(
        parseFloat(estTotalMb),
        parseFloat((currentTransferredMb + (Math.random() * 3.5 + 1.2)).toFixed(1))
      );

      // Current stage lookup
      const currentStageObj = stages.find((s) => currentPct <= s.at) || stages[stages.length - 1];
      const liveSpeedMbps = (currentStageObj.speed + (Math.random() * 8 - 4)).toFixed(1);
      const liveSpeedMBs = (parseFloat(liveSpeedMbps) / 8).toFixed(2);

      if (currentPct >= 100) {
        clearInterval(timer);
        simulationTimers.current.delete(downloadId);

        const simulatedProject: ProjectConfig = {
          id: `sim-proj-${Date.now()}`,
          name: cleanName,
          path: targetFolder,
          category: selectedCategory === 'all' ? 'websites' : selectedCategory,
          framework: 'react',
          command: 'npm run dev',
          defaultPort: 5173,
          createdAt: Date.now(),
        };

        setDownloads((prev) =>
          prev.map((d) =>
            d.id === downloadId
              ? {
                  ...d,
                  status: 'completed',
                  progress: 100,
                  downloadSpeed: 'Complete',
                  speedMbps: 'Finished',
                  downloadedSize: `${estTotalMb} MB`,
                  totalSize: `${estTotalMb} MB`,
                  stage: 'Download & Configuration Complete!',
                  clonedProject: simulatedProject,
                  completedTime: Date.now(),
                }
              : d
          )
        );

        onProjectAdded(simulatedProject, runImmediately);
      } else {
        setDownloads((prev) =>
          prev.map((d) =>
            d.id === downloadId
              ? {
                  ...d,
                  progress: Math.min(currentPct, 99),
                  downloadSpeed: `${liveSpeedMBs} MB/s`,
                  speedMbps: `${liveSpeedMbps} Mbps`,
                  downloadedSize: `${currentTransferredMb} MB`,
                  totalSize: `${estTotalMb} MB`,
                  stage: currentStageObj.name,
                  status: currentPct > 90 ? 'installing' : 'downloading',
                }
              : d
          )
        );
      }
    }, 450);

    simulationTimers.current.set(downloadId, timer);
  };

  // Cancel Download Task
  const handleCancelDownload = async (downloadId: string) => {
    // If running in browser simulation
    const timer = simulationTimers.current.get(downloadId);
    if (timer) {
      clearInterval(timer);
      simulationTimers.current.delete(downloadId);
    }

    // If running in Electron
    if (window.electronAPI) {
      await window.electronAPI.cancelDownload(downloadId);
    }

    setDownloads((prev) =>
      prev.map((d) =>
        d.id === downloadId
          ? {
              ...d,
              status: 'cancelled',
              downloadSpeed: '0 MB/s',
              speedMbps: '0 Mbps',
              stage: 'Cancelled by user',
            }
          : d
      )
    );
  };

  // Retry Download Task
  const handleRetryDownload = (item: RepoDownloadItem) => {
    setRepoUrl(item.repoUrl);
    setCustomPath(item.targetPath.substring(0, item.targetPath.lastIndexOf('\\')));
    setBranch(item.branch || '');
    setSelectedCategory(item.category);
    setAutoInstallDeps(item.autoInstallDeps);
    setRunImmediately(item.runImmediately);

    // Remove old attempt and open clone tab
    handleRemoveDownload(item.id);
    setActiveTab('clone');
  };

  // Remove download from history
  const handleRemoveDownload = (downloadId: string) => {
    const timer = simulationTimers.current.get(downloadId);
    if (timer) {
      clearInterval(timer);
      simulationTimers.current.delete(downloadId);
    }
    setDownloads((prev) => prev.filter((d) => d.id !== downloadId));
  };

  // Clear all finished or cancelled downloads
  const handleClearCompleted = () => {
    setDownloads((prev) =>
      prev.filter((d) => d.status === 'downloading' || d.status === 'installing' || d.status === 'queued')
    );
  };

  // Filtered downloads
  const filteredDownloads = downloads.filter((d) => {
    if (filter === 'active') {
      return d.status === 'downloading' || d.status === 'installing' || d.status === 'queued';
    }
    if (filter === 'completed') {
      return d.status === 'completed';
    }
    if (filter === 'failed') {
      return d.status === 'error' || d.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 ${
      isLight ? 'bg-black/35 backdrop-blur-sm' : 'bg-black/80 backdrop-blur-md'
    }`}>
      <div className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl border relative max-h-[92vh] flex flex-col transition-all ${
        isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-2xl' : 'bg-[#0E0E11] border-white/[0.12] text-[#EDEDED] shadow-2xl shadow-black/80'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${
          isLight ? 'border-zinc-200' : 'border-white/10'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${
              isLight 
                ? 'bg-zinc-100 border-zinc-200 text-zinc-800' 
                : 'bg-white/[0.06] border-white/10 text-white'
            }`}>
              <Download className={`w-5 h-5 ${isLight ? 'text-zinc-800' : 'text-white'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`text-base font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Repository Download Manager</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-white/[0.06] text-zinc-300 border-white/10'
                }`}>
                  v2.0
                </span>
                {activeDownloadsCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.1] text-white font-bold border border-white/20 flex items-center space-x-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>{activeDownloadsCount} Active</span>
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>
                Direct git clone with real-time Mbps speed, percentage progress, and automated workspace launch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isLight ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation: [📥 Clone & Download] vs [⚡ Download Manager (N Active)] */}
        <div className={`flex items-center justify-between mt-4 pb-2 border-b shrink-0 ${
          isLight ? 'border-zinc-200' : 'border-white/5'
        }`}>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('clone')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                activeTab === 'clone'
                  ? isLight
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm font-bold'
                    : 'bg-white text-zinc-950 border-white shadow-sm font-bold'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border-zinc-200'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Clone New Repo</span>
            </button>

            <button
              onClick={() => setActiveTab('manager')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all border ${
                activeTab === 'manager'
                  ? isLight
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm font-bold'
                    : 'bg-white text-zinc-950 border-white shadow-sm font-bold'
                  : isLight
                  ? 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border-zinc-200'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Download Manager</span>
              {downloads.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'manager' ? 'bg-black/20 text-zinc-950' : 'bg-white/10 text-white'
                }`}>
                  {downloads.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'manager' && (
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] flex items-center space-x-1 ${isLight ? 'text-zinc-600' : 'text-slate-400'}`}>
                <Zap className="w-3 h-3 text-white" />
                <span className="text-white font-mono font-bold">{calculateTotalSpeedMbps()}</span>
              </span>
              <button
                onClick={handleClearCompleted}
                title="Clear completed & cancelled downloads"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isLight 
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                Clear History
              </button>
            </div>
          )}
        </div>

        {/* Tab Content 1: Clone New Repo Form */}
        {activeTab === 'clone' && (
          <form onSubmit={handleStartDownload} className="mt-4 space-y-4 overflow-y-auto pr-1">
            {/* Repository URL */}
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                GitHub Repository URL or <code className="text-white">owner/repo</code>
              </label>
              <div className="relative">
                <GitBranch className="w-4 h-4 text-[#8A8F98] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="https://github.com/facebook/react or vercel/next.js"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  autoFocus
                  required
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl font-mono outline-none border transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                      : 'bg-[#141417] border-white/10 text-slate-200 focus:border-white/30'
                  }`}
                />
              </div>
              <p className={`text-[10px] mt-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                Enter any full HTTPS URL, SSH, or shorthand format (e.g. <code className={isLight ? 'text-zinc-700 font-semibold' : 'text-zinc-300'}>ollama/ollama</code>).
              </p>
            </div>

            {/* Destination Directory (Customizable Location) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-semibold flex items-center space-x-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  <HardDrive className="w-3.5 h-3.5 text-[#8A8F98]" />
                  <span>Download Destination Folder (Any Drive C:, D:, E:)</span>
                </label>
                <span className="text-[10px] text-zinc-400 font-semibold">Customizable</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Folder className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    required
                    placeholder="e.g. C:\Workspace or D:\Projects"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl font-mono outline-none border transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white'
                        : 'bg-[#141417] border-white/10 text-slate-200 focus:border-white/30'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleBrowseFolder}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
                    isLight
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
                  }`}
                >
                  Browse...
                </button>
              </div>
            </div>

            {/* Optional Branch & Workspace Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Branch (Optional)
                </label>
                <input
                  type="text"
                  placeholder="main / master (default)"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl font-mono outline-none border ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white'
                      : 'bg-[#141417] border-white/10 text-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                  Workspace Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl outline-none border ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      : 'bg-[#141417] border-white/10 text-slate-200'
                  }`}
                >
                  <option value="all">Default (Websites / Apps)</option>
                  {categories.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Execution Options */}
            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#141417] border-white/10'
            }`}>
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={runImmediately}
                  onChange={(e) => setRunImmediately(e.target.checked)}
                  className="w-4 h-4 rounded text-white bg-zinc-800 accent-white cursor-pointer"
                />
                <div>
                  <span className={`text-xs font-semibold flex items-center space-x-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    <Play className="w-3 h-3 text-white fill-current" />
                    <span>Run Project Immediately After Download</span>
                  </span>
                  <p className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Spawns dev server immediately and opens in-app browser tab upon completion
                  </p>
                </div>
              </label>

              <label className={`flex items-center space-x-2.5 cursor-pointer pt-1 border-t ${
                isLight ? 'border-zinc-200' : 'border-white/5'
              }`}>
                <input
                  type="checkbox"
                  checked={autoInstallDeps}
                  onChange={(e) => setAutoInstallDeps(e.target.checked)}
                  className="w-4 h-4 rounded text-white bg-zinc-800 accent-white cursor-pointer"
                />
                <div>
                  <span className={`text-xs font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Auto-Install Dependencies</span>
                  <p className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Runs <code className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>npm install</code> or <code className={isLight ? 'text-zinc-700' : 'text-zinc-300'}>pip install</code> in background
                  </p>
                </div>
              </label>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="break-all">{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex items-center justify-between pt-3 border-t ${
              isLight ? 'border-zinc-200' : 'border-white/10'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab('manager')}
                className="text-xs text-zinc-300 hover:text-white font-semibold flex items-center space-x-1"
              >
                <span>View Download Manager</span>
                <ArrowDownRight className="w-3 h-3" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                    isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!repoUrl.trim()}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isLight
                      ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                      : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Start Download</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab Content 2: Download Manager Page */}
        {activeTab === 'manager' && (
          <div className="mt-3 flex-1 flex flex-col overflow-hidden">
            {/* Filter Chips Bar */}
            <div className={`flex items-center justify-between pb-3 shrink-0 border-b ${
              isLight ? 'border-zinc-200' : 'border-white/5'
            }`}>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filter === 'all'
                      ? isLight ? 'bg-zinc-900 text-white font-bold shadow-sm' : 'bg-white/15 text-white shadow-sm'
                      : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  All ({downloads.length})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filter === 'active'
                      ? isLight ? 'bg-zinc-900 text-white font-bold' : 'bg-white text-zinc-950 font-bold shadow-sm'
                      : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Active ({activeDownloadsCount})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filter === 'completed'
                      ? isLight ? 'bg-zinc-900 text-white font-bold' : 'bg-white/[0.15] text-white font-bold'
                      : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Completed ({downloads.filter((d) => d.status === 'completed').length})
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filter === 'failed'
                      ? isLight ? 'bg-rose-100 text-rose-900 border border-rose-300 font-bold' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  Failed ({downloads.filter((d) => d.status === 'error' || d.status === 'cancelled').length})
                </button>
              </div>

              <button
                onClick={() => setActiveTab('clone')}
                className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center space-x-1 transition-all ${
                  isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
                }`}
              >
                <span>+ New Clone</span>
              </button>
            </div>

            {/* Downloads List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-3">
              {filteredDownloads.length === 0 ? (
                <div className={`h-48 rounded-2xl border flex flex-col items-center justify-center text-center p-6 space-y-2 ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-white/[0.02] border-white/5'
                }`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    isLight ? 'bg-zinc-200 text-zinc-500' : 'bg-white/5 text-slate-400'
                  }`}>
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <p className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-slate-300'}`}>No downloads found in this filter</p>
                  <p className={`text-[11px] max-w-xs ${isLight ? 'text-zinc-500' : 'text-slate-500'}`}>
                    Start a new git clone to monitor download speed in Mbps, progress percentage, and automatic setup.
                  </p>
                  <button
                    onClick={() => setActiveTab('clone')}
                    className={`mt-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    Start New Download
                  </button>
                </div>
              ) : (
                filteredDownloads.map((item) => {
                  const isDownloading = item.status === 'downloading' || item.status === 'installing';
                  const isCompleted = item.status === 'completed';
                  const isError = item.status === 'error';
                  const isCancelled = item.status === 'cancelled';

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDownloading
                          ? isLight
                            ? 'bg-zinc-100 border-zinc-300 shadow-sm text-zinc-900'
                            : 'bg-white/[0.06] border-white/20 shadow-sm text-white'
                          : isCompleted
                          ? isLight
                            ? 'bg-zinc-50 border-zinc-200 shadow-sm text-zinc-900'
                            : 'bg-[#141417] border-white/10'
                          : isLight
                          ? 'bg-zinc-50 border-zinc-200 text-zinc-800'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Card Header: Name, Status Badge, Timestamp */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold text-sm tracking-wide ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                              {item.repoName}
                            </span>
                            {/* Status Badges */}
                            {item.status === 'downloading' && (
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.1] text-white border border-white/20 text-[10px] font-bold flex items-center space-x-1 animate-pulse">
                                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                                <span>Downloading</span>
                              </span>
                            )}
                            {item.status === 'installing' && (
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.1] text-white border border-white/20 text-[10px] font-bold flex items-center space-x-1">
                                <Package className="w-2.5 h-2.5 animate-bounce" />
                                <span>Installing Deps</span>
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.1] text-white border border-white/20 text-[10px] font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Ready to Run</span>
                              </span>
                            )}
                            {isCancelled && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                isLight ? 'bg-zinc-200 text-zinc-600 border-zinc-300' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                              }`}>
                                Cancelled
                              </span>
                            )}
                            {isError && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center space-x-1">
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>Failed</span>
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] font-mono break-all ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>{item.repoUrl}</p>
                        </div>

                        {/* Top Speed & Metric Pill */}
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Zap className={`w-3.5 h-3.5 ${isDownloading ? 'text-white animate-pulse' : 'text-slate-400'}`} />
                            <span className={`text-xs font-mono font-bold ${
                              isDownloading ? 'text-white' : isCompleted ? 'text-white' : isLight ? 'text-zinc-600' : 'text-slate-400'
                            }`}>
                              {item.speedMbps || '0.0 Mbps'}
                            </span>
                          </div>
                          {item.downloadSpeed && item.downloadSpeed !== 'Complete' && item.downloadSpeed !== '0 MB/s' && (
                            <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>
                              ({item.downloadSpeed})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar & Details */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-medium truncate max-w-[280px] ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>
                            {item.stage || 'In progress...'}
                          </span>
                          <span className={`font-mono font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                            {item.progress}%
                          </span>
                        </div>

                        {/* Animated Visual Bar */}
                        <div className={`w-full h-2 rounded-full overflow-hidden relative border ${
                          isLight ? 'bg-zinc-200 border-zinc-300' : 'bg-black/50 border-white/10'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 relative ${
                              isCompleted
                                ? 'bg-white'
                                : isError
                                ? 'bg-rose-500'
                                : isCancelled
                                ? 'bg-slate-600'
                                : 'bg-white animate-pulse'
                            }`}
                            style={{ width: `${Math.max(item.progress, 2)}%` }}
                          />
                        </div>

                        {/* Bottom Stats (Downloaded Size, Target Directory, Time) */}
                        <div className={`flex justify-between items-center text-[10px] pt-0.5 ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>
                          <span className="font-mono">
                            {item.downloadedSize ? `Transferred: ${item.downloadedSize}` : ''}
                            {item.totalSize ? ` of ~${item.totalSize}` : ''}
                          </span>
                          <span className={`truncate max-w-[240px] font-mono ${isLight ? 'text-zinc-500' : 'text-slate-500'}`}>
                            {item.targetPath}
                          </span>
                        </div>
                      </div>

                      {/* Error Banner */}
                      {item.error && (
                        <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] flex items-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="break-all">{item.error}</span>
                        </div>
                      )}

                      {/* Action Controls Bar */}
                      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                        isLight ? 'border-zinc-200' : 'border-white/5'
                      }`}>
                        <div className="flex items-center space-x-1.5">
                          {/* Run Project (if completed) */}
                          {isCompleted && (
                            <button
                              onClick={() => {
                                if (item.clonedProject) {
                                  onProjectAdded(item.clonedProject, true);
                                } else {
                                  // Re-create config
                                  const proj: ProjectConfig = {
                                    id: `proj-${Date.now()}`,
                                    name: item.repoName,
                                    path: item.targetPath,
                                    category: item.category,
                                    command: 'npm run dev',
                                    framework: 'react',
                                    defaultPort: 5173,
                                    createdAt: Date.now(),
                                  };
                                  onProjectAdded(proj, true);
                                }
                                onClose();
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all ${
                                isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Run Project</span>
                            </button>
                          )}

                          {/* Open in Explorer */}
                          <button
                            onClick={() => {
                              window.electronAPI?.openPathInExplorer(item.targetPath);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1 transition-all ${
                              isLight 
                                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200' 
                                : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white'
                            }`}
                          >
                            <Folder className="w-3 h-3 text-slate-400" />
                            <span>Open Folder</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {/* Cancel button if active */}
                          {isDownloading && (
                            <button
                              onClick={() => handleCancelDownload(item.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-medium flex items-center space-x-1 transition-all"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* Retry button if failed or cancelled */}
                          {(isError || isCancelled) && (
                            <button
                              onClick={() => handleRetryDownload(item)}
                              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 text-xs font-medium flex items-center space-x-1 transition-all"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          )}

                          {/* Delete from list */}
                          <button
                            onClick={() => handleRemoveDownload(item.id)}
                            title="Remove from history"
                            className={`p-1.5 rounded-xl text-slate-400 hover:text-rose-400 transition-all ${
                              isLight ? 'hover:bg-zinc-100' : 'hover:bg-white/5'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Summary Bar */}
            <div className={`pt-3 border-t flex items-center justify-between text-xs shrink-0 mt-3 ${
              isLight ? 'border-zinc-200 text-zinc-600' : 'border-white/10 text-slate-400'
            }`}>
              <div className="flex items-center space-x-3">
                <span>Total: <strong className={isLight ? 'text-zinc-900 font-bold' : 'text-white'}>{downloads.length}</strong></span>
                <span>Active: <strong className="text-white font-bold">{activeDownloadsCount}</strong></span>
                <span>Completed: <strong className="text-white font-bold">{downloads.filter((d) => d.status === 'completed').length}</strong></span>
              </div>
              <button
                onClick={onClose}
                className={`px-4 py-1.5 rounded-xl font-medium transition-all ${
                  isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200' : 'bg-white/10 hover:bg-white/15 text-slate-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
