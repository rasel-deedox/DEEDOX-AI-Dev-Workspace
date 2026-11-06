import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, Bot, Compass, Newspaper, 
  Download, Zap, Settings, Sun, Moon, Monitor 
} from 'lucide-react';
import { AgentMiniature } from './AgentMiniature';

interface FloatingNavBarProps {
  activeView: 'launcher' | 'trending' | 'news' | 'ai-agent' | 'pc-apps';
  onSelectView: (view: 'launcher' | 'trending' | 'news' | 'ai-agent' | 'pc-apps') => void;
  onOpenDownloadModal: () => void;
  onOpenAutoScanModal: () => void;
  onOpenSettings: () => void;
  activeDownloadsCount?: number;
  currentTheme: string;
  onToggleTheme: () => void;
  enablePcApps?: boolean;
}

export const FloatingNavBar: React.FC<FloatingNavBarProps> = ({
  activeView,
  onSelectView,
  onOpenDownloadModal,
  onOpenAutoScanModal,
  onOpenSettings,
  activeDownloadsCount = 0,
  currentTheme,
  onToggleTheme,
  enablePcApps = true,
}) => {
  const isLight = currentTheme === 'soft-light';

  const navItems = [
    {
      id: 'launcher',
      label: 'App Launcher',
      icon: LayoutGrid,
      action: () => onSelectView('launcher'),
      isActive: activeView === 'launcher',
    },
    ...(enablePcApps ? [{
      id: 'pc-apps',
      label: 'Installed PC Apps',
      icon: Monitor,
      action: () => onSelectView('pc-apps'),
      isActive: activeView === 'pc-apps',
      badge: 'PC',
    }] : []),
    {
      id: 'ai-agent',
      label: 'AI Copilot',
      icon: Bot,
      action: () => onSelectView('ai-agent'),
      isActive: activeView === 'ai-agent',
      badge: 'AI',
    },
    {
      id: 'trending',
      label: 'GitHub Trending',
      icon: Compass,
      action: () => onSelectView('trending'),
      isActive: activeView === 'trending',
    },
    {
      id: 'news',
      label: 'Tech & AI News',
      icon: Newspaper,
      action: () => onSelectView('news'),
      isActive: activeView === 'news',
    },
    {
      id: 'download',
      label: 'Download Manager',
      icon: Download,
      action: onOpenDownloadModal,
      badge: activeDownloadsCount > 0 ? `${activeDownloadsCount}` : undefined,
    },
    {
      id: 'scan',
      label: 'Scan Local Drives',
      icon: Zap,
      action: onOpenAutoScanModal,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      action: onOpenSettings,
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`px-2.5 py-1.5 rounded-full flex items-center space-x-1 shadow-2xl border transition-colors ${
          isLight ? 'bg-white/90 border-black/10' : 'bg-[#121215]/95 border-white/[0.08]'
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <motion.button
              key={item.id}
              onClick={item.action}
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.94 }}
              title={item.label}
              className={`relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors group ${
                active
                  ? isLight
                    ? 'bg-zinc-200 text-zinc-950 shadow-sm'
                    : 'bg-[#1F1F24] text-[#EDEDED] border border-white/[0.12] shadow-sm'
                  : isLight
                  ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
              }`}
            >
              {item.id === 'ai-agent' ? (
                <div className="relative z-10 flex items-center justify-center scale-95">
                  <AgentMiniature shape="realistic-sphere" size="xs" isLight={isLight} isSpeaking={active} />
                </div>
              ) : (
                <Icon className="w-4 h-4 relative z-10" />
              )}

              {/* Badges */}
              {item.badge && (
                <span className={`absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[8px] font-bold z-20 ${
                  active
                    ? 'bg-white text-zinc-950 font-bold'
                    : 'bg-zinc-700 text-white font-semibold'
                }`}>
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className={`w-[1px] h-4 mx-0.5 ${isLight ? 'bg-black/10' : 'bg-white/10'}`} />

        {/* Theme Switcher Button */}
        <motion.button
          onClick={onToggleTheme}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          title={isLight ? 'Switch to Linear Dark' : 'Switch to Light'}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
            isLight
              ? 'text-zinc-600 hover:bg-zinc-100'
              : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.04]'
          }`}
        >
          {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
        </motion.button>
      </motion.div>
    </div>
  );
};
