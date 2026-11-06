import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AppWindow, Search, Plus, Play, Folder, Star, 
  Trash2, Edit3, Sparkles, RefreshCw, Check, X, 
  ExternalLink, HardDrive, Terminal, Laptop, 
  LayoutGrid, List, Layers, ShieldCheck, Zap,
  Globe, Briefcase, Palette, Wrench, Gamepad2,
  CheckSquare, Square, Filter, ChevronRight, FileCode, Monitor,
  FolderSearch
} from 'lucide-react';
import type { PcAppConfig } from '../types';

interface PcAppsViewProps {
  pcApps: PcAppConfig[];
  onAddPcApp: (app: Omit<PcAppConfig, 'id' | 'createdAt'>) => void;
  onAddBatchPcApps?: (apps: Array<Omit<PcAppConfig, 'id' | 'createdAt'>>) => void;
  onUpdatePcApp: (app: PcAppConfig) => void;
  onDeletePcApp: (id: string) => void;
  onLaunchPcApp: (app: PcAppConfig) => void;
  currentTheme?: string;
}

const CATEGORY_TABS: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'all', label: 'All Installed Apps', icon: Layers },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'code', label: 'IDEs & Dev Tools', icon: Terminal },
  { id: 'browser', label: 'Browsers', icon: Globe },
  { id: 'productivity', label: 'Productivity', icon: Briefcase },
  { id: 'design', label: 'Design & Media', icon: Palette },
  { id: 'utilities', label: 'Utilities', icon: Wrench },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'other', label: 'Other', icon: Folder },
];

// Helper to detect generic Windows blank shortcut document icon (1006 bytes or arrow watermark)
export function isGenericShortcutIcon(icon?: string): boolean {
  if (!icon || typeof icon !== 'string') return false;
  if (icon.includes('yYzWsTQRjGn81u') || icon.includes('ACgAAAAoCAYAAACM/rhtAAACp0lEQVRYhe2YzWsTQRjGn81u2mAas4')) return true;
  if (icon.startsWith('data:image/png;base64,') && icon.length < 1100 && (icon.includes('ACgAAAAoCA') || icon.includes('AAYAAAAgCA'))) {
    if (icon.includes('AIB0f1/e') || icon.includes('QY/ms8EQ9dpRnJ')) return true;
  }
  return false;
}

// Curated authentic brand shortcut icons for popular software
const BRAND_ICON_MAP: Record<string, string> = {
  vscode: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  'visual studio code': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  code: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  cursor: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
  chrome: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg',
  'google chrome': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg',
  firefox: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firefox/firefox-original.svg',
  'mozilla firefox': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firefox/firefox-original.svg',
  brave: 'https://cdn.simpleicons.org/brave/FB542B',
  edge: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
  'microsoft edge': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg',
  git: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  'git bash': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
  terminal: 'https://cdn.simpleicons.org/windowsterminal/4D4D4D',
  'windows terminal': 'https://cdn.simpleicons.org/windowsterminal/4D4D4D',
  wt: 'https://cdn.simpleicons.org/windowsterminal/4D4D4D',
  powershell: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/powershell/powershell-original.svg',
  discord: 'https://cdn.simpleicons.org/discord/5865F2',
  figma: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
  steam: 'https://cdn.simpleicons.org/steam/white',
  postman: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
  slack: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg',
  spotify: 'https://cdn.simpleicons.org/spotify/1DB954',
  blender: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/blender/blender-original.svg',
  docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  'docker desktop': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
  intellij: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/intellij/intellij-original.svg',
  pycharm: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pycharm/pycharm-original.svg',
  android: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg',
  'android studio': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/androidstudio/androidstudio-original.svg',
  sublime: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sublimetext/sublimetext-original.svg',
  python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  notepad: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Notepad_Win11.png',
  'notepad++': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Notepad%2B%2B_Logo.png',
  vlc: 'https://images.videolan.org/images/favicon.ico',
  notion: 'https://cdn.simpleicons.org/notion/white',
  obsidian: 'https://cdn.simpleicons.org/obsidian/7C3AED',
  calculator: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Windows_Calculator_icon.png',
  capcut: 'https://cdn.simpleicons.org/bytedance/white',
  zoom: 'https://cdn.simpleicons.org/zoom/2D8CFF',
  'zoom workplace': 'https://cdn.simpleicons.org/zoom/2D8CFF',
  filmora: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Filmora_Logo.png',
  'wondershare filmora': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Filmora_Logo.png',
  'wondershare filmora 13': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Filmora_Logo.png',
  obs: 'https://cdn.simpleicons.org/obsstudio/white',
  'obs studio': 'https://cdn.simpleicons.org/obsstudio/white',
  opera: 'https://cdn.simpleicons.org/opera/FF1B2D',
  'opera gx': 'https://cdn.simpleicons.org/operagx/FF1B2D',
  'opera gx browser': 'https://cdn.simpleicons.org/operagx/FF1B2D',
  chatgpt: 'https://cdn.simpleicons.org/openai/white',
  copilot: 'https://cdn.simpleicons.org/microsoftcopilot/white',
  claude: 'https://cdn.simpleicons.org/anthropic/white',
  deepseek: 'https://cdn.simpleicons.org/deepseek/white',
  gemini: 'https://cdn.simpleicons.org/googlegemini/white',
  filezilla: 'https://cdn.simpleicons.org/filezilla/white',
  forza: 'https://cdn.simpleicons.org/xbox/107C41',
  ea: 'https://cdn.simpleicons.org/ea/white',
  bluestacks: 'https://cdn.simpleicons.org/bluestacks/white',
  'after effects': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/aftereffects/aftereffects-original.svg',
  photoshop: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-original.svg',
  premiere: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/premierepro/premierepro-original.svg',
  illustrator: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/illustrator/illustrator-original.svg',
  'cinema 4d': 'https://cdn.simpleicons.org/cinema4d/white',
  whatsapp: 'https://cdn.simpleicons.org/whatsapp/25D366',
  telegram: 'https://cdn.simpleicons.org/telegram/26A5E4',
  'call of duty': 'https://cdn.simpleicons.org/activision/white',
  winlaunch: 'https://cdn.simpleicons.org/rocket/white',
  antigravity: 'https://cdn.simpleicons.org/google/white',
};

// Helper to resolve an app icon: real shortcut base64 -> brand icon fallback -> category SVG
export function resolvePcAppIcon(name: string, path: string = '', icon?: string): string {
  if (icon && !isGenericShortcutIcon(icon) && (icon.startsWith('data:image') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('blob:'))) {
    return icon;
  }
  const clean = (name + ' ' + path).toLowerCase();
  for (const [key, url] of Object.entries(BRAND_ICON_MAP)) {
    if (clean.includes(key)) {
      return url;
    }
  }
  if (icon && (icon.startsWith('data:image') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('blob:'))) {
    return icon;
  }
  return '';
}

// Icon Badge helper for compact views
export const PcAppIconBadge: React.FC<{ 
  icon?: string; 
  name?: string;
  path?: string;
  category?: PcAppConfig['category']; 
  size?: 'sm' | 'md' | 'lg';
  isLight?: boolean;
}> = ({ icon, name = '', path = '', category = 'other', size = 'md', isLight = false }) => {
  const resolved = resolvePcAppIcon(name, path, icon);

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  }[size];

  const imgSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size];

  const iconClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  if (resolved) {
    return (
      <div className={`${sizeClasses} shrink-0 flex items-center justify-center border transition-all ${
        isLight 
          ? 'bg-white border-zinc-200/90 shadow-sm' 
          : 'bg-[#18181D] border-white/[0.09] shadow-inner'
      }`}>
        <img 
          src={resolved} 
          alt={name} 
          className={`${imgSizeClasses} object-contain transition-transform group-hover:scale-105 pointer-events-none drop-shadow`} 
          loading="lazy"
        />
      </div>
    );
  }

  // Category fallback in Gray // Black theme
  const getCatIcon = () => {
    switch (category) {
      case 'code': return <Terminal className={`${iconClasses} text-white`} />;
      case 'browser': return <Globe className={`${iconClasses} text-white`} />;
      case 'design': return <Palette className={`${iconClasses} text-white`} />;
      case 'productivity': return <Briefcase className={`${iconClasses} text-white`} />;
      case 'games': return <Gamepad2 className={`${iconClasses} text-white`} />;
      case 'utilities': return <Wrench className={`${iconClasses} text-white`} />;
      default: return <Laptop className={`${iconClasses} text-white`} />;
    }
  };

  return (
    <div className={`${sizeClasses} shrink-0 flex items-center justify-center border ${
      isLight 
        ? 'bg-zinc-100 border-zinc-200 text-zinc-800' 
        : 'bg-white/[0.08] border-white/[0.1] text-white shadow-inner'
    }`}>
      {getCatIcon()}
    </div>
  );
};

export const PcAppsView: React.FC<PcAppsViewProps> = ({
  pcApps,
  onAddPcApp,
  onAddBatchPcApps,
  onUpdatePcApp,
  onDeletePcApp,
  onLaunchPcApp,
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<PcAppConfig | null>(null);
  const [isExtractingIcon, setIsExtractingIcon] = useState(false);
  const [formData, setFormData] = useState<Omit<PcAppConfig, 'id' | 'createdAt'>>({
    name: '',
    path: '',
    icon: '',
    category: 'code',
    arguments: '',
    description: '',
    isFavorite: false,
  });

  // Deep Scan Installed Apps Modal State
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSourceLabel, setScanSourceLabel] = useState<string>('All PC Programs & Desktop');
  const [scannedApps, setScannedApps] = useState<Array<{ name: string; path: string; icon?: string; category: PcAppConfig['category'] }>>([]);
  const [selectedScanned, setSelectedScanned] = useState<Set<string>>(new Set());
  const [scanFilterQuery, setScanFilterQuery] = useState('');
  const [scanCategoryFilter, setScanCategoryFilter] = useState('all');

  // Feedback notifications
  const [launchedId, setLaunchedId] = useState<string | null>(null);
  const [failedIconIds, setFailedIconIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Auto-scan on mount if pcApps is empty so the user's real desktop apps appear immediately
  useEffect(() => {
    if (pcApps.length === 0) {
      if (window.electronAPI?.scanInstalledPcApps) {
        window.electronAPI.scanInstalledPcApps().then((found) => {
          if (found && found.length > 0) {
            found.slice(0, 24).forEach((app) => {
              onAddPcApp({
                name: app.name,
                path: app.path,
                icon: resolvePcAppIcon(app.name, app.path, app.icon),
                category: app.category,
                isFavorite: false,
              });
            });
          }
        }).catch((err) => {
          console.warn('Initial PC apps scan error:', err);
        });
      }
    }
  }, [pcApps.length]);

  const attemptedHealRef = useRef<Set<string>>(new Set());

  // Auto-heal missing or generic icons asynchronously from local machine
  useEffect(() => {
    if (pcApps.length === 0) return;
    const appsToHeal = pcApps.filter((app) => {
      if (attemptedHealRef.current.has(app.id)) return false;
      return !app.icon || isGenericShortcutIcon(app.icon) || (!app.icon.startsWith('data:image') && !app.icon.startsWith('http'));
    });

    if (appsToHeal.length === 0) return;
    appsToHeal.forEach((a) => attemptedHealRef.current.add(a.id));

    if (window.electronAPI?.getBatchFileIcons) {
      window.electronAPI.getBatchFileIcons(
        appsToHeal.map((a) => ({ id: a.id, path: a.path, name: a.name }))
      ).then((iconMap) => {
        if (iconMap) {
          appsToHeal.forEach((app) => {
            const healed = iconMap[app.id];
            if (healed && !isGenericShortcutIcon(healed) && healed !== app.icon) {
              onUpdatePcApp({ ...app, icon: healed });
            }
          });
        }
      }).catch((err) => {
        console.warn('Batch icon healing error:', err);
      });
    } else if (window.electronAPI?.getFileIcon) {
      appsToHeal.forEach((app) => {
        window.electronAPI!.getFileIcon!(app.path).then((realIcon) => {
          if (realIcon && !isGenericShortcutIcon(realIcon) && realIcon !== app.icon) {
            onUpdatePcApp({ ...app, icon: realIcon });
          }
        }).catch(() => {});
      });
    }
  }, [pcApps]);

  // Open modal for new app
  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormData({
      name: '',
      path: '',
      icon: '',
      category: 'code',
      arguments: '',
      description: '',
      isFavorite: false,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (app: PcAppConfig) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      path: app.path,
      icon: app.icon || resolvePcAppIcon(app.name, app.path),
      category: app.category,
      arguments: app.arguments || '',
      description: app.description || '',
      isFavorite: !!app.isFavorite,
    });
    setIsModalOpen(true);
  };

  // Browse executable via native file dialog (with auto icon extraction)
  const handleBrowseFile = async () => {
    if (window.electronAPI?.selectFile) {
      try {
        const result = await window.electronAPI.selectFile({
          title: 'Select Installed Windows Application (.exe, .lnk, .bat)',
        });
        if (result) {
          const selectedPath = typeof result === 'string' ? result : result.path;
          let selectedName = typeof result === 'object' && result.name ? result.name : '';
          let selectedIcon = typeof result === 'object' && result.icon ? result.icon : '';

          if (!selectedName && selectedPath) {
            const parts = selectedPath.split(/[\/\\]/);
            const fileName = parts[parts.length - 1] || '';
            selectedName = fileName.replace(/\.(exe|lnk|bat|cmd|url)$/i, '');
          }

          if (!selectedIcon && selectedPath && window.electronAPI.getFileIcon) {
            try {
              const iconData = await window.electronAPI.getFileIcon(selectedPath);
              if (iconData && !isGenericShortcutIcon(iconData)) selectedIcon = iconData;
            } catch (_) {}
          }

          if (!selectedIcon || isGenericShortcutIcon(selectedIcon)) {
            selectedIcon = resolvePcAppIcon(selectedName, selectedPath, selectedIcon);
          }

          // Smart category detection
          let detectedCategory: PcAppConfig['category'] = 'other';
          const lower = (selectedName + ' ' + selectedPath).toLowerCase();
          if (/(chrome|edge|firefox|brave|opera|vivaldi|browser|arc)/.test(lower)) detectedCategory = 'browser';
          else if (/(code|studio|cursor|sublime|intellij|pycharm|git|terminal|bash|postman|docker|compiler|ide)/.test(lower)) detectedCategory = 'code';
          else if (/(figma|blender|photoshop|illustrator|premiere|after effects|canva|gimp|inkscape|obs|filmora)/.test(lower)) detectedCategory = 'design';
          else if (/(slack|discord|notion|obsidian|teams|zoom|telegram|whatsapp|word|excel|powerpoint|outlook|onenote|trello)/.test(lower)) detectedCategory = 'productivity';
          else if (/(steam|epic|riot|battlenet|game|minecraft|roblox)/.test(lower)) detectedCategory = 'games';
          else detectedCategory = 'utilities';

          setFormData((prev) => ({
            ...prev,
            path: selectedPath,
            name: prev.name || selectedName,
            icon: selectedIcon || prev.icon,
            category: prev.category === 'other' || !prev.name ? detectedCategory : prev.category,
          }));
        }
      } catch (err) {
        console.error('File selection error:', err);
      }
    } else {
      const mockPath = 'C:\\Program Files\\ExampleApp\\app.exe';
      setFormData((prev) => ({
        ...prev,
        path: mockPath,
        name: prev.name || 'Example App',
        icon: resolvePcAppIcon('Example App', mockPath),
      }));
    }
  };

  // Manually re-extract icon from typed path
  const handleExtractIconFromPath = async () => {
    if (!formData.path) return;
    setIsExtractingIcon(true);
    try {
      if (window.electronAPI?.getFileIcon) {
        const iconData = await window.electronAPI.getFileIcon(formData.path);
        if (iconData) {
          setFormData((prev) => ({ ...prev, icon: iconData }));
          showToast('Extracted real application logo');
          return;
        }
      }
      const fallback = resolvePcAppIcon(formData.name, formData.path);
      if (fallback) {
        setFormData((prev) => ({ ...prev, icon: fallback }));
        showToast('Applied official brand shortcut logo');
      } else {
        showToast('Could not extract icon from path');
      }
    } catch (_) {
      showToast('Icon extraction failed');
    } finally {
      setIsExtractingIcon(false);
    }
  };

  // Quick multi-select browse & add shortcut
  const handleQuickBrowseAndAdd = async () => {
    if (window.electronAPI?.selectFiles) {
      try {
        const results = await window.electronAPI.selectFiles({
          title: 'Select Application Shortcuts or Executables (.lnk, .exe, .url)',
        });
        if (results && results.length > 0) {
          const itemsToAdd = results.map((item) => {
            const derivedName = item.name || '';
            const selectedPath = item.path || '';
            let cat: PcAppConfig['category'] = item.category || 'other';
            const lower = (derivedName + ' ' + selectedPath).toLowerCase();
            if (/(chrome|edge|firefox|brave|opera|vivaldi|browser|arc)/.test(lower)) cat = 'browser';
            else if (/(code|studio|cursor|sublime|intellij|pycharm|git|terminal|bash|postman|docker|ide)/.test(lower)) cat = 'code';
            else if (/(figma|blender|photoshop|illustrator|premiere|after effects|canva|obs|filmora|capcut)/.test(lower)) cat = 'design';
            else if (/(slack|discord|notion|obsidian|teams|zoom|telegram|whatsapp|word|excel|powerpoint)/.test(lower)) cat = 'productivity';
            else if (/(steam|epic|riot|game|call of duty|cod)/.test(lower)) cat = 'games';
            else cat = 'utilities';

            return {
              name: derivedName,
              path: selectedPath,
              category: cat,
              icon: resolvePcAppIcon(derivedName, selectedPath, item.icon),
              isFavorite: false,
            };
          });

          if (onAddBatchPcApps) {
            onAddBatchPcApps(itemsToAdd);
          } else {
            itemsToAdd.forEach((item) => onAddPcApp(item));
          }
          showToast(`Added ${itemsToAdd.length} application shortcut${itemsToAdd.length > 1 ? 's' : ''} with authentic icons`);
          return;
        }
      } catch (e) {
        console.error('Quick multi-add failed:', e);
      }
    }

    if (window.electronAPI?.selectFile) {
      try {
        const result = await window.electronAPI.selectFile({
          title: 'Select Application Shortcut or Executable',
        });
        if (result) {
          const selectedPath = typeof result === 'string' ? result : result.path;
          let derivedName = typeof result === 'object' && result.name ? result.name : '';
          let derivedIcon = typeof result === 'object' && result.icon ? result.icon : '';

          if (!derivedName && selectedPath) {
            const parts = selectedPath.split(/[\/\\]/);
            const fileName = parts[parts.length - 1] || '';
            derivedName = fileName.replace(/\.(exe|lnk|bat|cmd|url)$/i, '');
          }

          if (!derivedIcon && selectedPath && window.electronAPI.getFileIcon) {
            try {
              const iconData = await window.electronAPI.getFileIcon(selectedPath);
              if (iconData && !isGenericShortcutIcon(iconData)) derivedIcon = iconData;
            } catch (_) {}
          }

          if (!derivedIcon || isGenericShortcutIcon(derivedIcon)) {
            derivedIcon = resolvePcAppIcon(derivedName, selectedPath, derivedIcon);
          }

          let cat: PcAppConfig['category'] = 'other';
          const lower = (derivedName + ' ' + selectedPath).toLowerCase();
          if (/(chrome|edge|firefox|brave|opera|vivaldi|browser|arc)/.test(lower)) cat = 'browser';
          else if (/(code|studio|cursor|sublime|intellij|pycharm|git|terminal|bash|postman|docker|ide)/.test(lower)) cat = 'code';
          else if (/(figma|blender|photoshop|illustrator|premiere|after effects|canva|obs|filmora|capcut)/.test(lower)) cat = 'design';
          else if (/(slack|discord|notion|obsidian|teams|zoom|telegram|whatsapp|word|excel|powerpoint)/.test(lower)) cat = 'productivity';
          else if (/(steam|epic|riot|game|call of duty)/.test(lower)) cat = 'games';
          else cat = 'utilities';

          onAddPcApp({
            name: derivedName,
            path: selectedPath,
            category: cat,
            icon: derivedIcon,
            isFavorite: false,
          });
          showToast(`Added "${derivedName}" with shortcut logo`);
        }
      } catch (e) {
        console.error('Quick add failed:', e);
      }
    } else {
      handleOpenAddModal();
    }
  };

  // Scan any custom folder for all shortcuts (.lnk, .exe, .url) inside it
  const handleScanShortcutFolder = async () => {
    setIsScanModalOpen(true);
    setIsScanning(true);
    setScannedApps([]);
    setSelectedScanned(new Set());
    setScanFilterQuery('');
    setScanCategoryFilter('all');
    setScanSourceLabel('Custom Folder');

    try {
      if (window.electronAPI?.selectShortcutFolder) {
        const res = await window.electronAPI.selectShortcutFolder();
        if (res) {
          setScanSourceLabel(`Folder: ${res.folderPath}`);
          const existingPaths = new Set(pcApps.map((a) => a.path.toLowerCase()));
          const uniqueFound = (res.shortcuts || [])
            .filter((f) => !existingPaths.has(f.path.toLowerCase()))
            .map((f) => ({
              ...f,
              icon: resolvePcAppIcon(f.name, f.path, f.icon),
            }));
          const listToShow = (uniqueFound.length > 0 ? uniqueFound : (res.shortcuts || [])).map((f) => ({
            ...f,
            icon: resolvePcAppIcon(f.name, f.path, f.icon),
          }));
          setScannedApps(listToShow);
          setSelectedScanned(new Set(listToShow.map((f) => f.path)));
          showToast(`Found ${res.shortcuts.length} shortcuts in folder`);
        } else {
          setIsScanModalOpen(false);
        }
      } else {
        // Browser fallback preview
        setTimeout(() => {
          const mockDesktopShortcuts = [
            { name: 'Discord', path: 'C:\\Users\\ASUS TUF\\Desktop\\Discord.lnk', category: 'productivity' as const, icon: resolvePcAppIcon('Discord') },
            { name: 'CapCut', path: 'C:\\Users\\ASUS TUF\\Desktop\\CapCut.lnk', category: 'design' as const, icon: resolvePcAppIcon('CapCut') },
            { name: 'OBS Studio', path: 'C:\\Users\\ASUS TUF\\Desktop\\OBS Studio.lnk', category: 'design' as const, icon: resolvePcAppIcon('OBS Studio') },
            { name: 'Wondershare Filmora 13', path: 'C:\\Users\\ASUS TUF\\Desktop\\Wondershare Filmora 13.lnk', category: 'design' as const, icon: resolvePcAppIcon('Filmora') },
            { name: 'Zoom Workplace', path: 'C:\\Users\\ASUS TUF\\Desktop\\Zoom Workplace.lnk', category: 'productivity' as const, icon: resolvePcAppIcon('Zoom') },
            { name: 'WinLaunch', path: 'C:\\Users\\ASUS TUF\\Desktop\\WinLaunch.lnk', category: 'utilities' as const, icon: resolvePcAppIcon('WinLaunch') },
          ];
          setScanSourceLabel('Folder: Desktop');
          setScannedApps(mockDesktopShortcuts);
          setSelectedScanned(new Set(mockDesktopShortcuts.map((m) => m.path)));
          setIsScanning(false);
        }, 400);
      }
    } catch (e) {
      console.error('Scan folder shortcuts failed:', e);
      showToast('Folder scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  // Run deep scan of installed PC software across Windows (Desktop & Start Menu)
  const handleStartAutoScan = async () => {
    setIsScanModalOpen(true);
    setIsScanning(true);
    setScannedApps([]);
    setSelectedScanned(new Set());
    setScanFilterQuery('');
    setScanCategoryFilter('all');
    setScanSourceLabel('All PC Programs & Desktop');

    try {
      if (window.electronAPI?.scanInstalledPcApps) {
        const found = await window.electronAPI.scanInstalledPcApps();
        const existingPaths = new Set(pcApps.map((a) => a.path.toLowerCase()));
        const uniqueFound = (found || [])
          .filter((f) => !existingPaths.has(f.path.toLowerCase()))
          .map((f) => ({
            ...f,
            icon: resolvePcAppIcon(f.name, f.path, f.icon),
          }));
        const listToShow = (uniqueFound.length > 0 ? uniqueFound : (found || [])).map((f) => ({
          ...f,
          icon: resolvePcAppIcon(f.name, f.path, f.icon),
        }));
        setScannedApps(listToShow);
        setSelectedScanned(new Set(listToShow.map((f) => f.path)));
        showToast(`Discovered ${found?.length || 0} installed apps and shortcuts`);
      } else {
        // Fallback simulation for browser development preview
        setTimeout(() => {
          const mockList = [
            { name: 'CapCut', path: 'C:\\Users\\ASUS TUF\\Desktop\\CapCut.lnk', category: 'design' as const },
            { name: 'Google Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', category: 'browser' as const },
            { name: 'Discord', path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Discord\\Update.exe', category: 'productivity' as const },
            { name: 'OBS Studio', path: 'C:\\Program Files\\obs-studio\\bin\\64bit\\obs64.exe', category: 'design' as const },
            { name: 'Wondershare Filmora 13', path: 'C:\\Users\\ASUS TUF\\Desktop\\Wondershare Filmora 13.lnk', category: 'design' as const },
            { name: 'Zoom Workplace', path: 'C:\\Users\\ASUS TUF\\Desktop\\Zoom Workplace.lnk', category: 'productivity' as const },
            { name: 'Visual Studio Code', path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', category: 'code' as const },
            { name: 'WinLaunch', path: 'C:\\Users\\ASUS TUF\\Desktop\\WinLaunch.lnk', category: 'utilities' as const },
            { name: 'Steam', path: 'C:\\Program Files (x86)\\Steam\\steam.exe', category: 'games' as const },
            { name: 'Figma', path: 'C:\\Users\\ASUS TUF\\AppData\\Local\\Figma\\Figma.exe', category: 'design' as const },
            { name: 'Git Bash', path: 'C:\\Program Files\\Git\\git-bash.exe', category: 'code' as const },
          ].map((m) => ({
            ...m,
            icon: resolvePcAppIcon(m.name, m.path),
          }));

          const existingPaths = new Set(pcApps.map((a) => a.path.toLowerCase()));
          const unique = mockList.filter((m) => !existingPaths.has(m.path.toLowerCase()));
          setScannedApps(unique);
          setSelectedScanned(new Set(unique.map((m) => m.path)));
          setIsScanning(false);
        }, 500);
      }
    } catch (e) {
      console.error('Scan failed:', e);
      showToast('Scan encountered an issue');
    } finally {
      setIsScanning(false);
    }
  };

  // Save form (Add or Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.path.trim()) return;

    const finalIcon = resolvePcAppIcon(formData.name, formData.path, formData.icon);

    if (editingApp) {
      onUpdatePcApp({
        ...editingApp,
        ...formData,
        icon: finalIcon,
      });
      showToast(`Updated "${formData.name}"`);
    } else {
      onAddPcApp({
        ...formData,
        icon: finalIcon,
      });
      showToast(`Added "${formData.name}"`);
    }
    setIsModalOpen(false);
  };

  // Launch application
  const handleLaunch = (app: PcAppConfig) => {
    setLaunchedId(app.id);
    setTimeout(() => setLaunchedId(null), 1600);
    onLaunchPcApp(app);
    showToast(`Launching ${app.name}...`);
  };

  const handleImportScanned = () => {
    const toImport = scannedApps.filter((a) => selectedScanned.has(a.path));
    const itemsToAdd = toImport.map((item) => ({
      name: item.name,
      path: item.path,
      icon: resolvePcAppIcon(item.name, item.path, item.icon),
      category: item.category,
      isFavorite: false,
    }));

    if (onAddBatchPcApps) {
      onAddBatchPcApps(itemsToAdd);
    } else {
      itemsToAdd.forEach((item) => onAddPcApp(item));
    }
    showToast(`Successfully installed ${itemsToAdd.length} applications`);
    setIsScanModalOpen(false);
  };

  // Toggle favorite
  const handleToggleFavorite = (app: PcAppConfig) => {
    onUpdatePcApp({
      ...app,
      isFavorite: !app.isFavorite,
    });
  };

  // Filtered Apps List in main view
  const filteredApps = useMemo(() => {
    return pcApps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeCategory === 'favorites') {
        return !!app.isFavorite;
      }
      if (activeCategory !== 'all') {
        return app.category === activeCategory;
      }
      return true;
    });
  }, [pcApps, searchQuery, activeCategory]);

  // Scanned apps filter inside scan modal
  const filteredScannedApps = scannedApps.filter((item) => {
    const matchesText = 
      item.name.toLowerCase().includes(scanFilterQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(scanFilterQuery.toLowerCase());
    if (!matchesText) return false;
    if (scanCategoryFilter !== 'all' && item.category !== scanCategoryFilter) return false;
    return true;
  });

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors duration-200 ${
      isLight ? 'bg-white text-zinc-900' : 'bg-[#080809] text-[#EDEDED]'
    }`}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-xl ${
              isLight
                ? 'bg-white/95 text-zinc-900 border-zinc-200 shadow-xl'
                : 'bg-[#18181E]/95 text-white border-white/[0.15] shadow-2xl'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar - Gray // Black Theme */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isLight ? 'border-zinc-200/80 bg-white backdrop-blur-md' : 'border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur-md'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
            isLight ? 'bg-zinc-900 text-white' : 'bg-white/[0.08] text-white border border-white/[0.1]'
          }`}>
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-base font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Installed PC Apps & Software
              </h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.08] text-[#C8C8CC] border border-white/[0.1]'
              }`}>
                {pcApps.length} Apps
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
              Manage, organize and launch local computer applications directly with real shortcut icons
            </p>
          </div>
        </div>

        {/* Action Buttons - Gray // Black Theme */}
        <div className="flex items-center space-x-2">
          {/* Deep Scan PC Apps Button */}
          <button
            onClick={handleStartAutoScan}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08]'
            }`}
            title="Scan your PC for all installed programs and Start Menu shortcuts"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>Deep Scan PC Apps</span>
          </button>

          {/* Scan Folder for Shortcuts Button */}
          <button
            onClick={handleScanShortcutFolder}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08]'
            }`}
            title="Select any folder (e.g. Desktop, Games directory) to scan and import all shortcuts inside it"
          >
            <FolderSearch className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>Scan Folder</span>
          </button>

          {/* Quick Browse Shortcuts / .exe Button (Supports Multi-Selection) */}
          <button
            onClick={handleQuickBrowseAndAdd}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isLight
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200'
                : 'bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/[0.08]'
            }`}
            title="Browse your computer to select one or multiple .lnk shortcuts or .exe files"
          >
            <Folder className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
            <span>Browse Shortcuts</span>
          </button>

          {/* Add Manually (+) Button - Bold Pure Monochrome */}
          <button
            onClick={handleOpenAddModal}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all ${
              isLight
                ? 'bg-zinc-900 hover:bg-black text-white'
                : 'bg-white hover:bg-zinc-200 text-zinc-950'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add App</span>
          </button>
        </div>
      </div>

      {/* Sub-Header: Category Tabs & Search Bar */}
      <div className={`px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
        isLight ? 'border-zinc-200/80 bg-[#f8f8fa]' : 'border-white/[0.06] bg-[#0a0a0c]'
      }`}>
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.id;
            const TabIcon = tab.icon;
            const count = tab.id === 'all' 
              ? pcApps.length 
              : tab.id === 'favorites'
              ? pcApps.filter((a) => a.isFavorite).length
              : pcApps.filter((a) => a.category === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium flex items-center space-x-1.5 shrink-0 transition-all ${
                  isSelected
                    ? isLight
                      ? 'bg-zinc-900 text-white font-semibold shadow-sm'
                      : 'bg-white text-zinc-950 font-bold shadow-sm'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
                    : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.05]'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? isLight ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-950 font-bold'
                      : isLight ? 'bg-zinc-200 text-zinc-600' : 'bg-white/[0.08] text-[#8A8F98]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'}`} />
            <input
              type="text"
              placeholder="Search apps or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-8 pr-7 py-1 text-xs rounded-xl outline-none w-52 transition-all ${
                isLight
                  ? 'bg-white border border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:border-zinc-400'
                  : 'bg-[#121215] border border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/30'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Grid / List Switcher */}
          <div className={`flex items-center p-0.5 rounded-xl border ${
            isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-[#121215] border-white/[0.08]'
          }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-white/[0.15] text-white'
                  : isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-[#8A8F98] hover:text-white'
              }`}
              title="Squircle Grid Launcher View (Web App Style)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-lg transition-all ${
                viewMode === 'list'
                  ? isLight ? 'bg-white text-zinc-900 shadow-sm' : 'bg-white/[0.15] text-white'
                  : isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-[#8A8F98] hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredApps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${
              isLight ? 'bg-zinc-100 border border-zinc-200' : 'bg-[#141418] border border-white/[0.08]'
            }`}>
              <AppWindow className={`w-8 h-8 ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'}`} />
            </div>
            <h3 className={`text-sm font-bold mb-1 ${isLight ? 'text-zinc-800' : 'text-[#EDEDED]'}`}>
              {searchQuery ? 'No matching apps found' : 'No Installed PC Apps Added Yet'}
            </h3>
            <p className={`text-xs max-w-sm mb-5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
              {searchQuery
                ? `No apps matched "${searchQuery}". Try a different keyword or reset category filter.`
                : 'Click Deep Scan to automatically detect all installed software on your PC or add applications manually.'}
            </p>
            {!searchQuery && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleStartAutoScan}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all ${
                    isLight ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Deep Scan PC Apps</span>
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    isLight 
                      ? 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200' 
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/[0.08]'
                  }`}
                >
                  <span>Add Manually</span>
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* EXACT WEB APP STYLE SQUIRCLE LAUNCHER GRID */
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {filteredApps.map((app) => {
              const isJustLaunched = launchedId === app.id;
              const resolvedIcon = resolvePcAppIcon(app.name, app.path, app.icon);

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => handleLaunch(app)}
                >
                  {/* Squircle Card Container */}
                  <div className="relative mb-2.5 w-full">
                    <div
                      className={`w-full aspect-square rounded-[22px] flex items-center justify-center cursor-pointer transition-all duration-200 group-hover:scale-105 border overflow-hidden ${
                        isJustLaunched ? 'ring-2 ring-emerald-500 scale-105' : ''
                      } ${
                        isLight 
                          ? 'bg-white border-black/[0.08] shadow-md hover:border-black/20' 
                          : 'bg-gradient-to-b from-[#18181E] via-[#101014] to-[#08080A] border-white/[0.1] shadow-xl hover:border-white/20'
                      }`}
                      style={{ 
                        boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.08)' : '0 8px 24px rgba(0,0,0,0.4)' 
                      }}
                      title={`Launch ${app.name} (${app.path})`}
                    >
                      {resolvedIcon && !failedIconIds.has(app.id) ? (
                        <img 
                          src={resolvedIcon} 
                          alt={app.name} 
                          className="w-2/3 h-2/3 object-contain pointer-events-none drop-shadow-md"
                          onError={() => {
                            setFailedIconIds((prev) => new Set(prev).add(app.id));
                          }}
                        />
                      ) : (
                        <div className="w-2/3 h-2/3 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                            {app.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Favorite Star Badge - Top-Left */}
                    {app.isFavorite && (
                      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center pointer-events-none shadow-sm backdrop-blur-sm">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-current" />
                      </div>
                    )}

                    {/* Just Launched Badge */}
                    {isJustLaunched && (
                      <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500 text-white shadow-md pointer-events-none">
                        Running
                      </div>
                    )}

                    {/* Hover Action Buttons Overlay */}
                    <div className="absolute inset-0 rounded-[22px] flex items-start justify-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none space-x-1">
                      {/* Open in Explorer */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.electronAPI?.openPathInExplorer?.(app.path);
                          showToast(`Opened folder for ${app.name}`);
                        }}
                        className="pointer-events-auto w-6 h-6 rounded-full bg-[#18181E]/90 hover:bg-white text-zinc-300 hover:text-black flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform shadow-md border border-white/10"
                        title="Open file location in Explorer"
                      >
                        <Folder className="w-3 h-3" />
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(app);
                        }}
                        className="pointer-events-auto w-6 h-6 rounded-full bg-[#18181E]/90 hover:bg-white text-zinc-300 hover:text-black flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform shadow-md border border-white/10"
                        title="Edit app details"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      {/* Delete App */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePcApp(app.id);
                        }}
                        className="pointer-events-auto w-6 h-6 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-transform shadow-md"
                        title="Remove from DevWorkspace"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* App Name and Category - Underneath Card */}
                  <span className={`text-[11px] font-medium text-center leading-tight truncate w-full px-1 ${
                    isLight ? 'text-zinc-800' : 'text-[#C8C8CC] group-hover:text-white transition-colors'
                  }`}>
                    {app.name}
                  </span>
                  <span className={`text-[9px] mt-0.5 capitalize ${
                    isLight ? 'text-zinc-400' : 'text-[#686870]'
                  }`}>
                    {app.category}
                  </span>
                </motion.div>
              );
            })}

            {/* Add App Squircle Button (Matches Web App style) */}
            <motion.div 
              whileHover={{ y: -3 }} 
              className="flex flex-col items-center group cursor-pointer" 
              onClick={handleOpenAddModal}
            >
              <div className={`w-full aspect-square rounded-[22px] border-2 border-dashed flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                isLight 
                  ? 'border-zinc-300 hover:border-zinc-500 bg-zinc-100/50' 
                  : 'border-white/[0.12] hover:border-white/30 bg-white/[0.03]'
              }`}>
                <Plus className={`w-6 h-6 ${isLight ? 'text-zinc-400' : 'text-[#686870] group-hover:text-white'}`} />
              </div>
              <span className={`text-[11px] font-medium text-center mt-2.5 ${isLight ? 'text-zinc-400' : 'text-[#686870] group-hover:text-white'}`}>
                Add PC App
              </span>
            </motion.div>
          </div>
        ) : (
          /* Linear List View - Gray // Black Theme */
          <div className={`rounded-2xl border divide-y overflow-hidden ${
            isLight ? 'bg-white border-zinc-200/80 divide-zinc-200/60' : 'bg-[#141418] border-white/[0.07] divide-white/[0.05]'
          }`}>
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className={`p-3.5 flex items-center justify-between gap-4 transition-colors ${
                  isLight ? 'hover:bg-zinc-50' : 'hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <PcAppIconBadge 
                    icon={app.icon} 
                    name={app.name}
                    path={app.path}
                    category={app.category} 
                    size="sm" 
                    isLight={isLight} 
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                        {app.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase font-mono ${
                        isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-white/[0.08] text-[#C8C8CC] border border-white/[0.08]'
                      }`}>
                        {app.category}
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono truncate ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                      {app.path}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleToggleFavorite(app)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      app.isFavorite
                        ? 'text-amber-400'
                        : isLight ? 'text-zinc-300 hover:text-zinc-600' : 'text-white/20 hover:text-white/60'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${app.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => window.electronAPI?.openPathInExplorer?.(app.path)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-[#8A8F98] hover:text-white'
                    }`}
                    title="Open in Explorer"
                  >
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(app)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isLight ? 'text-zinc-400 hover:text-zinc-800' : 'text-[#8A8F98] hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeletePcApp(app.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleLaunch(app)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1 transition-all ${
                      isLight ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add or Edit PC App - Pure Gray // Black Theme */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border transition-all ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#0d0d0f] border-white/10 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${
              isLight ? 'border-zinc-200' : 'border-white/10'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-white/[0.08] text-white border border-white/[0.1]'
                }`}>
                  <Laptop className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">
                  {editingApp ? 'Edit Installed PC App' : 'Add Installed PC Application'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1 rounded-lg ${isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-[#8A8F98] hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* App Icon Preview & Name Row */}
              <div className="flex items-start space-x-3">
                <div className="shrink-0 flex flex-col items-center">
                  <label className={`block text-[10px] font-semibold mb-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    App Logo
                  </label>
                  <PcAppIconBadge 
                    icon={formData.icon} 
                    name={formData.name}
                    path={formData.path}
                    category={formData.category} 
                    size="lg" 
                    isLight={isLight} 
                  />
                  {formData.path && (
                    <button
                      type="button"
                      onClick={handleExtractIconFromPath}
                      disabled={isExtractingIcon}
                      className="mt-1 text-[9px] text-[#C8C8CC] hover:text-white hover:underline"
                    >
                      {isExtractingIcon ? 'Extracting...' : 'Fetch Icon'}
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>
                    Application Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Visual Studio Code, Chrome, Blender"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const autoIcon = !formData.icon ? resolvePcAppIcon(name, formData.path) : formData.icon;
                      setFormData({ ...formData, name, icon: autoIcon });
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-zinc-400'
                        : 'bg-[#141418] border-white/10 text-slate-200 focus:border-white/30'
                    }`}
                  />
                </div>
              </div>

              {/* Executable Path with Browse Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-xs font-semibold ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>
                    Executable Path (.exe, .lnk, .bat) *
                  </label>
                  <span className="text-[10px] text-[#8A8F98]">Auto-extracts native shortcut logo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. C:\Program Files\App\app.exe or code"
                    value={formData.path}
                    onChange={(e) => {
                      const path = e.target.value;
                      const autoIcon = !formData.icon ? resolvePcAppIcon(formData.name, path) : formData.icon;
                      setFormData({ ...formData, path, icon: autoIcon });
                    }}
                    className={`flex-1 px-3 py-2 text-xs font-mono rounded-xl outline-none border transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-zinc-400'
                        : 'bg-[#141418] border-white/10 text-slate-200 focus:border-white/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleBrowseFile}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                      isLight
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                        : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                    }`}
                  >
                    Browse...
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className={`w-full px-3 py-2 text-xs rounded-xl outline-none border ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                      : 'bg-[#141418] border-white/10 text-slate-200'
                  }`}
                >
                  <option value="code">IDEs & Dev Tools</option>
                  <option value="browser">Web Browsers</option>
                  <option value="productivity">Productivity & Notes</option>
                  <option value="design">Design & Media</option>
                  <option value="utilities">Utilities & System Tools</option>
                  <option value="games">Games & Entertainment</option>
                  <option value="other">Other Software</option>
                </select>
              </div>

              {/* Optional Launch Arguments */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>
                  Optional Launch Arguments / Flags
                </label>
                <input
                  type="text"
                  placeholder="e.g. --incognito or --no-sandbox"
                  value={formData.arguments}
                  onChange={(e) => setFormData({ ...formData, arguments: e.target.value })}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-xl outline-none border ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white'
                      : 'bg-[#141418] border-white/10 text-slate-200'
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Short note about what this software does"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl outline-none border ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white'
                      : 'bg-[#141418] border-white/10 text-slate-200'
                  }`}
                />
              </div>

              {/* Modal Buttons */}
              <div className={`pt-3 border-t flex items-center justify-end space-x-2 ${
                isLight ? 'border-zinc-200' : 'border-white/10'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                    isLight ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  {editingApp ? 'Save Changes' : 'Add to Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deep Scan Installed PC Apps - Pure Gray // Black Theme */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-3xl rounded-3xl p-6 shadow-2xl border flex flex-col max-h-[88vh] ${
            isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#0d0d0f] border-white/10 text-white'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-3 border-b shrink-0 ${
              isLight ? 'border-zinc-200' : 'border-white/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isLight ? 'bg-zinc-100 text-zinc-800' : 'bg-white/[0.08] text-white border border-white/[0.1]'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center space-x-2">
                    <span>{scanSourceLabel}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono border ${
                      isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.08] text-[#C8C8CC] border-white/[0.1]'
                    }`}>
                      {scannedApps.length} Shortcuts
                    </span>
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Select which detected applications and shortcuts to import into DevWorkspace
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleScanShortcutFolder}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                    isLight 
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200' 
                      : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border-white/[0.1]'
                  }`}
                  title="Choose another folder to scan for shortcuts"
                >
                  <FolderSearch className="w-3.5 h-3.5" />
                  <span>Scan Folder</span>
                </button>
                <button
                  onClick={() => setIsScanModalOpen(false)}
                  className={`p-1.5 rounded-xl ${isLight ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-white hover:bg-white/10'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter and Selection Controls Bar */}
            <div className={`py-3 flex flex-wrap items-center justify-between gap-3 border-b shrink-0 ${
              isLight ? 'border-zinc-200' : 'border-white/5'
            }`}>
              <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                <div className="relative flex-1">
                  <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'}`} />
                  <input
                    type="text"
                    placeholder="Filter scanned apps..."
                    value={scanFilterQuery}
                    onChange={(e) => setScanFilterQuery(e.target.value)}
                    className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl outline-none border transition-all ${
                      isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white focus:border-zinc-400'
                        : 'bg-[#141418] border-white/10 text-slate-200 focus:border-white/30'
                    }`}
                  />
                </div>

                {/* Category Filter inside Modal */}
                <select
                  value={scanCategoryFilter}
                  onChange={(e) => setScanCategoryFilter(e.target.value)}
                  className={`px-2.5 py-1.5 text-xs rounded-xl outline-none border ${
                    isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-[#141418] border-white/10 text-slate-200'
                  }`}
                >
                  <option value="all">All Categories</option>
                  <option value="code">Code & Dev</option>
                  <option value="browser">Browsers</option>
                  <option value="productivity">Productivity</option>
                  <option value="design">Design</option>
                  <option value="games">Games</option>
                  <option value="utilities">Utilities</option>
                </select>
              </div>

              {/* Bulk Select / Deselect Controls */}
              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const allPaths = new Set(filteredScannedApps.map((a) => a.path));
                    setSelectedScanned(allPaths);
                  }}
                  className="text-xs text-white hover:underline font-semibold"
                >
                  Select All ({filteredScannedApps.length})
                </button>
                <span className="text-[#8A8F98]">·</span>
                <button
                  type="button"
                  onClick={() => setSelectedScanned(new Set())}
                  className="text-xs text-[#8A8F98] hover:text-white"
                >
                  Deselect All
                </button>
                <span className="text-[#8A8F98]">·</span>
                <span className="text-xs font-mono font-bold text-white">
                  {selectedScanned.size} Selected
                </span>
              </div>
            </div>

            {/* Scanned Apps List with Multi-Select Checkboxes & Native Logos */}
            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {isScanning ? (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <RefreshCw className="w-8 h-8 text-white animate-spin mb-3" />
                  <p className="text-xs font-semibold">Scanning Windows Program Files, AppData & Start Menu Shortcuts...</p>
                  <p className="text-[11px] text-[#8A8F98] mt-1">Extracting real application icons and shortcut paths</p>
                </div>
              ) : filteredScannedApps.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#8A8F98]">
                  {scannedApps.length === 0
                    ? 'No new unadded applications found in standard Windows locations.'
                    : 'No apps match your search filter.'}
                </div>
              ) : (
                filteredScannedApps.map((item) => {
                  const isChecked = selectedScanned.has(item.path);

                  return (
                    <div
                      key={item.path}
                      onClick={() => {
                        const next = new Set(selectedScanned);
                        if (isChecked) next.delete(item.path);
                        else next.add(item.path);
                        setSelectedScanned(next);
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? isLight
                            ? 'bg-zinc-100 border-zinc-300 shadow-sm'
                            : 'bg-white/[0.08] border-white/20 shadow-sm'
                          : isLight
                          ? 'bg-zinc-50 border-zinc-200/90 hover:bg-zinc-100/80'
                          : 'bg-[#141418] border-white/[0.06] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-3">
                        {/* Checkbox */}
                        <div className="shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-white" />
                          ) : (
                            <Square className={`w-4 h-4 ${isLight ? 'text-zinc-400' : 'text-white/20'}`} />
                          )}
                        </div>

                        {/* Real Application Logo */}
                        <PcAppIconBadge 
                          icon={item.icon} 
                          name={item.name}
                          path={item.path}
                          category={item.category} 
                          size="md" 
                          isLight={isLight} 
                        />

                        {/* App Name and Path */}
                        <div className="truncate flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                              {item.name}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase font-mono ${
                              isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-white/[0.08] text-[#C8C8CC] border border-white/[0.08]'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                          <div className={`text-[10px] font-mono truncate ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                            {item.path}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-xs font-mono">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
                          isChecked
                            ? isLight ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-950 border-white'
                            : isLight ? 'text-zinc-500 border-zinc-200' : 'text-[#8A8F98] border-white/10'
                        }`}>
                          {isChecked ? 'Selected' : 'Skip'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className={`pt-3 border-t flex items-center justify-between shrink-0 ${
              isLight ? 'border-zinc-200' : 'border-white/10'
            }`}>
              <div className="text-xs text-[#8A8F98]">
                <span>{selectedScanned.size} of {scannedApps.length} apps will be imported</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportScanned}
                  disabled={selectedScanned.size === 0}
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
                    isLight ? 'bg-zinc-900 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  Import {selectedScanned.size} Apps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
