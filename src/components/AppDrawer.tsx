import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, ExternalLink, Terminal, FolderOpen,
  Trash2, Plus, Zap, Code, LayoutGrid,
  ListFilter, Download, BookmarkPlus,
  HardDrive, Globe, Star, AlertTriangle,
  ArrowUp, ArrowDown, Copy, GitBranch,
  CheckSquare, Square as SquareIcon, MousePointer2,
  Server, Bot, Wrench, Tag, Pin, GripVertical,
  Atom, Brain, Sparkles, Cpu, CircuitBoard,
  BarChart3, TrendingUp,
  Smartphone, AppWindow, Code2,
  Cloud, Workflow, Boxes, Database, ShieldCheck,
  ShoppingBag, MessageSquare, Gamepad2,
  Film, Music, Eye, Compass, Gauge, FolderGit2,
  FileCode, Layers, Search, Activity, Loader2
} from 'lucide-react';
import type { ProjectConfig, ProjectRuntime, MiniApp } from '../types';
import appLogo from '../assets/logo.png';

interface AppDrawerProps {
  projects: ProjectConfig[];
  miniApps: MiniApp[];
  runtimes: Record<string, ProjectRuntime>;
  onRunProject: (project: ProjectConfig) => void;
  onStopProject: (projectId: string) => void;
  onOpenProjectTab: (project: ProjectConfig) => void;
  onOpenTerminalTab: (project: ProjectConfig) => void;
  onOpenFolder: (path: string) => void;
  onOpenVSCode: (path: string) => void;
  onDeleteProject: (projectId: string) => void;
  onDeleteProjectsBatch?: (projectIds: string[]) => void;
  onOpenAddModal: () => void;
  onOpenAutoScanModal: () => void;
  onOpenAddMiniAppModal: () => void;
  onOpenDownloadModal?: () => void;
  onOpenMiniApp: (app: MiniApp) => void;
  onDeleteMiniApp: (appId: string) => void;
  onDeleteMiniAppsBatch?: (appIds: string[]) => void;
  onDiagnoseError: (projectId: string) => void;
  onReorderProjects?: (newProjects: ProjectConfig[]) => void;
  onReorderMiniApps?: (newMiniApps: MiniApp[]) => void;
  onTogglePinProject?: (projectId: string) => void;
  onTogglePinMiniApp?: (appId: string) => void;
  onUpdateProjectTag?: (projectId: string, tag: string) => void;
  onUpdateMiniAppTag?: (appId: string, tag: string) => void;
  searchQuery: string;
  activeCategoryName: string;
  currentTheme?: string;
  onToggleTheme?: () => void;
  enableContextMenu?: boolean;
  enableMultiSelect?: boolean;
  enableWebApps?: boolean;
}

// ─── Per-project icon library matcher (NO LETTERS - Real Modern Icons) ──
interface ProjectIconInfo {
  gradient: string;
  IconComponent: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  label: string;
}

const getFrameworkIcon = (name: string, framework?: string, category?: string): ProjectIconInfo => {
  const darkGradient = 'from-[#18181E] via-[#0F0F13] to-[#08080A]';
  const n = (name || '').toLowerCase();
  const f = (framework || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // 1. Framework-based matches
  if (f.includes('react') || n.includes('react')) {
    return { gradient: darkGradient, IconComponent: Atom, color: '#00D8FF', label: 'React' };
  }
  if (f.includes('next') || n.includes('next')) {
    return { gradient: darkGradient, IconComponent: Layers, color: '#EDEDED', label: 'Next.js' };
  }
  if (f.includes('vite') || n.includes('vite')) {
    return { gradient: darkGradient, IconComponent: Zap, color: '#BD34FE', label: 'Vite' };
  }
  if (f.includes('vue') || n.includes('vue')) {
    return { gradient: darkGradient, IconComponent: Boxes, color: '#42B883', label: 'Vue' };
  }
  if (f.includes('angular') || n.includes('angular')) {
    return { gradient: darkGradient, IconComponent: CircuitBoard, color: '#DD0031', label: 'Angular' };
  }
  if (f.includes('node') || f.includes('express') || f.includes('nest') || n.includes('node') || n.includes('express')) {
    return { gradient: darkGradient, IconComponent: Server, color: '#68A063', label: 'Node' };
  }
  if (f.includes('python') || f.includes('fastapi') || f.includes('django') || f.includes('flask') || n.includes('fastapi') || n.includes('django') || n.includes('flask') || n.includes('python')) {
    return { gradient: darkGradient, IconComponent: FileCode, color: '#3776AB', label: 'Python' };
  }
  if (f.includes('rust') || n.includes('rust')) {
    return { gradient: darkGradient, IconComponent: Cpu, color: '#DEA584', label: 'Rust' };
  }
  if (f.includes('go') || f.includes('golang') || n.includes('golang')) {
    return { gradient: darkGradient, IconComponent: Compass, color: '#00ADD8', label: 'Go' };
  }
  if (f.includes('docker') || n.includes('docker') || n.includes('container')) {
    return { gradient: darkGradient, IconComponent: Cloud, color: '#2496ED', label: 'Docker' };
  }

  // 2. Project Name, Domain & Purpose Semantic Matches
  if (n.includes('agent') || n.includes('gpt') || n.includes('ai') || n.includes('bot') || n.includes('llm') || n.includes('copilot') || c.includes('ai')) {
    return { gradient: darkGradient, IconComponent: Bot, color: '#8B5CF6', label: 'AI Agent' };
  }
  if (n.includes('brain') || n.includes('neural') || n.includes('intel') || n.includes('deep')) {
    return { gradient: darkGradient, IconComponent: Brain, color: '#A855F7', label: 'Intelligence' };
  }
  if (n.includes('trend') || n.includes('analytics') || n.includes('stat') || n.includes('metric') || n.includes('chart') || n.includes('pulse')) {
    return { gradient: darkGradient, IconComponent: TrendingUp, color: '#10B981', label: 'Analytics' };
  }
  if (n.includes('dash') || n.includes('board') || n.includes('admin') || n.includes('portal') || n.includes('hub')) {
    return { gradient: darkGradient, IconComponent: LayoutGrid, color: '#06B6D4', label: 'Dashboard' };
  }
  if (n.includes('spatial') || n.includes('3d') || n.includes('vision') || n.includes('canvas') || n.includes('render') || n.includes('eye')) {
    return { gradient: darkGradient, IconComponent: Eye, color: '#00D8FF', label: 'Spatial' };
  }
  if (n.includes('api') || n.includes('backend') || n.includes('service') || n.includes('micro') || c.includes('backend')) {
    return { gradient: darkGradient, IconComponent: Server, color: '#3B82F6', label: 'API Server' };
  }
  if (n.includes('db') || n.includes('database') || n.includes('sql') || n.includes('mongo') || n.includes('data')) {
    return { gradient: darkGradient, IconComponent: Database, color: '#F59E0B', label: 'Database' };
  }
  if (n.includes('worker') || n.includes('task') || n.includes('queue') || n.includes('cron') || n.includes('workflow') || n.includes('flow')) {
    return { gradient: darkGradient, IconComponent: Workflow, color: '#EC4899', label: 'Workflow' };
  }
  if (n.includes('mobile') || n.includes('ios') || n.includes('android') || n.includes('flutter') || c.includes('mobile')) {
    return { gradient: darkGradient, IconComponent: Smartphone, color: '#06B6D4', label: 'Mobile' };
  }
  if (n.includes('chat') || n.includes('message') || n.includes('social') || n.includes('inbox') || n.includes('mail')) {
    return { gradient: darkGradient, IconComponent: MessageSquare, color: '#6366F1', label: 'Chat' };
  }
  if (n.includes('auth') || n.includes('secure') || n.includes('security') || n.includes('lock') || n.includes('shield') || n.includes('key')) {
    return { gradient: darkGradient, IconComponent: ShieldCheck, color: '#10B981', label: 'Security' };
  }
  if (n.includes('shop') || n.includes('store') || n.includes('commerce') || n.includes('cart') || n.includes('pay') || n.includes('billing')) {
    return { gradient: darkGradient, IconComponent: ShoppingBag, color: '#F59E0B', label: 'Commerce' };
  }
  if (n.includes('game') || n.includes('play') || n.includes('arcade')) {
    return { gradient: darkGradient, IconComponent: Gamepad2, color: '#EC4899', label: 'Game' };
  }
  if (n.includes('media') || n.includes('video') || n.includes('film') || n.includes('stream') || n.includes('player')) {
    return { gradient: darkGradient, IconComponent: Film, color: '#E11D48', label: 'Media' };
  }
  if (n.includes('music') || n.includes('audio') || n.includes('sound') || n.includes('voice')) {
    return { gradient: darkGradient, IconComponent: Music, color: '#8B5CF6', label: 'Audio' };
  }
  if (n.includes('tool') || n.includes('cli') || n.includes('util') || n.includes('helper') || n.includes('config')) {
    return { gradient: darkGradient, IconComponent: Wrench, color: '#F97316', label: 'Tool' };
  }
  if (n.includes('monitor') || n.includes('speed') || n.includes('perf') || n.includes('gauge') || n.includes('health')) {
    return { gradient: darkGradient, IconComponent: Gauge, color: '#14B8A6', label: 'Monitor' };
  }
  if (n.includes('search') || n.includes('scrape') || n.includes('crawl') || n.includes('finder')) {
    return { gradient: darkGradient, IconComponent: Search, color: '#06B6D4', label: 'Search' };
  }
  if (n.includes('web') || n.includes('site') || n.includes('app') || n.includes('client') || c.includes('frontend')) {
    return { gradient: darkGradient, IconComponent: AppWindow, color: '#5E6AD2', label: 'Web App' };
  }

  // 3. Fallback Curated Modern Tech Icons (NEVER A LETTER)
  const FALLBACKS: { IconComponent: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; label: string }[] = [
    { IconComponent: Code2, color: '#5E6AD2', label: 'Code' },
    { IconComponent: Layers, color: '#06B6D4', label: 'Stack' },
    { IconComponent: Sparkles, color: '#8B5CF6', label: 'Spark' },
    { IconComponent: Cpu, color: '#10B981', label: 'System' },
    { IconComponent: Boxes, color: '#F59E0B', label: 'Module' },
    { IconComponent: FolderGit2, color: '#EC4899', label: 'Repo' },
    { IconComponent: Activity, color: '#00D8FF', label: 'Project' },
  ];
  const charSum = n.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 42;
  const picked = FALLBACKS[charSum % FALLBACKS.length];
  return { gradient: darkGradient, ...picked };
};

// Context menu component
interface CtxMenuProps {
  x: number;
  y: number;
  itemId?: string;
  itemType?: 'project' | 'miniapp';
  itemName?: string;
  isPinned?: boolean;
  tag?: string;
  isSelected: boolean;
  selectedCount: number;
  onSelect: () => void;
  onDeselectAll: () => void;
  onTogglePin?: () => void;
  onEditTag?: () => void;
  onDelete: () => void;
  onDeleteSelected: () => void;
  onClose: () => void;
  isLight: boolean;
}

const ContextMenu: React.FC<CtxMenuProps> = ({
  x, y, itemName, isPinned, tag, isSelected, selectedCount,
  onSelect, onDeselectAll, onTogglePin, onEditTag, onDelete, onDeleteSelected, onClose, isLight,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [onClose]);

  const menuCls = `fixed z-[9999] min-w-[210px] rounded-xl border shadow-2xl py-1 text-xs ${
    isLight ? 'bg-white border-black/[0.1] text-zinc-700 shadow-xl' : 'bg-[#1A1A1E] border-white/[0.12] text-[#EDEDED]'
  }`;
  const itemCls = `w-full text-left flex items-center space-x-2.5 px-3 py-2 hover:bg-white/[0.06] ${isLight ? 'hover:bg-zinc-100' : ''} transition-colors`;
  const dangerCls = `w-full text-left flex items-center space-x-2.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors`;
  const dividerCls = `my-1 border-t ${isLight ? 'border-black/[0.08]' : 'border-white/[0.08]'}`;

  return (
    <div ref={ref} className={menuCls} style={{ left: Math.min(x, window.innerWidth - 220), top: Math.min(y, window.innerHeight - 240) }}>
      {itemName && (
        <div className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-400' : 'text-[#686870]'} truncate`}>
          {itemName}
        </div>
      )}
      {onTogglePin && (
        <button onClick={() => { onTogglePin(); onClose(); }} className={itemCls}>
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
          <span>{isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
        </button>
      )}
      {onEditTag && (
        <button onClick={() => { onEditTag(); onClose(); }} className={itemCls}>
          <Tag className="w-3.5 h-3.5 text-[#8A8F98]" />
          <span>{tag ? `Edit Custom Tag (${tag})` : 'Add Custom Tag'}</span>
        </button>
      )}
      <div className={dividerCls} />
      <button onClick={() => { onSelect(); onClose(); }} className={itemCls}>
        <CheckSquare className="w-3.5 h-3.5 text-[#5E6AD2]" />
        <span>{isSelected ? 'Deselect' : 'Select'}</span>
      </button>
      {selectedCount > 0 && (
        <button onClick={() => { onDeselectAll(); onClose(); }} className={itemCls}>
          <SquareIcon className="w-3.5 h-3.5 text-[#8A8F98]" />
          <span>Deselect All ({selectedCount})</span>
        </button>
      )}
      <div className={dividerCls} />
      <button onClick={() => { onDelete(); onClose(); }} className={dangerCls}>
        <Trash2 className="w-3.5 h-3.5" />
        <span>Remove from Workspace</span>
      </button>
      {selectedCount > 1 && (
        <button onClick={() => { onDeleteSelected(); onClose(); }} className={dangerCls}>
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Selected ({selectedCount})</span>
        </button>
      )}
    </div>
  );
};

export const AppDrawer: React.FC<AppDrawerProps> = ({
  projects, miniApps, runtimes,
  onRunProject, onStopProject, onOpenProjectTab, onOpenTerminalTab,
  onOpenFolder, onOpenVSCode, onDeleteProject, onDeleteProjectsBatch,
  onOpenAddModal, onOpenAutoScanModal, onOpenAddMiniAppModal, onOpenDownloadModal,
  onOpenMiniApp, onDeleteMiniApp, onDeleteMiniAppsBatch, onDiagnoseError,
  onReorderProjects, onReorderMiniApps,
  onTogglePinProject, onTogglePinMiniApp,
  onUpdateProjectTag, onUpdateMiniAppTag,
  searchQuery, activeCategoryName, currentTheme = 'nova-dark',
  enableContextMenu = true,
  enableMultiSelect = true,
  enableWebApps = true,
}) => {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [activeScope, setActiveScope] = useState<'all' | 'repos' | 'webapps'>('all');
  const [isStarred, setIsStarred] = useState(true);
  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Context menu state (supports both project and miniapp)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; id: string; type: 'project' | 'miniapp' } | null>(null);
  // Remove from workspace confirmation modal state
  const [removeConfirm, setRemoveConfirm] = useState<{ projectId: string; projectName: string } | null>(null);
  const [removeSelectedConfirm, setRemoveSelectedConfirm] = useState(false);

  // Drag and drop reordering state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragItemType, setDragItemType] = useState<'project' | 'miniapp' | null>(null);

  // Custom Tag Modal state
  const [tagModal, setTagModal] = useState<{
    id: string;
    type: 'project' | 'miniapp';
    name: string;
    currentTag: string;
  } | null>(null);
  const [tagInput, setTagInput] = useState('');

  const handleConfirmRemove = () => {
    if (removeConfirm) {
      onDeleteProject(removeConfirm.projectId);
      setRemoveConfirm(null);
    }
  };

  const handleConfirmRemoveSelected = () => {
    const projIds: string[] = [];
    const miniAppIds: string[] = [];

    selectedIds.forEach((id) => {
      if (projects.some((p) => p.id === id)) {
        projIds.push(id);
      } else if (miniApps.some((m) => m.id === id)) {
        miniAppIds.push(id);
      } else {
        if (id.startsWith('miniapp')) {
          miniAppIds.push(id);
        } else {
          projIds.push(id);
        }
      }
    });

    if (projIds.length > 0) {
      if (onDeleteProjectsBatch) {
        onDeleteProjectsBatch(projIds);
      } else {
        projIds.forEach((id) => onDeleteProject(id));
      }
    }

    if (miniAppIds.length > 0) {
      if (onDeleteMiniAppsBatch) {
        onDeleteMiniAppsBatch(miniAppIds);
      } else {
        miniAppIds.forEach((id) => onDeleteMiniApp(id));
      }
    }

    setSelectedIds(new Set());
    setRemoveSelectedConfirm(false);
  };

  const isLight = currentTheme === 'soft-light';
  const cats = ['All', 'Design', 'Social', 'AI Tools', 'Dev Tools', 'Websites', 'APIs', 'Utility'];

  const filteredProjects = projects.filter((p) => {
    if (activeCategoryFilter !== 'All') {
      const m =
        (activeCategoryFilter === 'AI Tools' && p.category === 'ai-agents') ||
        (activeCategoryFilter === 'Dev Tools' && (p.category === 'apis' || p.category === 'tools')) ||
        (activeCategoryFilter === 'Websites' && p.category === 'websites') ||
        (activeCategoryFilter === 'APIs' && p.category === 'apis') ||
        (activeCategoryFilter === 'Utility' && p.category === 'tools') ||
        (activeCategoryFilter === 'Design' && p.category === 'websites') ||
        (activeCategoryFilter === 'Social' && p.category === 'websites');
      if (!m) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q) || p.command.toLowerCase().includes(q);
  });

  const filteredMiniApps = enableWebApps ? miniApps.filter((app) => {
    if (activeCategoryFilter !== 'All') {
      const m =
        (activeCategoryFilter === 'Social' && app.category === 'Social') ||
        (activeCategoryFilter === 'AI Tools' && app.category === 'AI Tools') ||
        (activeCategoryFilter === 'Dev Tools' && app.category === 'Dev Tools') ||
        (activeCategoryFilter === 'Utility' && app.category === 'Utility');
      if (!m) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return app.name.toLowerCase().includes(q) || app.url.toLowerCase().includes(q);
  }) : [];

  // Pinned items sort to the very top, while preserving drag-ordered sequence within groups
  const displayProjects = [...filteredProjects].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const displayMiniApps = [...filteredMiniApps].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const totalCount = filteredProjects.length + filteredMiniApps.length;
  const runningCount = Object.values(runtimes).filter((r) => r.status === 'running').length;

  const GRID = 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-4 gap-y-6';

  const [failedProjectIconIds, setFailedProjectIconIds] = useState<Set<string>>(new Set());
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Drag and Drop Card Reordering ───
  const handleItemDragStart = (e: React.DragEvent | any, id: string, type: 'project' | 'miniapp') => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    }
    setDraggedItemId(id);
    setDragItemType(type);
  };

  const handleItemDragOver = (e: React.DragEvent, id: string, type: 'project' | 'miniapp') => {
    e.preventDefault();
    if (dragItemType !== type || draggedItemId === id) return;
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleItemDragLeave = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (dragOverItemId === id) {
      setDragOverItemId(null);
    }
  };

  const handleItemDrop = (e: React.DragEvent, targetId: string, type: 'project' | 'miniapp') => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = draggedItemId || e.dataTransfer.getData('text/plain');
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragItemType(null);

    if (!sourceId || sourceId === targetId || dragItemType !== type) return;

    if (type === 'project' && onReorderProjects) {
      const currentList = [...projects];
      const fromIdx = currentList.findIndex((p) => p.id === sourceId);
      const toIdx = currentList.findIndex((p) => p.id === targetId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = currentList.splice(fromIdx, 1);
        currentList.splice(toIdx, 0, moved);
        onReorderProjects(currentList);
      }
    } else if (type === 'miniapp' && onReorderMiniApps) {
      const currentList = [...miniApps];
      const fromIdx = currentList.findIndex((a) => a.id === sourceId);
      const toIdx = currentList.findIndex((a) => a.id === targetId);
      if (fromIdx !== -1 && toIdx !== -1) {
        const [moved] = currentList.splice(fromIdx, 1);
        currentList.splice(toIdx, 0, moved);
        onReorderMiniApps(currentList);
      }
    }
  };

  const handleItemDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDragItemType(null);
  };

  // ─── Hover + Hold to trigger multi-select ──────────────────────────────────
  const handlePointerDown = (projectId: string) => {
    if (!enableMultiSelect) return;
    holdTimerRef.current = setTimeout(() => {
      toggleSelect(projectId);
    }, 450);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // ─── Toggle select ──────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    if (!enableMultiSelect) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    setRemoveSelectedConfirm(true);
  };

  // ─── Right-click handler (supports project and miniapp) ─────────────────────
  const handleContextMenu = (e: React.MouseEvent, id: string, type: 'project' | 'miniapp' = 'project') => {
    if (!enableContextMenu) return;
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, id, type });
  };

  // ─── Format running time MM:SS ───
  const formatRunningTime = (sec: number = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ─── Double-click any project card → instantly run or open ──
  const handleCardDoubleClick = (project: ProjectConfig) => {
    const rt = runtimes[project.id];
    if (rt?.status === 'running') {
      onOpenProjectTab(project);
    } else {
      onRunProject(project);
    }
  };

  // ─── Single click on card body (if running, open preview directly) ──
  const handleCardClick = (project: ProjectConfig) => {
    const rt = runtimes[project.id];
    if (rt?.status === 'running') {
      onOpenProjectTab(project);
    }
  };

  // ─── Click on running project icon → open in browser tab with correct URL ──
  const handleIconClick = (project: ProjectConfig) => {
    const rt = runtimes[project.id];
    if (rt?.status === 'running') {
      onOpenProjectTab(project);
    } else {
      onRunProject(project);
    }
  };

  const actionBtnBase = `flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${isLight ? 'bg-white border-black/[0.08] text-zinc-700 hover:bg-zinc-50' : 'bg-[#141417] border-white/[0.07] text-[#EDEDED] hover:bg-[#1C1C20]'}`;
  const iconBtnBase = `p-1.5 rounded-lg transition-colors ${isLight ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.08]'}`;
  const scopeTabCls = (id: string) =>
    `flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
      activeScope === id
        ? isLight ? 'bg-zinc-900 text-white shadow-sm' : 'bg-[#1C1C20] text-[#EDEDED] border border-white/[0.08]'
        : 'text-[#8A8F98] hover:text-[#EDEDED]'
    }`;

  return (
    <>
    <div
      className={`flex-1 overflow-y-auto select-none transition-colors duration-200 relative ${isLight ? 'bg-white text-zinc-900' : 'bg-[#080809] text-[#EDEDED]'}`}
      onClick={() => ctxMenu && setCtxMenu(null)}
    >

      {/* CONTEXT MENU */}
      <AnimatePresence>
        {ctxMenu && enableContextMenu && (() => {
          const isProj = ctxMenu.type === 'project';
          const proj = isProj ? projects.find((p) => p.id === ctxMenu.id) : undefined;
          const miniapp = !isProj ? miniApps.find((a) => a.id === ctxMenu.id) : undefined;
          const itemName = proj?.name || miniapp?.name;
          const isPinned = Boolean(proj?.isPinned || miniapp?.isPinned);
          const tag = proj?.tag || miniapp?.tag;

          return (
            <motion.div key="ctx" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}>
              <ContextMenu
                x={ctxMenu.x} y={ctxMenu.y}
                itemId={ctxMenu.id}
                itemType={ctxMenu.type}
                itemName={itemName}
                isPinned={isPinned}
                tag={tag}
                isSelected={selectedIds.has(ctxMenu.id)}
                selectedCount={selectedIds.size}
                onSelect={() => toggleSelect(ctxMenu.id)}
                onDeselectAll={() => setSelectedIds(new Set())}
                onTogglePin={() => {
                  if (isProj) onTogglePinProject?.(ctxMenu.id);
                  else onTogglePinMiniApp?.(ctxMenu.id);
                }}
                onEditTag={() => {
                  setTagModal({
                    id: ctxMenu.id,
                    type: ctxMenu.type,
                    name: itemName || 'Item',
                    currentTag: tag || '',
                  });
                  setTagInput(tag || '');
                }}
                onDelete={() => {
                  if (isProj) {
                    setRemoveConfirm({ projectId: ctxMenu.id, projectName: itemName || ctxMenu.id });
                  } else {
                    onDeleteMiniApp(ctxMenu.id);
                  }
                }}
                onDeleteSelected={() => setRemoveSelectedConfirm(true)}
                onClose={() => setCtxMenu(null)}
                isLight={isLight}
              />
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ===== STATUS BAR ===== */}
      <div className={`flex items-center justify-between px-6 py-2 border-b text-xs ${isLight ? 'border-black/[0.06] text-zinc-500' : 'border-white/[0.06] text-[#8A8F98]'}`}>
        <div className="flex items-center space-x-2">
          <img src={appLogo} alt="logo" className="w-3.5 h-3.5 rounded-full object-contain shrink-0" />
          <span className={`font-medium ${isLight ? 'text-zinc-700' : 'text-[#EDEDED]'}`}>AI Workspace</span>
          <span className="text-[#686870]">/</span>
          <span>{activeCategoryName || 'All Projects'}</span>
          <button onClick={() => setIsStarred(!isStarred)} className="hover:text-amber-400 transition-colors ml-1">
            <Star className={`w-3 h-3 ${isStarred ? 'fill-[#F5A623] text-[#F5A623]' : 'text-[#686870]'}`} />
          </button>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          {selectedIds.size > 0 && (
            <button onClick={deleteSelected} className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors font-medium">
              <Trash2 className="w-3 h-3" />
              <span>Delete {selectedIds.size} selected</span>
            </button>
          )}
          {runningCount > 0 && (
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{runningCount} running</span>
            </span>
          )}
          <span className={`font-mono ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`}>
            {filteredProjects.length} repos{enableWebApps ? ` · ${filteredMiniApps.length} apps` : ''}
          </span>
          <div className={`flex items-center space-x-1 border-l pl-2 text-[#8A8F98] ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
            <button className="p-0.5 hover:text-white"><ArrowUp className="w-3 h-3" /></button>
            <button className="p-0.5 hover:text-white"><ArrowDown className="w-3 h-3" /></button>
            <button className="p-0.5 hover:text-white"><Copy className="w-3 h-3" /></button>
            <button className="p-0.5 hover:text-white"><GitBranch className="w-3 h-3" /></button>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 pb-28">

        {/* TITLE */}
        <div className="pb-4 flex items-center space-x-3">
          <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-[#EDEDED]'}`}>Project Launcher</h1>
          {runningCount > 0 && (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{runningCount} Active</span>
            </span>
          )}
          {selectedIds.size > 0 && enableMultiSelect && (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 text-[#8B95E5] text-[11px] font-medium">
              <MousePointer2 className="w-3 h-3" />
              <span>{selectedIds.size} selected</span>
            </span>
          )}
        </div>

        {/* SCOPE + CONTROLS */}
        <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`}>
          <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-white border-black/[0.08]' : 'bg-[#111114] border-white/[0.06]'}`}>
            <button id="scope-btn-all" onClick={() => setActiveScope('all')} className={scopeTabCls('all')}>
              <span>All Items</span><span className="text-[10px] px-1 rounded bg-white/[0.08] font-mono">{totalCount}</span>
            </button>
            <button id="scope-btn-repos" onClick={() => setActiveScope('repos')} className={scopeTabCls('repos')}>
              <HardDrive className="w-3 h-3" /><span>Repositories</span><span className="text-[10px] px-1 rounded bg-white/[0.08] font-mono">{filteredProjects.length}</span>
            </button>
            {enableWebApps && (
              <button id="scope-btn-webapps" onClick={() => setActiveScope('webapps')} className={scopeTabCls('webapps')}>
                <Globe className="w-3 h-3" /><span>Web Apps</span><span className="text-[10px] px-1 rounded bg-white/[0.08] font-mono">{filteredMiniApps.length}</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-white border-black/[0.08]' : 'bg-[#111114] border-white/[0.06]'}`}>
              <button onClick={() => setLayoutMode('grid')} title="Icon Grid"
                className={`p-1.5 px-2 rounded text-xs transition-all ${layoutMode === 'grid' ? (isLight ? 'bg-zinc-200 text-zinc-900' : 'bg-[#1C1C20] text-[#EDEDED]') : 'text-[#8A8F98] hover:text-white'}`}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setLayoutMode('list')} title="List View"
                className={`p-1.5 px-2 rounded text-xs transition-all ${layoutMode === 'list' ? (isLight ? 'bg-zinc-200 text-zinc-900' : 'bg-[#1C1C20] text-[#EDEDED]') : 'text-[#8A8F98] hover:text-white'}`}>
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>
            {onOpenDownloadModal && (
              <button onClick={onOpenDownloadModal} className={actionBtnBase}>
                <Download className="w-3 h-3 text-[#8A8F98]" /><span>Download Repo</span>
              </button>
            )}
            <button onClick={onOpenAutoScanModal} className={actionBtnBase}><HardDrive className="w-3 h-3 text-[#8A8F98]" /><span>Scan Drives</span></button>
            {enableWebApps && (
              <button onClick={onOpenAddMiniAppModal} className={actionBtnBase}><BookmarkPlus className="w-3 h-3 text-[#8A8F98]" /><span>Add Web App</span></button>
            )}
          </div>
        </div>

        {/* CATEGORY PILLS WITH RELEVANT MINIMAL ICONS */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-3">
          {cats.map((cat) => {
            const getCatPillIcon = () => {
              switch (cat.toLowerCase()) {
                case 'all': return <LayoutGrid className="w-3 h-3" />;
                case 'ai agents': case 'ai-agents': return <Bot className="w-3 h-3" />;
                case 'web': case 'websites': return <Globe className="w-3 h-3" />;
                case 'apis': return <Server className="w-3 h-3" />;
                case 'tools': case 'utility': return <Wrench className="w-3 h-3" />;
                default: return <Tag className="w-3 h-3" />;
              }
            };
            return (
              <button key={cat} onClick={() => setActiveCategoryFilter(cat)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 ${
                  activeCategoryFilter === cat
                    ? (isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-950 font-bold shadow-sm')
                    : (isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200' : 'text-[#686870] hover:text-[#EDEDED] hover:bg-white/[0.05]')
                }`}>
                {getCatPillIcon()}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* ================================================================== */}
        {/* REPOS SECTION                                                      */}
        {/* ================================================================== */}
        {(activeScope === 'all' || activeScope === 'repos') && (
          <section className="space-y-4 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-3.5 h-3.5 text-[#8A8F98]" />
                <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Repositories &amp; Local Projects</span>
                <span className={`text-[10px] font-mono px-1.5 rounded ${isLight ? 'bg-zinc-200 text-zinc-500' : 'bg-white/[0.06] text-[#8A8F98]'}`}>{filteredProjects.length}</span>
                {runningCount > 0 && (
                  <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{runningCount} ACTIVE</span>
                  </span>
                )}
              </div>
              <button onClick={onOpenAddModal} className="flex items-center space-x-1 text-xs text-[#8A8F98] hover:text-white font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /><span>Add Project</span>
              </button>
            </div>

            {/* LIST VIEW */}
            {layoutMode === 'list' ? (
              <div className="space-y-1.5">
                {displayProjects.map((project) => {
                  const runtime = runtimes[project.id];
                  const isRunning = runtime?.status === 'running';
                  const isStarting = runtime?.status === 'starting';
                  const hasError = runtime?.status === 'error';
                  const icon = getFrameworkIcon(project.name, project.framework, project.category);
                  const IconComp = icon.IconComponent;
                  const isSelected = selectedIds.has(project.id);
                  const isDragging = draggedItemId === project.id;
                  const isOver = dragOverItemId === project.id;

                  return (
                    <motion.div key={project.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      draggable={true}
                      onDragStart={(e: any) => handleItemDragStart(e, project.id, 'project')}
                      onDragOver={(e) => handleItemDragOver(e, project.id, 'project')}
                      onDragLeave={(e) => handleItemDragLeave(e, project.id)}
                      onDrop={(e) => handleItemDrop(e, project.id, 'project')}
                      onDragEnd={handleItemDragEnd}
                      onContextMenu={(e) => handleContextMenu(e, project.id, 'project')}
                      onClick={() => handleCardClick(project)}
                      onDoubleClick={() => handleCardDoubleClick(project)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all group cursor-pointer ${
                        isDragging ? 'opacity-40 scale-[0.98]' : ''
                      } ${
                        isOver ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[1.01]' : ''
                      } ${
                        isSelected
                          ? isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-white/[0.08] border-white/20'
                          : isLight ? 'bg-white border-black/[0.06] hover:bg-zinc-50' : 'bg-[#111114] border-white/[0.07] hover:bg-[#18181D] hover:border-white/[0.14]'
                      }`}>
                      {/* Grip handle + Checkbox (multi-select) */}
                      <div className="flex items-center space-x-1.5 mr-2 flex-shrink-0">
                        <GripVertical className="w-3.5 h-3.5 text-zinc-400 opacity-25 group-hover:opacity-80 cursor-grab active:cursor-grabbing transition-opacity" />
                        {enableMultiSelect && (
                          <button onClick={(e) => { e.stopPropagation(); toggleSelect(project.id); }} className={`opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''} transition-opacity`}>
                            {isSelected
                              ? <CheckSquare className="w-4 h-4 text-white" />
                              : <SquareIcon className="w-4 h-4 text-[#8A8F98]" />
                            }
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${icon.gradient} border border-white/[0.08] flex items-center justify-center text-base shadow-md flex-shrink-0 cursor-pointer hover:scale-105 transition-transform overflow-hidden relative`}
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                          onClick={(e) => { e.stopPropagation(); handleIconClick(project); }}
                          onDoubleClick={(e) => { e.stopPropagation(); handleCardDoubleClick(project); }}
                          title={isRunning ? "Click to open running preview" : "Double-click to launch (Hold & drag to reorder)"}
                        >
                          {project.icon && !failedProjectIconIds.has(project.id) ? (
                            <img
                              src={project.icon}
                              alt={project.name}
                              className="w-full h-full object-contain p-1"
                              onError={() => setFailedProjectIconIds((prev) => new Set(prev).add(project.id))}
                            />
                          ) : (
                            <IconComp className="w-4 h-4" style={{ color: icon.color }} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            <span className={`text-xs font-semibold truncate ${isLight ? 'text-zinc-800' : 'text-[#EDEDED]'}`}>{project.name}</span>
                            {project.isPinned && (
                              <span title="Pinned to Top" className="inline-flex items-center text-amber-400">
                                <Pin className="w-3 h-3 fill-current" />
                              </span>
                            )}
                            {project.tag && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                                isLight ? 'bg-zinc-100 text-zinc-700 border border-zinc-200' : 'bg-white/[0.08] text-[#EDEDED] border border-white/[0.12]'
                              }`}>
                                {project.tag}
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isLight ? 'bg-zinc-100 text-zinc-500' : 'bg-white/[0.06] text-[#8A8F98]'}`}>{project.framework}</span>
                            {isRunning && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onOpenProjectTab(project); }}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#18181B] border border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60 hover:bg-[#202025] text-[10px] font-mono shadow-sm transition-all"
                                title={runtime?.detectedUrl || `http://localhost:${project.defaultPort || 3000}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{formatRunningTime(runtime?.elapsedSeconds)}</span>
                                <span className="text-[9px] opacity-75">{runtime?.detectedUrl?.replace(/^https?:\/\//, '') || `:${project.defaultPort || 3000}`}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                              </button>
                            )}
                            {isStarting && (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#18181B] border border-amber-500/30 text-amber-400 text-[10px] font-mono animate-pulse">
                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                <span>Starting...</span>
                              </div>
                            )}
                            {hasError && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          </div>
                          <div className={`text-[10px] truncate font-mono mt-0.5 ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`}>{project.command}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {isRunning
                          ? <button onClick={() => onStopProject(project.id)} className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition-colors" title="Stop"><Square className="w-3.5 h-3.5 fill-current" /></button>
                          : <button onClick={() => onRunProject(project)} className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors" title="Run"><Play className="w-3.5 h-3.5 fill-current" /></button>
                        }
                        {isRunning && <button onClick={() => onOpenProjectTab(project)} className={iconBtnBase} title="Open Preview"><ExternalLink className="w-3.5 h-3.5" /></button>}
                        <button onClick={() => onTogglePinProject?.(project.id)} className={iconBtnBase} title={project.isPinned ? "Unpin from Top" : "Pin to Top"}>
                          <Pin className={`w-3.5 h-3.5 ${project.isPinned ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                        <button onClick={() => onOpenTerminalTab(project)} className={iconBtnBase} title="Terminal"><Terminal className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onOpenFolder(project.path)} className={iconBtnBase} title="Folder"><FolderOpen className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onOpenVSCode(project.path)} className={iconBtnBase} title="VS Code"><Code className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setRemoveConfirm({ projectId: project.id, projectName: project.name })} className="p-1.5 rounded-lg text-[#8A8F98] hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Remove from Workspace"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </motion.div>
                  );
                })}
                <button onClick={onOpenAddModal} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border border-dashed transition-all ${isLight ? 'border-black/[0.1] text-zinc-400 hover:border-zinc-400' : 'border-white/[0.08] text-[#686870] hover:border-white/20'}`}>
                  <Plus className="w-4 h-4" /><span className="text-xs">Add Local Project</span>
                </button>
              </div>
            ) : (
              /* ── ICON GRID ── MOBILE APP LAUNCHER STYLE ── */
              <div className={GRID}>
                {displayProjects.map((project) => {
                  const runtime = runtimes[project.id];
                  const isRunning = runtime?.status === 'running';
                  const isStarting = runtime?.status === 'starting';
                  const hasError = runtime?.status === 'error';
                  const icon = getFrameworkIcon(project.name, project.framework, project.category);
                  const IconComp = icon.IconComponent;
                  const isSelected = selectedIds.has(project.id);
                  const isDragging = draggedItemId === project.id;
                  const isOver = dragOverItemId === project.id;

                  return (
                    <motion.div key={project.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      draggable={true}
                      onDragStart={(e: any) => handleItemDragStart(e, project.id, 'project')}
                      onDragOver={(e) => handleItemDragOver(e, project.id, 'project')}
                      onDragLeave={(e) => handleItemDragLeave(e, project.id)}
                      onDrop={(e) => handleItemDrop(e, project.id, 'project')}
                      onDragEnd={handleItemDragEnd}
                      className={`flex flex-col items-center group cursor-pointer transition-all ${
                        isDragging ? 'opacity-40 scale-95' : ''
                      } ${
                        isOver ? 'scale-105' : ''
                      }`}
                      onClick={() => handleCardClick(project)}
                      onDoubleClick={() => handleCardDoubleClick(project)}
                      onContextMenu={(e) => handleContextMenu(e, project.id, 'project')}>

                      <div className="relative mb-2 w-full">
                        {/* ── SQUIRCLE GLASS ICON (Black theme with multi-color center icon or custom icon) ── */}
                        <div
                          className={`w-full aspect-square rounded-[22px] flex items-center justify-center text-2xl cursor-pointer transition-all duration-200 group-hover:scale-105 border overflow-hidden relative ${
                            isOver ? 'ring-4 ring-indigo-500 border-indigo-400' : ''
                          } ${
                            isLight
                              ? 'bg-white border-black/[0.08] shadow-md hover:border-black/20'
                              : `bg-gradient-to-b ${icon.gradient} border-white/[0.08] shadow-xl`
                          } ${
                            isRunning ? 'ring-2 ring-emerald-400/50 shadow-emerald-500/20' : ''
                          } ${isSelected ? 'ring-2 ring-white/60 shadow-white/20' : ''}`}
                          style={{ boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.06)' : '0 10px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)' }}
                          onClick={(e) => { e.stopPropagation(); handleIconClick(project); }}
                          onDoubleClick={(e) => { e.stopPropagation(); handleCardDoubleClick(project); }}
                          onPointerDown={() => handlePointerDown(project.id)}
                          onPointerUp={handlePointerUp}
                          onPointerLeave={handlePointerUp}
                          title={isRunning ? "Click to open running preview tab (Double-click to restart/launch)" : "Double-click to launch project (Hold & drag to reorder)"}
                        >
                          {project.icon && !failedProjectIconIds.has(project.id) ? (
                            <img
                              src={project.icon}
                              alt={project.name}
                              className="w-full h-full object-contain p-3.5"
                              onError={() => setFailedProjectIconIds((prev) => new Set(prev).add(project.id))}
                            />
                          ) : (
                            <IconComp className="w-8 h-8 select-none" style={{ color: icon.color }} />
                          )}
                        </div>

                        {/* PIN BADGE */}
                        {project.isPinned && (
                          <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-md backdrop-blur-sm" title="Pinned to Top">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}

                        {/* SELECTION CHECKMARK */}
                        {enableMultiSelect && isSelected && (
                          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-md">
                            <CheckSquare className="w-3 h-3 text-zinc-950" />
                          </div>
                        )}

                        {/* STATUS DOTS */}
                        {isRunning && !isSelected && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080809] animate-pulse" />}
                        {isStarting && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-[#080809] animate-ping" />}
                        {hasError && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-[#080809] flex items-center justify-center text-[7px] text-white font-bold">!</span>}

                        {/* HOVER OVERLAY: action buttons */}
                        <div className={`absolute inset-0 rounded-[22px] flex items-end justify-center pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isLight ? 'bg-black/20' : 'bg-black/40'}`}>
                          <div className="flex items-center space-x-0.5">
                            {isRunning
                              ? <button onClick={(e) => { e.stopPropagation(); onStopProject(project.id); }} className="w-5 h-5 rounded-full bg-rose-500/80 text-white flex items-center justify-center backdrop-blur-sm" title="Stop"><Square className="w-2 h-2 fill-current" /></button>
                              : <button onClick={(e) => { e.stopPropagation(); onRunProject(project); }} className="w-5 h-5 rounded-full bg-emerald-500/80 text-white flex items-center justify-center backdrop-blur-sm" title="Run"><Play className="w-2 h-2 fill-current" /></button>
                            }
                            {isRunning && (
                              <button onClick={(e) => { e.stopPropagation(); onOpenProjectTab(project); }} className="w-5 h-5 rounded-full bg-cyan-500/80 text-white flex items-center justify-center backdrop-blur-sm" title="Open Preview">
                                <ExternalLink className="w-2 h-2" />
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onTogglePinProject?.(project.id); }} className={`w-5 h-5 rounded-full flex items-center justify-center backdrop-blur-sm ${project.isPinned ? 'bg-amber-400 text-black' : 'bg-black/50 text-white'}`} title={project.isPinned ? "Unpin" : "Pin to Top"}>
                              <Pin className="w-2 h-2 fill-current" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onOpenTerminalTab(project); }} className="w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm" title="Terminal"><Terminal className="w-2 h-2" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onOpenFolder(project.path); }} className="w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm" title="Folder"><FolderOpen className="w-2 h-2" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onOpenVSCode(project.path); }} className="w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm" title="VS Code"><Code className="w-2 h-2" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setRemoveConfirm({ projectId: project.id, projectName: project.name }); }} className="w-5 h-5 rounded-full bg-black/50 text-rose-300 flex items-center justify-center backdrop-blur-sm" title="Remove from Workspace"><Trash2 className="w-2 h-2" /></button>
                          </div>
                        </div>
                      </div>

                      {/* COMPACT & BEAUTIFUL RUNNING TIMER OR LOADING BADGE (Gray // Black Theme) */}
                      {isRunning && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onOpenProjectTab(project); }}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#161619] border border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60 hover:bg-[#202025] transition-all text-[10px] font-mono shadow-sm mb-1 group-hover:scale-105"
                          title={runtime?.detectedUrl ? `Running: ${runtime.detectedUrl} - Click to open preview` : "Running - Click to open preview"}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{formatRunningTime(runtime?.elapsedSeconds)}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                        </button>
                      )}

                      {isStarting && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#161619] border border-amber-500/30 text-amber-400 text-[10px] font-mono shadow-sm mb-1 animate-pulse">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          <span>Starting...</span>
                        </div>
                      )}

                      <span className={`text-[11px] font-medium text-center leading-tight truncate w-full px-1 ${isLight ? 'text-zinc-700' : 'text-[#C8C8CC]'}`}>{project.name}</span>
                      {project.tag && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium truncate max-w-[85px] mt-0.5 ${
                          isLight ? 'bg-zinc-100 text-zinc-700 border border-zinc-200' : 'bg-white/[0.08] text-[#EDEDED] border border-white/[0.12]'
                        }`}>
                          {project.tag}
                        </span>
                      )}
                      <span className={`text-[9px] mt-0.5 capitalize ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`}>{icon.label}</span>
                    </motion.div>
                  );
                })}

                {/* ADD ICON */}
                <motion.div whileHover={{ y: -3 }} className="flex flex-col items-center group cursor-pointer" onClick={onOpenAddModal}>
                  <div className={`w-full aspect-square rounded-[22px] border-2 border-dashed flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${isLight ? 'border-zinc-300 hover:border-zinc-500 bg-zinc-100/50' : 'border-white/[0.12] hover:border-white/30 bg-white/[0.03]'}`}>
                    <Plus className={`w-6 h-6 ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`} />
                  </div>
                  <span className={`text-[11px] font-medium text-center mt-2.5 ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`}>Add Project</span>
                </motion.div>
              </div>
            )}
          </section>
        )}

        {/* DIVIDER */}
        {activeScope === 'all' && (
          <div className="relative py-5 flex items-center justify-center">
            <div className={`w-full border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'}`} />
            <span className={`absolute px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${isLight ? 'bg-white border-black/[0.08] text-zinc-500 shadow-sm' : 'bg-[#080809] border-white/[0.08] text-[#686870]'}`}>Web Apps &amp; Cloud Services</span>
          </div>
        )}

        {/* ================================================================== */}
        {/* WEB APPS SECTION                                                   */}
        {/* ================================================================== */}
        {enableWebApps && (activeScope === 'all' || activeScope === 'webapps') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Web Apps &amp; Cloud Services</span>
                <span className={`text-[10px] font-mono px-1.5 rounded ${isLight ? 'bg-zinc-200 text-zinc-500' : 'bg-white/[0.06] text-[#8A8F98]'}`}>{filteredMiniApps.length}</span>
              </div>
              <button onClick={onOpenAddMiniAppModal} className="flex items-center space-x-1 text-xs text-[#8A8F98] hover:text-white font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /><span>Add Web App</span>
              </button>
            </div>

            <div className={GRID}>
              {displayMiniApps.map((app) => {
                const isDragging = draggedItemId === app.id;
                const isOver = dragOverItemId === app.id;

                return (
                  <motion.div key={app.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    draggable={true}
                    onDragStart={(e: any) => handleItemDragStart(e, app.id, 'miniapp')}
                    onDragOver={(e) => handleItemDragOver(e, app.id, 'miniapp')}
                    onDragLeave={(e) => handleItemDragLeave(e, app.id)}
                    onDrop={(e) => handleItemDrop(e, app.id, 'miniapp')}
                    onDragEnd={handleItemDragEnd}
                    onContextMenu={(e) => handleContextMenu(e, app.id, 'miniapp')}
                    className={`flex flex-col items-center group cursor-pointer transition-all ${
                      isDragging ? 'opacity-40 scale-95' : ''
                    } ${
                      isOver ? 'scale-105' : ''
                    }`}
                    onClick={() => onOpenMiniApp(app)}
                  >
                    <div className="relative mb-2.5 w-full">
                      <div
                        className={`w-full aspect-square rounded-[22px] flex items-center justify-center cursor-pointer transition-all duration-200 group-hover:scale-105 border overflow-hidden ${
                          isOver ? 'ring-4 ring-indigo-500 border-indigo-400' : ''
                        } ${
                          isLight ? 'bg-white border-black/[0.08] shadow-md' : 'bg-gradient-to-b from-[#18181E] via-[#101014] to-[#08080A] border-white/[0.1] shadow-xl hover:border-white/20'
                        }`}
                        style={{ boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.08)' : '0 8px 24px rgba(0,0,0,0.4)' }}
                        title="Click to open Web App in browser view (Hold & drag to reorder)"
                      >
                        <img src={app.icon} alt={app.name} className="w-2/3 h-2/3 object-contain pointer-events-none"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(app.url)}&sz=128`; }} />
                      </div>

                      {/* PIN BADGE */}
                      {app.isPinned && (
                        <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-md backdrop-blur-sm pointer-events-none" title="Pinned to Top">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                        </div>
                      )}

                      {app.badge && <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-white text-zinc-950 border border-[#080809] pointer-events-none">{app.badge}</span>}
                      <div className="absolute inset-0 rounded-[22px] flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePinMiniApp?.(app.id);
                          }}
                          className={`pointer-events-auto w-5 h-5 rounded-full flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform shadow-md ${
                            app.isPinned ? 'bg-amber-400 text-black' : 'bg-black/50 text-white'
                          }`}
                          title={app.isPinned ? "Unpin" : "Pin to Top"}
                        >
                          <Pin className="w-2.5 h-2.5 fill-current" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMiniApp(app.id);
                          }}
                          className="pointer-events-auto w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform shadow-md"
                          title="Remove"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                    <span className={`text-[11px] font-medium text-center leading-tight truncate w-full px-1 ${isLight ? 'text-zinc-700' : 'text-[#C8C8CC]'}`}>{app.name}</span>
                    {app.tag && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold truncate max-w-[85px] mt-0.5 ${
                        isLight ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {app.tag}
                      </span>
                    )}
                    <span className={`text-[9px] mt-0.5 ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`}>{app.category}</span>
                  </motion.div>
                );
              })}
              <motion.div whileHover={{ y: -3 }} className="flex flex-col items-center group cursor-pointer" onClick={onOpenAddMiniAppModal}>
                <div className={`w-full aspect-square rounded-[22px] border-2 border-dashed flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${isLight ? 'border-zinc-300 hover:border-zinc-500 bg-zinc-100/50' : 'border-white/[0.12] hover:border-white/30 bg-white/[0.03]'}`}>
                  <Plus className={`w-6 h-6 ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`} />
                </div>
                <span className={`text-[11px] font-medium text-center mt-2.5 ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`}>Add Web App</span>
              </motion.div>
            </div>
          </section>
        )}

        {/* FLOATING MULTI-SELECT DELETE ACTION BAR */}
        <AnimatePresence>
          {selectedIds.size > 0 && enableMultiSelect && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                isLight
                  ? 'bg-white/95 border-black/10 text-zinc-800'
                  : 'bg-[#141418]/95 border-white/15 text-white'
              }`}
            >
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <CheckSquare className="w-4 h-4 text-white" />
                <span>{selectedIds.size} Selected</span>
              </div>
              <div className={`w-px h-4 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-[#8A8F98] hover:text-white transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Selected ({selectedIds.size})</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>

    {/* ── REMOVE FROM WORKSPACE CONFIRMATION MODAL (single project) ── */}
    <AnimatePresence>
      {removeConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setRemoveConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-[390px] rounded-2xl border shadow-2xl overflow-hidden ${
              isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/20' : 'bg-[#141417] border-white/[0.12] text-white shadow-black/80'
            }`}
          >
            {/* Header */}
            <div className="flex items-center space-x-3 px-5 pt-5 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isLight ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}>
                <Trash2 style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>Remove from Workspace?</h3>
                <p className={`text-[11px] mt-0.5 truncate max-w-[260px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                  "{removeConfirm.projectName}"
                </p>
              </div>
            </div>

            {/* Simple confirmation prompt */}
            <div className="px-5 pb-4 pt-1">
              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-[#8A8F98]'}`}>
                Are you sure you want to remove <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>"{removeConfirm.projectName}"</span> from your workspace?
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2.5 px-5 pb-5">
              <button
                onClick={() => setRemoveConfirm(null)}
                className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isLight 
                    ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900' 
                    : 'border-white/[0.12] text-[#8A8F98] hover:text-white hover:border-white/25 hover:bg-white/[0.04]'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span>Remove</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── REMOVE SELECTED CONFIRMATION MODAL ── */}
    <AnimatePresence>
      {removeSelectedConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setRemoveSelectedConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-[390px] rounded-2xl border shadow-2xl overflow-hidden ${
              isLight ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/20' : 'bg-[#141417] border-white/[0.12] text-white shadow-black/80'
            }`}
          >
            <div className="flex items-center space-x-3 px-5 pt-5 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isLight ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}>
                <Trash2 style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  Remove {selectedIds.size} Items?
                </h3>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                  Remove selected items from workspace
                </p>
              </div>
            </div>

            {/* Simple confirmation prompt */}
            <div className="px-5 pb-4 pt-1">
              <p className={`text-xs leading-relaxed ${isLight ? 'text-zinc-600' : 'text-[#8A8F98]'}`}>
                Are you sure you want to remove <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>{selectedIds.size}</span> selected items from your workspace?
              </p>
            </div>

            <div className="flex items-center space-x-2.5 px-5 pb-5">
              <button
                onClick={() => setRemoveSelectedConfirm(false)}
                className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                  isLight 
                    ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900' 
                    : 'border-white/[0.12] text-[#8A8F98] hover:text-white hover:border-white/25 hover:bg-white/[0.04]'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoveSelected}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span>Remove {selectedIds.size} Items</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* ── CUSTOM TAG MODAL ── */}
    <AnimatePresence>
      {tagModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setTagModal(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-[360px] rounded-2xl border p-5 shadow-2xl ${
              isLight ? 'bg-white border-black/10 text-zinc-900' : 'bg-[#17171D] border-white/[0.12] text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5 mb-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-white/[0.06] text-[#EDEDED] border-white/[0.08]'
              }`}>
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Custom Tag Name</h3>
                <p className={`text-[11px] truncate max-w-[240px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                  {tagModal.name}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. Frontend, API, Prod, WIP, Main..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (tagModal.type === 'project') onUpdateProjectTag?.(tagModal.id, tagInput.trim());
                    else onUpdateMiniAppTag?.(tagModal.id, tagInput.trim());
                    setTagModal(null);
                  }
                }}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                  isLight 
                    ? 'bg-zinc-50 border-black/10 focus:border-zinc-400 text-zinc-900 placeholder:text-zinc-400' 
                    : 'bg-white/[0.05] border-white/10 focus:border-white/30 text-white placeholder-zinc-500'
                }`}
              />

              {/* Quick Preset Tags */}
              <div className="flex flex-wrap gap-1.5">
                {['Core', 'Frontend', 'Backend', 'API', 'Mobile', 'WIP', 'Production'].map((quickTag) => (
                  <button
                    key={quickTag}
                    type="button"
                    onClick={() => setTagInput(quickTag)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-all ${
                      tagInput === quickTag
                        ? isLight ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-950 font-bold border-white'
                        : isLight
                        ? 'bg-zinc-100 hover:bg-zinc-200 border-black/5 text-zinc-600'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/5 text-[#8A8F98]'
                    }`}
                  >
                    {quickTag}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                {tagInput && (
                  <button
                    type="button"
                    onClick={() => {
                      if (tagModal.type === 'project') onUpdateProjectTag?.(tagModal.id, '');
                      else onUpdateMiniAppTag?.(tagModal.id, '');
                      setTagModal(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                  >
                    Clear Tag
                  </button>
                )}
                <div className="flex items-center space-x-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setTagModal(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium ${
                      isLight ? 'hover:bg-zinc-100 text-zinc-500' : 'hover:bg-white/[0.08] text-slate-400'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tagModal.type === 'project') onUpdateProjectTag?.(tagModal.id, tagInput.trim());
                      else onUpdateMiniAppTag?.(tagModal.id, tagInput.trim());
                      setTagModal(null);
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                      isLight
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                        : 'bg-white hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    Save Tag
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
  );
};
