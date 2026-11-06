import React, { useState } from 'react';
import { 
  X, Globe, Sparkles, Check, RefreshCw, 
  Tag, ShieldCheck, BookmarkPlus 
} from 'lucide-react';
import type { MiniApp } from '../types';

interface AddMiniAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMiniApp: (app: Omit<MiniApp, 'id' | 'createdAt'>) => void;
  currentTheme?: string;
}

export const AddMiniAppModal: React.FC<AddMiniAppModalProps> = ({
  isOpen,
  onClose,
  onAddMiniApp,
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [badge, setBadge] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  if (!isOpen) return null;

  const handleFetchMetadata = async (rawUrl: string) => {
    if (!rawUrl.trim()) return;
    setIsFetching(true);

    let cleanUrl = rawUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (window.electronAPI) {
      try {
        const metadata = await window.electronAPI.fetchUrlMetadata(cleanUrl);
        setName(metadata.title || cleanUrl);
        setIcon(metadata.iconUrl);
        if (metadata.suggestedCategory) {
          setCategory(metadata.suggestedCategory);
        }
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      }
    } else {
      // Mock fallback
      try {
        const domain = new URL(cleanUrl).hostname;
        setName(domain.split('.')[0].toUpperCase());
        setIcon(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      } catch (_) {
        setName('Web App');
      }
    }
    setIsFetching(false);
  };

  const handleUrlBlur = () => {
    if (url.trim() && (!name || !icon)) {
      handleFetchMetadata(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    onAddMiniApp({
      name: name.trim() || targetUrl,
      url: targetUrl,
      icon: icon || `https://www.google.com/s2/favicons?domain=${new URL(targetUrl).hostname}&sz=128`,
      category,
      badge: badge.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 ${
      isLight ? 'bg-black/35 backdrop-blur-sm' : 'bg-black/80 backdrop-blur-md'
    }`}>
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl border relative transition-all ${
        isLight 
          ? 'bg-white border-zinc-200 text-zinc-900 shadow-xl' 
          : 'bg-[#0E0E11] border-white/[0.12] text-[#EDEDED] shadow-2xl shadow-black/80'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isLight ? 'border-zinc-200' : 'border-white/[0.08]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
              isLight 
                ? 'bg-zinc-100 border-zinc-200 text-zinc-800' 
                : 'bg-white/[0.06] border-white/[0.08] text-white'
            }`}>
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Add Web to Mini-App
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                Convert any website into an in-app desktop mini-app
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight 
                ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100' 
                : 'text-[#8A8F98] hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Icon Preview */}
        <div className={`mt-5 flex items-center space-x-4 p-3.5 rounded-xl border ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#141417] border-white/[0.08]'
        }`}>
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center p-2 shadow-sm relative overflow-hidden shrink-0 ${
            isLight ? 'bg-white border-zinc-200' : 'bg-[#1C1C20] border-white/[0.08]'
          }`}>
            {icon ? (
              <img
                src={icon}
                alt="App Icon"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as any).src = 'https://www.google.com/s2/favicons?domain=example.com&sz=128';
                }}
              />
            ) : (
              <Globe className={`w-5 h-5 ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`} />
            )}
            {badge && (
              <span className={`absolute top-0.5 right-0.5 text-[8px] font-bold px-1 rounded ${
                isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-950'
              }`}>
                {badge}
              </span>
            )}
          </div>
          <div className="flex-1 truncate">
            <div className={`text-sm font-semibold truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {name || 'Mini-App Name'}
            </div>
            <div className={`text-xs truncate mt-0.5 font-mono ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
              {url || 'https://website.com'}
            </div>
            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
              isLight 
                ? 'bg-zinc-200/70 text-zinc-700 border-zinc-300' 
                : 'bg-white/[0.06] text-[#EDEDED] border-white/[0.08]'
            }`}>
              {category}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Website URL */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              Website URL
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-[#8A8F98] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="https://github.com or notion.so"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  required
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl outline-none border transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                      : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => handleFetchMetadata(url)}
                disabled={isFetching || !url}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all shrink-0 flex items-center space-x-1.5 disabled:opacity-40 ${
                  isLight
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#EDEDED] border-white/[0.08]'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                <span>Auto-Fetch</span>
              </button>
            </div>
            {isFetching && (
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 mt-1 font-mono animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>Extracting site title & high-res favicon...</span>
              </div>
            )}
          </div>

          {/* App Name */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              Mini-App Name
            </label>
            <input
              type="text"
              placeholder="e.g. GitHub Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-all ${
                isLight
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                  : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
              }`}
            />
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white'
                    : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] focus:border-white/20'
                }`}
              >
                <option value="Social" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Social</option>
                <option value="Productivity" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Productivity</option>
                <option value="AI Tools" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>AI Tools</option>
                <option value="Dev Tools" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Dev Tools</option>
                <option value="Utility" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Utility</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                App Badge (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Pro, Docs, Chat"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                maxLength={8}
                className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                    : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
                }`}
              />
            </div>
          </div>

          {/* Custom Icon URL (Optional) */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              Custom Icon URL (Optional)
            </label>
            <input
              type="text"
              placeholder="https://.../icon.png"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-all ${
                isLight
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                  : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
              }`}
            />
          </div>

          {/* Session Login Notice */}
          <div className={`p-2.5 rounded-xl border text-[11px] flex items-center space-x-2 ${
            isLight 
              ? 'bg-zinc-50 border-zinc-200 text-zinc-600' 
              : 'bg-[#141417] border-white/[0.08] text-[#8A8F98]'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Persistent session enabled: Your logins and cookies will be remembered across restarts.</span>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end space-x-3 pt-3 border-t mt-5 ${
            isLight ? 'border-zinc-200' : 'border-white/[0.08]'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                isLight 
                  ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' 
                  : 'text-[#8A8F98] hover:text-[#EDEDED] hover:bg-white/[0.06]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Add Mini-App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
