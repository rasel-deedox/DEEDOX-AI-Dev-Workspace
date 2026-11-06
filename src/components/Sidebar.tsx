import React, { useState } from 'react';
import { 
  Zap, Bot, Compass, Newspaper, Plus, 
  Trash2, ExternalLink, Square, Download, Settings,
  Search, Edit3, Tag, Folder, HardDrive, Circle, ChevronDown,
  Globe, Code, Wrench, Layers, BookOpen, Cpu, Star, LayoutGrid, Monitor
} from 'lucide-react';
import type { WorkspaceCategory, ProjectConfig, ProjectRuntime, MiniApp } from '../types';
import { AgentMiniature } from './AgentMiniature';
import appLogo from '../assets/logo.png';

interface SidebarProps {
  categories: WorkspaceCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: (name: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
  activeView: 'launcher' | 'trending' | 'news' | 'ai-agent' | 'pc-apps';
  onSelectView: (view: 'launcher' | 'trending' | 'news' | 'ai-agent' | 'pc-apps') => void;
  projects: ProjectConfig[];
  miniApps: MiniApp[];
  runtimes: Record<string, ProjectRuntime>;
  onOpenProjectTab: (project: ProjectConfig) => void;
  onStopProject: (projectId: string) => void;
  onOpenAutoScanModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenSettings: () => void;
  currentTheme?: string;
  enablePcApps?: boolean;
  enableWebApps?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  activeView,
  onSelectView,
  projects,
  miniApps,
  runtimes,
  onOpenProjectTab,
  onStopProject,
  onOpenAutoScanModal,
  onOpenDownloadModal,
  onOpenSettings,
  currentTheme = 'nova-dark',
  enablePcApps = true,
  enableWebApps = true,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const isLight = currentTheme === 'soft-light';

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim(), 'Tag');
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const runningProjects = projects.filter((p) => runtimes[p.id]?.status === 'running');

  return (
    <aside className={`w-56 flex flex-col justify-between select-none h-full z-20 shrink-0 transition-colors duration-200 border-r ${
      isLight 
        ? 'bg-[#F7F7F8] border-black/[0.06] text-zinc-800' 
        : 'bg-[#0D0D0E] border-white/[0.06] text-[#EDEDED]'
    }`}>
      {/* Top Section */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* Linear Header: Workspace Switcher + Search/New Buttons */}
        <div className={`flex items-center justify-between px-3 py-2.5 border-b ${
          isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
        }`}>
          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity">
            <img 
              src={appLogo} 
              alt="logo" 
              className="w-4 h-4 rounded-full object-contain shrink-0"
            />
            <span className={`text-xs font-semibold tracking-tight ${isLight ? 'text-zinc-900' : 'text-[#EDEDED]'}`}>
              AI Workspace
            </span>
            <ChevronDown className="w-3 h-3 text-[#8A8F98]" />
          </div>

          <div className="flex items-center space-x-1">
            <button 
              onClick={onOpenSettings}
              className="p-1 rounded text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.05] transition-colors"
              title="Search & Settings"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onOpenAutoScanModal}
              className="p-1 rounded text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.05] transition-colors"
              title="Scan & Add Projects"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Primary Linear Navigation Items */}
        <div className="px-2 pt-3 pb-2 space-y-0.5">
          {/* Pulse / App Launcher */}
          <button
            onClick={() => onSelectView('launcher')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'launcher'
                ? isLight
                  ? 'bg-zinc-200/80 text-zinc-950 font-semibold'
                  : 'bg-[#1C1C1F] text-[#EDEDED] font-semibold border border-white/[0.06]'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Zap className={`w-3.5 h-3.5 ${activeView === 'launcher' ? 'text-[#F5A623]' : 'text-[#8A8F98]'}`} />
              <span>Pulse / Launcher</span>
            </div>
            {runningProjects.length > 0 ? (
              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{runningProjects.length}</span>
              </span>
            ) : (
              <span className="text-[10px] text-[#8A8F98] font-mono">{projects.length}</span>
            )}
          </button>

          {/* Personal AI Agent (With Linear Copilot Style) */}
          <button
            id="sidebar-btn-ai-agent"
            onClick={() => onSelectView('ai-agent')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'ai-agent'
                ? isLight
                  ? 'bg-zinc-200/80 text-zinc-950 font-semibold'
                  : 'bg-[#1C1C1F] text-[#EDEDED] font-semibold border border-white/[0.06]'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AgentMiniature shape="realistic-sphere" size="xs" isLight={isLight} isSpeaking={activeView === 'ai-agent'} />
              <span>Agent Copilot</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* GitHub Trending */}
          <button
            onClick={() => onSelectView('trending')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'trending'
                ? isLight
                  ? 'bg-zinc-200/80 text-zinc-950 font-semibold'
                  : 'bg-[#1C1C1F] text-[#EDEDED] font-semibold border border-white/[0.06]'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Compass className="w-3.5 h-3.5 text-[#8A8F98]" />
              <span>Trending</span>
            </div>
          </button>

          {/* Tech & AI News */}
          <button
            onClick={() => onSelectView('news')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeView === 'news'
                ? isLight
                  ? 'bg-zinc-200/80 text-zinc-950 font-semibold'
                  : 'bg-[#1C1C1F] text-[#EDEDED] font-semibold border border-white/[0.06]'
                : isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Newspaper className="w-3.5 h-3.5 text-[#8A8F98]" />
              <span>Feed & News</span>
            </div>
            <span className="text-[9px] px-1 rounded bg-white/[0.08] text-[#8A8F98] font-mono">LIVE</span>
          </button>

          {/* Installed PC Apps */}
          {enablePcApps && (
            <button
              id="sidebar-btn-pc-apps"
              onClick={() => onSelectView('pc-apps')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'pc-apps'
                  ? isLight
                    ? 'bg-zinc-200/80 text-zinc-950 font-semibold'
                    : 'bg-[#1C1C1F] text-[#EDEDED] font-semibold border border-white/[0.06]'
                  : isLight
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Monitor className={`w-3.5 h-3.5 ${activeView === 'pc-apps' ? 'text-white' : 'text-[#8A8F98]'}`} />
                <span>Installed PC Apps</span>
              </div>
              <span className={`text-[9px] px-1 rounded font-mono font-medium ${
                activeView === 'pc-apps' 
                  ? 'bg-white text-zinc-950 font-bold' 
                  : 'bg-white/[0.08] text-[#8A8F98]'
              }`}>PC</span>
            </button>
          )}
        </div>

        {/* Section: Workspace Categories (Linear "Workspace ▾") */}
        <div className="px-2 pt-3 pb-2">
          <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-medium text-[#8A8F98]">
            <span className="flex items-center space-x-1">
              <span>Workspace</span>
              <ChevronDown className="w-3 h-3" />
            </span>
            <button
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="hover:text-[#EDEDED] transition-colors p-0.5 rounded"
              title="Add Category"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Inline Add Category Form */}
          {isAddingCategory && (
            <form onSubmit={handleCreateCategory} className="mb-1.5 px-1">
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  placeholder="Category..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                  className="flex-1 px-2 py-0.5 text-xs rounded bg-[#16161A] border border-white/[0.1] text-[#EDEDED] outline-none"
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 text-[11px] bg-[#5E6AD2] text-white rounded font-medium"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          <nav className="space-y-0.5">
            {categories.map((cat) => {
              const count = cat.id === 'all'
                ? projects.length
                : projects.filter((p) => p.category === cat.id).length;
              const isSelected = activeCategoryId === cat.id && activeView === 'launcher';

              // Map category id → icon + color
              const catIconMap: Record<string, { icon: React.ReactNode; color: string }> = {
                'all':       { icon: <LayoutGrid className="w-3.5 h-3.5" />, color: '#5E6AD2' },
                'ai-agents': { icon: <Bot className="w-3.5 h-3.5" />, color: '#10B981' },
                'websites':  { icon: <Globe className="w-3.5 h-3.5" />, color: '#06B6D4' },
                'apis':      { icon: <Code className="w-3.5 h-3.5" />, color: '#F59E0B' },
                'tools':     { icon: <Wrench className="w-3.5 h-3.5" />, color: '#8B5CF6' },
              };
              const catStyle = catIconMap[cat.id] || { icon: <Tag className="w-3.5 h-3.5" />, color: '#8A8F98' };

              return (
                <div
                  key={cat.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? isLight
                        ? 'bg-zinc-200/80 text-zinc-950 font-semibold'
                        : 'bg-[#1C1C1F] text-[#EDEDED] font-semibold border border-white/[0.06]'
                      : isLight
                      ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                      : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
                  }`}
                  onClick={() => {
                    onSelectView('launcher');
                    onSelectCategory(cat.id);
                  }}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span style={{ color: isSelected ? catStyle.color : undefined }}
                      className={`flex-shrink-0 transition-colors ${isSelected ? '' : 'text-[#686870] group-hover:text-[#8A8F98]'}`}>
                      {catStyle.icon}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-[#8A8F98] font-mono">
                      {count}
                    </span>
                    {!['all', 'ai-agents', 'websites', 'apis', 'tools'].includes(cat.id) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity ml-1"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Section: Favorites / Quick Tools (Linear "Favorites ▾") */}
        <div className="px-2 pt-3 pb-2">
          <div className="px-2 pb-1 text-[11px] font-medium text-[#8A8F98] flex items-center space-x-1">
            <span>Favorites</span>
            <ChevronDown className="w-3 h-3" />
          </div>

          <div className="space-y-0.5">
            {/* Download Repo Button */}
            <button
              onClick={onOpenDownloadModal}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] transition-all"
              title="Download & clone any GitHub repository"
            >
              <div className="flex items-center space-x-2">
                <Download className="w-3.5 h-3.5 text-[#8A8F98]" />
                <span>Download Repo</span>
              </div>
              <span className="text-[9px] px-1 rounded bg-white/[0.06] text-[#8A8F98] font-mono font-semibold border border-white/[0.06]">
                CLONE
              </span>
            </button>

            {/* Auto-Scan Local Drives */}
            <button
              onClick={onOpenAutoScanModal}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center space-x-2">
                <HardDrive className="w-3.5 h-3.5 text-[#8A8F98]" />
                <span>Scan Drives</span>
              </div>
              <span className="text-[9px] px-1 rounded bg-white/[0.06] text-[#8A8F98] font-mono border border-white/[0.06]">
                C: D: E:
              </span>
            </button>
          </div>
        </div>

        {/* Active Local Servers (Linear Timeline Style) */}
        {runningProjects.length > 0 && (
          <div className="px-2 pt-2 pb-2">
            <div className="px-2 pb-1 text-[11px] font-medium text-emerald-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Running Servers ({runningProjects.length})</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {runningProjects.map((p) => {
                const rt = runtimes[p.id];
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md bg-[#141417] border border-white/[0.06] text-xs hover:border-white/10 transition-all"
                  >
                    <div
                      className="cursor-pointer truncate flex-1 mr-1.5"
                      onClick={() => onOpenProjectTab(p)}
                      title={`Jump to ${p.name}`}
                    >
                      <div className="font-medium text-[#EDEDED] truncate text-[11px]">{p.name}</div>
                      <div className="text-[10px] text-emerald-400 truncate font-mono">
                        {rt?.detectedUrl || `Port ${p.defaultPort || 'running'}`}
                      </div>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <button
                        onClick={() => onOpenProjectTab(p)}
                        className="p-1 rounded hover:bg-white/10 text-[#8A8F98] hover:text-white"
                        title="Open in Tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onStopProject(p.id)}
                        className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                        title="Stop Server"
                      >
                        <Square className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer: User / Settings profile row */}
      <div className={`p-2 border-t ${
        isLight ? 'border-black/[0.06] bg-zinc-50' : 'border-white/[0.06] bg-[#0A0A0C]'
      }`}>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-3.5 h-3.5 text-[#8A8F98]" />
            <span>Workspace Settings</span>
          </div>
          <span className="text-[10px] font-mono text-[#686870]">v2.0</span>
        </button>
      </div>
    </aside>
  );
};
