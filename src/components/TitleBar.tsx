import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Minus, Square, ExternalLink, Columns, 
  Terminal, Globe, TrendingUp, Newspaper, 
  Plus, Settings, LayoutGrid, Search, Play, Square as StopIcon,
  Sun, Moon, Sparkles, Bot
} from 'lucide-react';
import type { WorkspaceTab, ProjectRuntime } from '../types';
import appLogo from '../assets/logo.png';

interface TitleBarProps {
  tabs: WorkspaceTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  onToggleSplitView: () => void;
  onDetachTab: (tab: WorkspaceTab) => void;
  runtimes: Record<string, ProjectRuntime>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentTheme?: string;
  onToggleTheme?: () => void;
  windowControlsStyle?: 'macos' | 'windows';
}

export const TitleBar: React.FC<TitleBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onOpenAddModal,
  onOpenSettings,
  onToggleSplitView,
  onDetachTab,
  runtimes,
  searchQuery,
  onSearchChange,
  currentTheme = 'nova-dark',
  onToggleTheme,
  windowControlsStyle = 'macos',
}) => {
  const isLight = currentTheme === 'soft-light';

  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => window.electronAPI?.maximizeWindow();
  const handleClose = () => window.electronAPI?.closeWindow();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <header className={`h-12 border-b flex items-center justify-between px-3 select-none titlebar-drag z-50 shrink-0 transition-colors duration-200 ${
      isLight 
        ? 'bg-white border-black/[0.06] text-zinc-800' 
        : 'bg-[#080809] border-white/[0.06] text-[#EDEDED]'
    }`}>
      {/* Left: macOS Traffic Lights (if enabled) + Linear Brand Switcher */}
      <div className="flex items-center space-x-3 titlebar-no-drag">
        {/* macOS Traffic Lights */}
        {windowControlsStyle !== 'windows' && (
          <div className="flex items-center space-x-2 group mr-1">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center text-black/60 opacity-80 hover:opacity-100 transition-all focus:outline-none"
              title="Close Window"
            >
              <X className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={handleMinimize}
              className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center text-black/60 opacity-80 hover:opacity-100 transition-all focus:outline-none"
              title="Minimize Window"
            >
              <Minus className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center text-black/60 opacity-80 hover:opacity-100 transition-all focus:outline-none"
              title="Zoom / Maximize"
            >
              <Square className="w-1.5 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Linear Style Brand Dropdown */}
        <div className={`flex items-center space-x-2 ${windowControlsStyle === 'windows' ? 'pl-0' : 'pl-2'} pr-3 border-r ${isLight ? 'border-zinc-200' : 'border-white/[0.06]'}`}>
          <img 
            src={appLogo} 
            alt="logo" 
            className="w-5 h-5 rounded-full object-contain shadow-sm shrink-0"
          />
          <span className={`text-xs font-semibold tracking-tight ${isLight ? 'text-zinc-900' : 'text-[#EDEDED]'}`}>
            AI Dev Workspace
          </span>
          <span className="text-[10px] text-[#8A8F98]">▾</span>
        </div>
      </div>

      {/* Center: Linear Minimalist Browser Tabs */}
      <div className="flex-1 flex items-center space-x-1 overflow-x-auto px-2 max-w-3xl no-scrollbar titlebar-no-drag">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const runtime = tab.projectId ? runtimes[tab.projectId] : undefined;
          const isRunning = runtime?.status === 'running';
          const isStarting = runtime?.status === 'starting';

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center space-x-2 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all duration-150 border ${
                isActive
                  ? isLight
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm'
                    : 'bg-[#16161A] text-[#EDEDED] border-white/[0.08] shadow-sm'
                  : isLight
                  ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
                  : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04] border-transparent'
              }`}
            >
              {/* Tab Icon */}
              {tab.type === 'home' && (
                <img src={appLogo} alt="logo" className="w-2.5 h-2.5 rounded-full object-contain shrink-0" />
              )}
              {tab.type === 'trending' && <TrendingUp className="w-3.5 h-3.5 text-[#F5A623]" />}
              {tab.type === 'news' && <Newspaper className="w-3.5 h-3.5 text-[#8A8F98]" />}
              {tab.type === 'ai-agent' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
              {tab.type === 'project' && (
                <div className="relative flex items-center">
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400' : 'bg-[#8A8F98]'}`} />
                </div>
              )}
              {(tab.type === 'browser' || tab.type === 'miniapp') && <Globe className="w-3.5 h-3.5 text-cyan-400" />}

              {/* Title */}
              <span className="max-w-[130px] truncate">{tab.title}</span>

              {/* Status Indicator */}
              {isRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Running" />
              )}
              {isStarting && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] animate-pulse" title="Starting..." />
              )}

              {/* Close Button */}
              {tab.canClose && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="w-3.5 h-3.5 rounded flex items-center justify-center text-[#8A8F98] hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                  title="Close Tab"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Actions: Search, Split view, Detach, Add, Theme & Settings */}
      <div className="flex items-center space-x-1.5 titlebar-no-drag">
        {/* Quick Search */}
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#686870] pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-36 focus:w-48 transition-all duration-150 pl-8 pr-2.5 py-1 text-xs rounded-md border outline-none ${
              isLight 
                ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400' 
                : 'bg-[#121215] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
            }`}
          />
        </div>

        {/* Tab Controls (when in webview tab) */}
        {activeTab && (activeTab.type === 'project' || activeTab.type === 'browser') && (
          <div className="flex items-center space-x-1 pl-1 border-l border-white/[0.06]">
            {/* Split View Toggle */}
            <button
              onClick={onToggleSplitView}
              className={`p-1 rounded-md border transition-all ${
                activeTab.isSplitView
                  ? 'bg-white/[0.1] border-white/20 text-white'
                  : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.05] border-transparent'
              }`}
              title="Toggle Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            {/* Detach Tab */}
            <button
              onClick={() => onDetachTab(activeTab)}
              className="p-1 rounded-md text-[#8A8F98] hover:text-white hover:bg-white/[0.05] transition-all"
              title="Detach Tab into New Window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded-md transition-all ${
              isLight
                ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06]'
            }`}
            title={isLight ? 'Switch to Linear Dark' : 'Switch to Light'}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* New Project Button */}
        <button
          onClick={onOpenAddModal}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all shadow-sm ${
            isLight
              ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
              : 'bg-white text-zinc-950 hover:bg-zinc-200 font-semibold'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06] transition-all"
          title="Settings & AI Configuration"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Windows Style Window Controls */}
        {windowControlsStyle === 'windows' && (
          <div className="flex items-center ml-2 -mr-3 h-12 border-l border-white/[0.06] titlebar-no-drag">
            <button
              onClick={handleMinimize}
              className={`h-12 w-11 flex items-center justify-center transition-colors ${
                isLight 
                  ? 'text-zinc-700 hover:bg-zinc-200/80 hover:text-zinc-950' 
                  : 'text-[#8A8F98] hover:bg-white/10 hover:text-white'
              }`}
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className={`h-12 w-11 flex items-center justify-center transition-colors ${
                isLight 
                  ? 'text-zinc-700 hover:bg-zinc-200/80 hover:text-zinc-950' 
                  : 'text-[#8A8F98] hover:bg-white/10 hover:text-white'
              }`}
              title="Maximize / Restore"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className={`h-12 w-11 flex items-center justify-center transition-colors ${
                isLight 
                  ? 'text-zinc-700 hover:bg-[#E81123] hover:text-white' 
                  : 'text-[#8A8F98] hover:bg-[#E81123] hover:text-white'
              }`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
