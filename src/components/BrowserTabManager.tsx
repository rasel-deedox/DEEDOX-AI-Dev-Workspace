import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, RotateCw, ExternalLink, 
  Copy, Check, Columns, Terminal, Globe, ShieldCheck, 
  Star, GitFork, BookOpen, AlertCircle, Code2, 
  FileText, Sparkles, Download
} from 'lucide-react';
import { IntegratedTerminal } from './IntegratedTerminal';
import type { WorkspaceTab, ProjectConfig, ProjectRuntime, TerminalLog } from '../types';

interface BrowserTabManagerProps {
  tab: WorkspaceTab;
  project?: ProjectConfig;
  runtime?: ProjectRuntime;
  logs: TerminalLog[];
  onDiagnoseAI: (errorLog: string) => void;
  onRestartProject: () => void;
  onStopProject: () => void;
  onStartProject: () => void;
  onDetachTab: () => void;
  onToggleSplitView: () => void;
  currentTheme?: string;
}

interface GitHubRepoInfo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  defaultBranch: string;
}

export const BrowserTabManager: React.FC<BrowserTabManagerProps> = ({
  tab,
  project,
  runtime,
  logs,
  onDiagnoseAI,
  onRestartProject,
  onStopProject,
  onStartProject,
  onDetachTab,
  onToggleSplitView,
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';
  const [currentUrl, setCurrentUrl] = useState(tab.url || runtime?.detectedUrl || 'http://localhost:3000');
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [copied, setCopied] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(!tab.isSplitView);
  const webviewRef = useRef<any>(null);

  // GitHub in-app view states
  const isGitHub = currentUrl.includes('github.com');
  const ghMatch = currentUrl.match(/github\.com\/([^\/]+)\/([^\/?#]+)/i);
  const isRepo = Boolean(ghMatch && ghMatch[1] && ghMatch[2] && !['settings', 'notifications', 'explore', 'trending', 'pulls', 'issues'].includes(ghMatch[1]));
  const owner = isRepo && ghMatch ? ghMatch[1] : null;
  const repo = isRepo && ghMatch ? ghMatch[2].replace(/\.git$/i, '') : null;

  // In browser preview, default GitHub repos to rich in-app README view so user never sees "giscus.app refused to connect"
  const [viewMode, setViewMode] = useState<'webview' | 'readme'>(
    isRepo && !window.electronAPI ? 'readme' : 'webview'
  );
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);

  // Keep active URL in sync when tab or runtime detected URL changes
  useEffect(() => {
    const nextUrl = tab.url || runtime?.detectedUrl || (project?.defaultPort ? `http://localhost:${project.defaultPort}` : 'http://localhost:3000');
    if (nextUrl) {
      setCurrentUrl(nextUrl);
      setInputUrl(nextUrl);
      if (webviewRef.current && typeof webviewRef.current.loadURL === 'function') {
        try {
          webviewRef.current.loadURL(nextUrl);
        } catch (_) {}
      }
    }
  }, [tab.id, tab.url, runtime?.detectedUrl, project?.defaultPort]);

  useEffect(() => {
    if (isRepo && owner && repo) {
      loadGitHubDetails(owner, repo);
    }
  }, [owner, repo, isRepo]);

  const loadGitHubDetails = async (o: string, r: string) => {
    setIsLoadingRepo(true);
    try {
      // 1. Fetch repo metadata
      try {
        const infoRes = await fetch(`https://api.github.com/repos/${o}/${r}`);
        if (infoRes.ok) {
          const data = await infoRes.json();
          setRepoInfo({
            name: data.name,
            fullName: data.full_name,
            description: data.description || 'No description provided.',
            stars: data.stargazers_count || 0,
            forks: data.forks_count || 0,
            language: data.language || 'Code',
            defaultBranch: data.default_branch || 'main',
          });
        }
      } catch (_) {}

      // 2. Fetch README content
      const branches = ['HEAD', 'main', 'master'];
      let content: string | null = null;
      for (const branch of branches) {
        try {
          const res = await fetch(`https://raw.githubusercontent.com/${o}/${r}/${branch}/README.md`);
          if (res.ok) {
            content = await res.text();
            break;
          }
        } catch (_) {}
      }

      setReadmeContent(content || 'No README.md found in default branch.');
    } catch (e) {
      console.warn('Failed to load GitHub details:', e);
    } finally {
      setIsLoadingRepo(false);
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let url = inputUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    setCurrentUrl(url);
    if (webviewRef.current) {
      webviewRef.current.src = url;
    }
  };

  const handleReload = () => {
    if (viewMode === 'readme' && owner && repo) {
      loadGitHubDetails(owner, repo);
    } else if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  const handleBack = () => {
    if (webviewRef.current && webviewRef.current.canGoBack()) {
      webviewRef.current.goBack();
    }
  };

  const handleForward = () => {
    if (webviewRef.current && webviewRef.current.canGoForward()) {
      webviewRef.current.goForward();
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyClone = () => {
    const cloneUrl = `git clone https://github.com/${owner}/${repo}.git`;
    navigator.clipboard.writeText(cloneUrl);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleOpenExternal = () => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(currentUrl);
    } else {
      window.open(currentUrl, '_blank');
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors duration-200 ${
      isLight ? 'bg-[#F8F8FA] text-zinc-900' : 'bg-[#080809] text-[#EDEDED]'
    }`}>
      {/* In-App Browser Navigation Bar */}
      <div className={`h-10 px-3 border-b flex items-center justify-between space-x-2 shrink-0 transition-colors ${
        isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#0E0E11] border-white/[0.08] text-[#EDEDED]'
      }`}>
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleBack}
            className={`p-1 rounded-lg transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06]'
            }`}
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleForward}
            className={`p-1 rounded-lg transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06]'
            }`}
            title="Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReload}
            className={`p-1 rounded-lg transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06]'
            }`}
            title="Reload Page"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleNavigate} className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className={`w-full pl-8 pr-16 py-1 text-xs rounded-xl font-mono text-center focus:text-left outline-none border transition-all ${
                isLight
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-900 focus:bg-white focus:border-zinc-300'
                  : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] focus:border-white/20'
              }`}
            />
            <div className="absolute right-1.5 flex items-center space-x-1">
              <button
                type="button"
                onClick={handleCopyUrl}
                className={`p-1 rounded transition-colors ${
                  isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-[#8A8F98] hover:text-white'
                }`}
                title="Copy URL"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={handleOpenExternal}
                className={`p-1 rounded transition-colors ${
                  isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-[#8A8F98] hover:text-white'
                }`}
                title="Open in Chrome / Default Browser"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </form>

        {/* View Controls: Mode Toggle (for GitHub), Split View, Terminal Toggle, Detach Window */}
        <div className="flex items-center space-x-1.5">
          {/* Mode Switcher for GitHub Repos */}
          {isRepo && (
            <div className={`flex items-center rounded-lg p-0.5 text-[11px] border ${
              isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#141417] border-white/[0.08]'
            }`}>
              <button
                onClick={() => setViewMode('readme')}
                className={`px-2 py-0.5 rounded font-medium transition-all flex items-center space-x-1 ${
                  viewMode === 'readme'
                    ? isLight
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-[#8A8F98] hover:text-[#EDEDED]'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>README</span>
              </button>
              <button
                onClick={() => setViewMode('webview')}
                className={`px-2 py-0.5 rounded font-medium transition-all flex items-center space-x-1 ${
                  viewMode === 'webview'
                    ? isLight
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-900'
                    : 'text-[#8A8F98] hover:text-[#EDEDED]'
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Webview</span>
              </button>
            </div>
          )}

          {/* Toggle Split Screen */}
          <button
            onClick={onToggleSplitView}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              tab.isSplitView
                ? isLight
                  ? 'bg-zinc-200 text-zinc-900 border-zinc-300 font-semibold'
                  : 'bg-white/[0.12] text-white border-white/20 font-semibold'
                : isLight
                ? 'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-zinc-200'
                : 'bg-transparent text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] border-white/[0.06]'
            }`}
            title="Side-by-side or stacked split view"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          {/* Toggle Terminal Drawer */}
          <button
            onClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              !isTerminalCollapsed
                ? isLight
                  ? 'bg-zinc-200 text-zinc-900 border-zinc-300 font-semibold'
                  : 'bg-white/[0.12] text-white border-white/20 font-semibold'
                : isLight
                ? 'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-zinc-200'
                : 'bg-transparent text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] border-white/[0.06]'
            }`}
            title="Toggle Integrated Terminal"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          {/* Detach Tab */}
          <button
            onClick={onDetachTab}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border-zinc-200' : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] border-white/[0.06]'
            }`}
            title="Detach Tab into New Window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Restriction Notice Banner for Browser Mode */}
      {!window.electronAPI && viewMode === 'webview' && (isGitHub || currentUrl.includes('verge') || currentUrl.includes('wired')) && (
        <div className={`border-b px-3 py-1.5 flex items-center justify-between text-[11px] ${
          isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              If this site blocks in-app iframe (showing <code className="bg-black/20 px-1 rounded font-mono">refused to connect</code>), click <strong>Open External</strong> or use the <strong>README</strong> view. (Electron desktop app bypasses these headers automatically).
            </span>
          </div>
          <button
            onClick={handleOpenExternal}
            className={`px-2.5 py-0.5 rounded-lg border font-semibold transition-all shrink-0 ml-2 ${
              isLight ? 'bg-white hover:bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/30'
            }`}
          >
            Open in Browser
          </button>
        </div>
      )}

      {/* Main Tab Content: In-App Browser + Integrated Terminal */}
      <div className={`flex-1 flex ${tab.isSplitView ? 'flex-row' : 'flex-col'} overflow-hidden relative`}>
        {/* Main Display: README Mode OR Webview */}
        {viewMode === 'readme' && isRepo ? (
          <div className={`flex-1 h-full w-full overflow-y-auto p-6 transition-colors ${
            isLight ? 'bg-[#F8F8FA] text-zinc-900' : 'bg-[#080809] text-[#EDEDED]'
          }`}>
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Repository Header Card */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#121215] border-white/[0.08] shadow-md'
              }`}>
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-white/[0.06] text-[#EDEDED] border-white/[0.08]'
                    }`}>
                      GitHub Repository
                    </span>
                    {repoInfo?.language && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        isLight ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-white/[0.04] text-[#8A8F98] border-white/[0.06]'
                      }`}>
                        {repoInfo.language}
                      </span>
                    )}
                  </div>
                  <h1 className={`text-xl font-bold tracking-tight flex items-center space-x-2 ${
                    isLight ? 'text-zinc-900' : 'text-[#EDEDED]'
                  }`}>
                    <span>{owner} / {repo}</span>
                  </h1>
                  <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    {repoInfo?.description || 'Authentic Git source repository loaded inside DevWorkspace.'}
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {repoInfo && (
                    <div className={`flex items-center space-x-3 text-xs px-3 py-1.5 rounded-xl border mr-1 ${
                      isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-black/40 border-white/5 text-[#8A8F98]'
                    }`}>
                      <span className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-[#F5A623] fill-[#F5A623]" />
                        <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{repoInfo.stars.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <GitFork className="w-3.5 h-3.5 text-[#8A8F98]" />
                        <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{repoInfo.forks.toLocaleString()}</span>
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleCopyClone}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                      isLight
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : 'bg-white hover:bg-zinc-200 text-zinc-950 font-semibold'
                    }`}
                  >
                    {copiedClone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedClone ? 'Copied Clone Command!' : 'Copy Clone URL'}</span>
                  </button>

                  <button
                    onClick={handleOpenExternal}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isLight
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                        : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#EDEDED] border-white/[0.08]'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open on GitHub</span>
                  </button>
                </div>
              </div>

              {/* README Content Container */}
              <div className={`p-6 rounded-2xl border transition-all ${
                isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-[#0E0E11] border-white/[0.08] shadow-md'
              }`}>
                <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
                  isLight ? 'border-zinc-200' : 'border-white/[0.08]'
                }`}>
                  <span className={`text-xs font-semibold flex items-center space-x-2 ${
                    isLight ? 'text-zinc-800' : 'text-[#EDEDED]'
                  }`}>
                    <FileText className={`w-4 h-4 ${isLight ? 'text-zinc-700' : 'text-white'}`} />
                    <span>README.md</span>
                  </span>
                  <span className={`text-[11px] font-mono ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Branch: {repoInfo?.defaultBranch || 'main'}
                  </span>
                </div>

                {isLoadingRepo ? (
                  <div className={`py-16 text-center text-xs flex flex-col items-center justify-center space-y-2 ${
                    isLight ? 'text-zinc-500' : 'text-[#8A8F98]'
                  }`}>
                    <RotateCw className={`w-5 h-5 animate-spin ${isLight ? 'text-zinc-700' : 'text-white'}`} />
                    <span>Loading repository documentation and README...</span>
                  </div>
                ) : (
                  <div className={`prose max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans select-text overflow-x-auto ${
                    isLight ? 'prose-zinc text-zinc-800' : 'prose-invert text-[#EDEDED]'
                  }`}>
                    {readmeContent}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Webview / Iframe Panel */
          <div className="flex-1 h-full w-full bg-white relative overflow-hidden">
            {/* Electron <webview> tag with persistent session and stripped headers for saved logins & zero connection errors */}
            {window.electronAPI ? (
              <webview
                key={tab.id}
                ref={webviewRef}
                src={currentUrl}
                // @ts-ignore
                partition="persist:devworkspace_webapps"
                className="w-full h-full border-none"
                // @ts-ignore
                allowpopups="true"
                // @ts-ignore
                useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                // @ts-ignore
                webpreferences="allowRunningInsecureContent=yes, nativeWindowOpen=yes"
              />
            ) : (
              // Iframe fallback for testing or non-Electron browser environment
              <iframe
                key={tab.id}
                ref={webviewRef}
                src={currentUrl}
                className="w-full h-full border-none bg-slate-900"
                title="In-App Browser"
              />
            )}
          </div>
        )}

        {/* Integrated Terminal Panel (Split view or bottom drawer) */}
        {project && (!isTerminalCollapsed || tab.isSplitView) && (
          <div
            className={`${
              tab.isSplitView
                ? 'w-[45%] h-full border-l border-white/10'
                : 'h-[40%] w-full border-t border-white/10'
            } transition-all duration-200 relative`}
          >
            <IntegratedTerminal
              projectId={project.id}
              project={project}
              runtime={runtime}
              logs={logs}
              onDiagnoseAI={onDiagnoseAI}
              onRestart={onRestartProject}
              onStop={onStopProject}
              onStart={onStartProject}
            />
          </div>
        )}
      </div>
    </div>
  );
};
