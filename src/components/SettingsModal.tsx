import React, { useState } from 'react';
import { 
  X, Settings, Key, Eye, EyeOff, Check, 
  GitBranch, Sparkles, 
  RefreshCw, CheckCircle2, AlertCircle, HardDrive, Folder, Gift,
  Monitor, Globe, Minus, Square
} from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  currentTheme?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  currentTheme = 'nova-dark',
}) => {
  const [openRouterKey, setOpenRouterKey] = useState(
    settings.openRouterApiKey || ''
  );
  const [openRouterModel, setOpenRouterModel] = useState(
    settings.openRouterModel && !settings.openRouterModel.includes('deepseek-r1:free')
      ? settings.openRouterModel
      : 'openrouter/free'
  );
  const [useFreeModelsOnly, setUseFreeModelsOnly] = useState(settings.useFreeModelsOnly ?? true);
  const [defaultCloneLocation, setDefaultCloneLocation] = useState(settings.defaultCloneLocation || 'C:\\Workspace');
  const [githubToken, setGithubToken] = useState(settings.githubToken || '');
  const [autoOpenUrl, setAutoOpenUrl] = useState(settings.autoOpenUrlOnDetection ?? true);
  const [glassBlur, setGlassBlur] = useState(settings.glassmorphismBlur || 20);
  const [theme, setTheme] = useState(settings.theme || currentTheme || 'nova-dark');
  const [windowControlsStyle, setWindowControlsStyle] = useState<'macos' | 'windows'>(settings.windowControlsStyle || 'macos');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [enableContextMenu, setEnableContextMenu] = useState(settings.enableContextMenu !== false);
  const [enableMultiSelect, setEnableMultiSelect] = useState(settings.enableMultiSelect !== false);
  const [enablePcApps, setEnablePcApps] = useState(settings.enablePcApps !== false);
  const [enableWebApps, setEnableWebApps] = useState(settings.enableWebApps !== false);

  if (!isOpen) return null;

  const isLight = (currentTheme || theme) === 'soft-light';

  const handleBrowseCloneLocation = async () => {
    if (window.electronAPI) {
      const selected = await window.electronAPI.selectFolder();
      if (selected) {
        setDefaultCloneLocation(selected);
      }
    }
  };

  const handleTestKey = async () => {
    if (!openRouterKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }
    setIsTestingKey(true);
    setTestResult(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${openRouterKey.trim()}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `Connected! ${data.data?.label || 'Valid OpenRouter Key'} (Usage: $${data.data?.usage?.toFixed(2) || '0.00'})`,
        });
      } else {
        setTestResult({ success: false, message: `Authentication failed (${response.status})` });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Connection error: ${err.message}` });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      openRouterApiKey: openRouterKey.trim(),
      openRouterModel,
      useFreeModelsOnly,
      defaultCloneLocation: defaultCloneLocation.trim(),
      githubToken: githubToken.trim(),
      autoOpenUrlOnDetection: autoOpenUrl,
      glassmorphismBlur: Number(glassBlur),
      theme,
      enableContextMenu,
      enableMultiSelect,
      enablePcApps,
      enableWebApps,
      windowControlsStyle,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border relative max-h-[92vh] overflow-y-auto transition-colors ${
        isLight
          ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300/50'
          : 'bg-[#0D0D0E] border-white/10 text-[#EDEDED] shadow-black/80'
      }`}>
        {/* Header - Gray // Black Theme */}
        <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${
          isLight ? 'border-zinc-200' : 'border-white/10'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
              isLight 
                ? 'bg-zinc-100 text-zinc-800 border border-zinc-200' 
                : 'bg-white/[0.08] text-white border border-white/[0.1]'
            }`}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>DevWorkspace Settings</h2>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Configure AI models, pages, system controls, and workspace preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Section: Page Visibility & Navigation Modules */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-[#141418] border-white/[0.08]'
          }`}>
            <span className={`text-xs font-semibold block ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Navigation &amp; Module Toggles
            </span>

            {/* PC Apps View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-2.5 pr-2">
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.08] text-white border border-white/[0.1]'
                }`}>
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                    Installed PC Apps Page
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Show or hide the Installed PC Apps manager in the navigation dock and sidebar.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={enablePcApps} 
                  onChange={(e) => {
                    const val = e.target.checked;
                    setEnablePcApps(val);
                    onSaveSettings({ enablePcApps: val });
                  }} 
                  className="sr-only peer" 
                />
                <div className={`w-9 h-5 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 peer-checked:after:bg-zinc-950 after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                  isLight ? 'bg-zinc-200 peer-checked:bg-zinc-900' : 'bg-white/15 peer-checked:bg-white'
                }`}></div>
              </label>
            </div>

            {/* Web Apps & Cloud Services Toggle */}
            <div className={`flex items-center justify-between pt-2.5 border-t ${
              isLight ? 'border-zinc-200' : 'border-white/[0.06]'
            }`}>
              <div className="flex items-start space-x-2.5 pr-2">
                <div className={`p-1.5 rounded-lg mt-0.5 ${
                  isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.08] text-white border border-white/[0.1]'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                    Web Apps &amp; Cloud Services (Mini-Apps)
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Show or hide the Web Apps &amp; Cloud Services section in the App Drawer.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input 
                  type="checkbox" 
                  checked={enableWebApps} 
                  onChange={(e) => {
                    const val = e.target.checked;
                    setEnableWebApps(val);
                    onSaveSettings({ enableWebApps: val });
                  }} 
                  className="sr-only peer" 
                />
                <div className={`w-9 h-5 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 peer-checked:after:bg-zinc-950 after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                  isLight ? 'bg-zinc-200 peer-checked:bg-zinc-900' : 'bg-white/15 peer-checked:bg-white'
                }`}></div>
              </label>
            </div>
          </div>

          {/* Section: OpenRouter AI Key & 100% Free Models */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-[#141418] border-white/[0.08]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center space-x-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                <span>OpenRouter API Key &amp; Free Models</span>
              </span>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#C8C8CC] hover:text-white underline font-medium"
              >
                Get Free API Key
              </a>
            </div>

            {/* Free Mode Callout */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
              isLight
                ? 'bg-zinc-100 border-zinc-300'
                : 'bg-white/[0.04] border-white/10'
            }`}>
              <div className="flex items-center space-x-2">
                <Gift className={`w-4 h-4 shrink-0 ${isLight ? 'text-zinc-800' : 'text-white'}`} />
                <div>
                  <div className={`text-[11px] font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>100% Free Models Mode (:free)</div>
                  <div className={`text-[10px] ${isLight ? 'text-zinc-600' : 'text-[#8A8F98]'}`}>Uses zero-cost models with $0 balance requirement</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useFreeModelsOnly}
                onChange={(e) => setUseFreeModelsOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-white cursor-pointer"
              />
            </div>

            <div className="relative">
              <Key className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'}`} />
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-or-v1-... (Free tier with $0 balance works!)"
                value={openRouterKey}
                onChange={(e) => {
                  setOpenRouterKey(e.target.value);
                  setTestResult(null);
                }}
                className={`w-full pl-9 pr-10 py-2 text-xs rounded-xl font-mono border outline-none transition-colors ${
                  isLight
                    ? 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500'
                    : 'bg-[#0D0D0E] border-white/10 text-slate-200 placeholder:text-zinc-600 focus:border-white/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className={`absolute right-3 top-2.5 ${isLight ? 'text-zinc-400 hover:text-zinc-700' : 'text-[#8A8F98] hover:text-white'}`}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTestingKey || !openRouterKey}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-40 border ${
                  isLight
                    ? 'bg-zinc-200/80 hover:bg-zinc-300 text-zinc-800 border-zinc-300'
                    : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/[0.1]'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isTestingKey ? 'animate-spin text-white' : ''}`} />
                <span>{isTestingKey ? 'Testing Connection...' : 'Test API Key'}</span>
              </button>

              {testResult && (
                <div className={`text-[11px] font-medium flex items-center space-x-1 ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span className="truncate max-w-[200px]">{testResult.message}</span>
                </div>
              )}
            </div>

            {/* AI Model selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-medium ${isLight ? 'text-zinc-700' : 'text-slate-300'}`}>
                  Preferred AI Model
                </label>
                <span className="text-[10px] text-[#C8C8CC] font-mono font-semibold">:free models require $0</span>
              </div>
              <select
                value={openRouterModel}
                onChange={(e) => setOpenRouterModel(e.target.value)}
                className={`w-full px-3 py-1.5 text-xs rounded-xl border outline-none ${
                  isLight
                    ? 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-500'
                    : 'bg-[#0D0D0E] border-white/10 text-slate-200 focus:border-white/30'
                }`}
              >
                <optgroup label="100% Free OpenRouter Models ($0 Cost)">
                  <option value="openrouter/free">[FREE] ⚡ openrouter/free (Universal $0 Free AI Router - Recommended)</option>
                  <option value="openrouter/auto">[AUTO] 🤖 openrouter/auto (Auto Best Available Model)</option>
                  <option value="qwen/qwen3.8-27b:free">[FREE] Qwen 3.8 27B</option>
                  <option value="google/gemma-4-26b-a4b-it:free">[FREE] Google Gemma 4 26B</option>
                  <option value="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free">[FREE] NVIDIA Nemotron 3 Nano Omni</option>
                  <option value="liquid/lfm-2.5-2.6b:free">[FREE] LiquidAI LFM 2.5</option>
                </optgroup>
                <optgroup label="Standard Paid Models (Requires OpenRouter Credits)">
                  <option value="anthropic/claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                  <option value="meta-llama/llama-3.3-70b-instruct">Meta Llama 3.3 70B (Dedicated)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Section: Default Repository Download Location */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-[#141418] border-white/[0.08]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center space-x-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <HardDrive className="w-3.5 h-3.5 text-[#8A8F98]" />
                <span>Default Repository Download Directory</span>
              </span>
              <span className="text-[10px] text-[#8A8F98] font-medium">Customizable</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Folder className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'}`} />
                <input
                  type="text"
                  value={defaultCloneLocation}
                  onChange={(e) => setDefaultCloneLocation(e.target.value)}
                  placeholder="e.g. C:\Workspace or D:\Projects"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl font-mono border outline-none ${
                    isLight
                      ? 'bg-white border-zinc-300 text-zinc-900'
                      : 'bg-[#0D0D0E] border-white/10 text-slate-200'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleBrowseCloneLocation}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-all ${
                  isLight
                    ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 border-zinc-300'
                    : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/[0.1]'
                }`}
              >
                Browse...
              </button>
            </div>
            <p className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
              When downloading GitHub repositories, this destination folder will be selected by default.
            </p>
          </div>

          {/* Section: GitHub Personal Access Token */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-[#141418] border-white/[0.08]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold flex items-center space-x-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <GitBranch className="w-3.5 h-3.5 text-[#8A8F98]" />
                <span>GitHub Personal Access Token</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.08] text-[#C8C8CC] border border-white/[0.1]'
              }`}>
                Active
              </span>
            </div>

            <input
              type="text"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl font-mono border outline-none ${
                isLight
                  ? 'bg-white border-zinc-300 text-zinc-900'
                  : 'bg-[#0D0D0E] border-white/10 text-slate-200'
              }`}
            />
            <p className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
              Rate limit: 5,000 requests/hr for GitHub Trending Explorer and repository cloning.
            </p>
          </div>

          {/* Section: Persistent Storage & Preferences */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-[#141418] border-white/[0.08]'
          }`}>
            {/* Auto Open URL toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>Auto-Open Detected Localhost URLs</div>
                <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                  Automatically route detected servers into in-app webview tabs
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoOpenUrl}
                onChange={(e) => setAutoOpenUrl(e.target.checked)}
                className="w-4 h-4 rounded accent-white cursor-pointer"
              />
            </div>

            {/* Visual Theme Selection */}
            <div>
              <span className={`text-xs font-semibold block mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>Visual Theme &amp; Identity</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('nova-dark')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    theme !== 'soft-light'
                      ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                      : isLight
                      ? 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-900'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                    <span className="text-xs font-bold">Obsidian Dark</span>
                  </div>
                  <p className={`text-[10px] mt-1 ${theme !== 'soft-light' ? 'text-zinc-700' : 'text-[#8A8F98]'}`}>
                    Pure deep gray and obsidian monochrome aesthetic
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('soft-light')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    theme === 'soft-light'
                      ? 'bg-zinc-900 text-white font-bold border-zinc-900 shadow-sm'
                      : isLight
                      ? 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-900'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span className="text-xs font-bold">Soft Clean Light</span>
                  </div>
                  <p className={`text-[10px] mt-1 ${theme === 'soft-light' ? 'text-zinc-300' : 'text-[#8A8F98]'}`}>
                    Crisp bright aesthetic with soft floating cards
                  </p>
                </button>
              </div>
            </div>

            {/* Window Controls Style (macOS Traffic Lights vs Windows Classic) */}
            <div>
              <span className={`text-xs font-semibold block mb-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Window Controls Theme (উইন্ডো কন্ট্রোল স্টাইল)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWindowControlsStyle('macos');
                    onSaveSettings({ windowControlsStyle: 'macos' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    windowControlsStyle !== 'windows'
                      ? isLight 
                        ? 'bg-zinc-900 text-white font-bold border-zinc-900 shadow-sm'
                        : 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                      : isLight
                      ? 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-900'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    <span className="text-xs font-bold ml-1">macOS Style (Default)</span>
                  </div>
                  <p className={`text-[10px] ${windowControlsStyle !== 'windows' ? (isLight ? 'text-zinc-300' : 'text-zinc-700') : 'text-[#8A8F98]'}`}>
                    Traffic lights on left (Red, Yellow, Green)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWindowControlsStyle('windows');
                    onSaveSettings({ windowControlsStyle: 'windows' });
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    windowControlsStyle === 'windows'
                      ? isLight 
                        ? 'bg-zinc-900 text-white font-bold border-zinc-900 shadow-sm'
                        : 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                      : isLight
                      ? 'bg-white border-zinc-300 text-zinc-600 hover:text-zinc-900'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Minus className="w-3 h-3" />
                    <Square className="w-2.5 h-2.5" />
                    <X className="w-3 h-3" />
                    <span className="text-xs font-bold ml-0.5">Windows Style</span>
                  </div>
                  <p className={`text-[10px] ${windowControlsStyle === 'windows' ? (isLight ? 'text-zinc-300' : 'text-zinc-700') : 'text-[#8A8F98]'}`}>
                    Classic minimize, zoom & close buttons on right
                  </p>
                </button>
              </div>
            </div>

            {/* Glass Blur Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>Liquid Glass Blur Intensity</span>
                <span className={`text-xs font-mono ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>{glassBlur}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="40"
                value={glassBlur}
                onChange={(e) => setGlassBlur(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Interaction Settings */}
            <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-zinc-200' : 'border-white/[0.06]'}`}>
              <span className={`text-xs font-semibold block ${isLight ? 'text-zinc-900' : 'text-white'}`}>Interaction &amp; UX</span>

              {/* Right-click context menu */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>Right-Click Context Menu</div>
                  <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Show multi-select options when right-clicking on project cards</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={enableContextMenu} onChange={(e) => setEnableContextMenu(e.target.checked)} className="sr-only peer" />
                  <div className={`w-9 h-5 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 peer-checked:after:bg-zinc-950 after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                    isLight ? 'bg-zinc-200 peer-checked:bg-zinc-900' : 'bg-white/10 peer-checked:bg-white'
                  }`}></div>
                </label>
              </div>

              {/* Multi-select delete */}
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-semibold ${isLight ? 'text-zinc-800' : 'text-white'}`}>Multi-Select Delete Mode</div>
                  <div className={`text-[10px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Enable checkbox selection to delete multiple projects at once</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={enableMultiSelect} onChange={(e) => setEnableMultiSelect(e.target.checked)} className="sr-only peer" />
                  <div className={`w-9 h-5 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-300 peer-checked:after:bg-zinc-950 after:border-transparent after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                    isLight ? 'bg-zinc-200 peer-checked:bg-zinc-900' : 'bg-white/10 peer-checked:bg-white'
                  }`}></div>
                </label>
              </div>
            </div>

            <div className={`pt-2 border-t flex items-center space-x-2 text-[10px] ${
              isLight ? 'border-zinc-200 text-zinc-500' : 'border-white/[0.06] text-[#8A8F98]'
            }`}>
              <HardDrive className="w-3.5 h-3.5 text-[#8A8F98] shrink-0" />
              <span>Storage: Persistent JSON at <code className={`font-mono ${isLight ? 'text-zinc-700 bg-zinc-100 px-1 rounded' : 'text-slate-300'}`}>userData/devworkspace_store.json</code></span>
            </div>
          </div>

          {/* Footer buttons - Pure Gray // Black Theme */}
          <div className={`flex items-center justify-end space-x-2.5 pt-3 border-t ${
            isLight ? 'border-zinc-200' : 'border-white/10'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                isLight ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-white hover:bg-white/5'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                isLight
                  ? 'bg-zinc-900 hover:bg-black text-white'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
