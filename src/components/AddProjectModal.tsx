import React, { useState } from 'react';
import { 
  X, Folder, FolderOpen, Check, 
  HardDrive, Sparkles, Terminal
} from 'lucide-react';
import type { ProjectConfig, WorkspaceCategory } from '../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: Omit<ProjectConfig, 'id' | 'createdAt'>) => void;
  categories: WorkspaceCategory[];
  currentTheme?: string;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  categories,
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';

  const [projectPath, setProjectPath] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[1]?.id || 'ai-agents');
  const [framework, setFramework] = useState<ProjectConfig['framework']>('other');
  const [command, setCommand] = useState('npm run dev');
  const [defaultPort, setDefaultPort] = useState<number | undefined>(3000);
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const handleSelectFolder = async () => {
    if (!window.electronAPI) {
      // Mock for browser fallback testing
      const mockPath = 'C:\\Projects\\my-ai-agent';
      applyFolderPath(mockPath);
      return;
    }

    try {
      const selected = await window.electronAPI.selectFolder();
      if (selected) {
        applyFolderPath(selected);
      }
    } catch (err) {
      console.error('Failed to open folder dialog:', err);
    }
  };

  const applyFolderPath = async (folderPath: string) => {
    setProjectPath(folderPath);
    setIsDetecting(true);

    if (window.electronAPI) {
      try {
        const details = await window.electronAPI.detectProject(folderPath);
        setName(details.name || folderPath.split(/[\\/]/).pop() || 'My Project');
        setFramework(details.framework as any || 'other');
        setCommand(details.suggestedCommand || 'npm start');
        if (details.detectedPort) setDefaultPort(details.detectedPort);
        if (details.icon) {
          setIcon(details.icon);
        } else {
          setIcon(undefined);
        }
      } catch (err) {
        console.error('Project detection error:', err);
      }
    } else {
      const base = folderPath.split(/[\\/]/).pop() || 'My Project';
      setName(base);
      setCommand('npm run dev');
    }
    setIsDetecting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectPath.trim() || !name.trim()) return;

    onAddProject({
      name: name.trim(),
      path: projectPath.trim(),
      category,
      framework,
      command: command.trim() || 'npm start',
      defaultPort: defaultPort ? Number(defaultPort) : undefined,
      icon,
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
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-sm font-semibold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                Add New Project
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                Select any directory from C:, D:, or E: drive
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Folder Path with Drive Selector Button */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              Project Folder Path
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <HardDrive className="w-4 h-4 text-[#8A8F98] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. D:\Projects\ai-app"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  required
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl font-mono outline-none border transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                      : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleSelectFolder}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all shrink-0 flex items-center space-x-1.5 ${
                  isLight
                    ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#EDEDED] border-white/[0.08]'
                }`}
              >
                <Folder className="w-3.5 h-3.5 text-[#8A8F98]" />
                <span>Browse Drive</span>
              </button>
            </div>
            {isDetecting && (
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-400 mt-1.5 animate-pulse font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Scanning project configurations...</span>
              </div>
            )}
          </div>

          {/* Project Name & Detected Native Icon */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={`text-xs font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                Project Display Name
              </label>
              {icon && (
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Native Repository Icon Detected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              {icon && (
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center p-1 shrink-0 ${
                  isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-white/[0.06] border-white/[0.08]'
                }`}>
                  <img src={icon} alt="Repo Icon" className="w-full h-full object-contain" />
                </div>
              )}
              <input
                type="text"
                placeholder="e.g. My Next.js Web App"
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
          </div>

          {/* Category & Framework in 2 columns */}
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
                {categories
                  .filter((c) => c.id !== 'all')
                  .map((c) => (
                    <option key={c.id} value={c.id} className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                Tech Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as any)}
                className={`w-full px-3 py-2 text-xs rounded-xl outline-none border transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:bg-white'
                    : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] focus:border-white/20'
                }`}
              >
                <option value="react" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>React</option>
                <option value="vite" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Vite</option>
                <option value="next" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Next.js</option>
                <option value="vue" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Vue</option>
                <option value="node" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Node.js / Express</option>
                <option value="python" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Python</option>
                <option value="fastapi" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>FastAPI</option>
                <option value="flask" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Flask</option>
                <option value="django" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Django</option>
                <option value="rust" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Rust</option>
                <option value="go" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Go</option>
                <option value="docker" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Docker Compose</option>
                <option value="other" className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141417] text-[#EDEDED]'}>Other / Custom</option>
              </select>
            </div>
          </div>

          {/* Launch Command & Default Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                Launch Command
              </label>
              <div className="relative">
                <Terminal className="w-3.5 h-3.5 text-[#8A8F98] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="npm run dev"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  required
                  className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl font-mono outline-none border transition-all ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                      : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                Expected Port
              </label>
              <input
                type="number"
                placeholder="3000"
                value={defaultPort || ''}
                onChange={(e) => setDefaultPort(e.target.value ? Number(e.target.value) : undefined)}
                className={`w-full px-3 py-2 text-xs rounded-xl font-mono outline-none border transition-all ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-400'
                    : 'bg-[#141417] border-white/[0.08] text-[#EDEDED] placeholder-[#686870] focus:border-white/20'
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center justify-end space-x-3 pt-4 border-t mt-6 ${
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
              <Check className="w-3.5 h-3.5" />
              <span>Add to Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
