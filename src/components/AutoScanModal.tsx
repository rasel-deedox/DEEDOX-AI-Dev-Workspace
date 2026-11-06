import React, { useState, useEffect } from 'react';
import { 
  X, HardDrive, Search, Check, Folder, 
  CheckSquare, Square, RefreshCw
} from 'lucide-react';
import type { DetectedScanProject, ProjectConfig } from '../types';

interface AutoScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProjects: (projects: Omit<ProjectConfig, 'id' | 'createdAt'>[]) => void;
  existingPaths: Set<string>;
  currentTheme?: string;
}

export const AutoScanModal: React.FC<AutoScanModalProps> = ({
  isOpen,
  onClose,
  onImportProjects,
  existingPaths,
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';

  const [availableDrives, setAvailableDrives] = useState<string[]>(['C:\\']);
  const [selectedTarget, setSelectedTarget] = useState<string>('C:\\');
  const [customPath, setCustomPath] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [discovered, setDiscovered] = useState<DetectedScanProject[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [scanDepth, setScanDepth] = useState<number>(4);
  const [filterText, setFilterText] = useState<string>('');

  useEffect(() => {
    if (isOpen && window.electronAPI) {
      window.electronAPI.getAvailableDrives().then((drives) => {
        if (drives && drives.length > 0) {
          setAvailableDrives(drives);
          setSelectedTarget(drives[0]);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBrowseCustomFolder = async () => {
    if (!window.electronAPI) return;
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      setCustomPath(folder);
      setSelectedTarget(folder);
    }
  };

  const handleStartScan = async () => {
    const target = customPath || selectedTarget;
    if (!target) return;

    setIsScanning(true);
    setDiscovered([]);
    setSelectedItems(new Set());

    try {
      if (window.electronAPI) {
        const results = await window.electronAPI.scanDirectoryProjects(target, scanDepth);
        // Exclude projects that are already in workspace
        const newDiscovered = (results || []).filter((p) => !existingPaths.has(p.path));
        setDiscovered(newDiscovered);
        // Pre-select all newly discovered projects
        setSelectedItems(new Set(newDiscovered.map((p) => p.path)));
      } else {
        // Fallback simulation for browser development preview
        setTimeout(() => {
          const mockResults: DetectedScanProject[] = [
            {
              name: 'langchain-rag-agent',
              path: 'C:\\Projects\\langchain-rag-agent',
              framework: 'fastapi',
              suggestedCommand: 'python -m uvicorn main:app --reload',
              detectedPort: 8000,
              isGit: true,
            },
            {
              name: 'nextjs-saas-dashboard',
              path: 'C:\\Projects\\nextjs-saas-dashboard',
              framework: 'next',
              suggestedCommand: 'npm run dev',
              detectedPort: 3000,
              isGit: true,
            },
            {
              name: 'rust-high-perf-api',
              path: 'C:\\Projects\\rust-high-perf-api',
              framework: 'rust',
              suggestedCommand: 'cargo run',
              detectedPort: 8080,
              isGit: true,
            },
          ];
          const newDiscovered = mockResults.filter((p) => !existingPaths.has(p.path));
          setDiscovered(newDiscovered);
          setSelectedItems(new Set(newDiscovered.map((p) => p.path)));
          setIsScanning(false);
        }, 600);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelect = (path: string) => {
    const next = new Set(selectedItems);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setSelectedItems(next);
  };

  const selectAll = () => {
    setSelectedItems(new Set(filteredDiscovered.map((p) => p.path)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleImport = () => {
    const toImport = discovered.filter((p) => selectedItems.has(p.path));
    if (toImport.length === 0) return;

    const formattedProjects: Omit<ProjectConfig, 'id' | 'createdAt'>[] = toImport.map((p) => ({
      name: p.name,
      path: p.path,
      category: p.framework.includes('agent') ? 'ai-agents' : 'websites',
      framework: (p.framework as ProjectConfig['framework']) || 'other',
      command: p.suggestedCommand,
      defaultPort: p.detectedPort,
      icon: p.icon,
      lastStatus: 'idle',
    }));

    onImportProjects(formattedProjects);
    onClose();
  };

  const filteredDiscovered = discovered.filter(
    (p) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      p.path.toLowerCase().includes(filterText.toLowerCase()) ||
      p.framework.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 ${
      isLight ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/80 backdrop-blur-md'
    }`}>
      <div className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl border relative flex flex-col max-h-[85vh] transition-all ${
        isLight 
          ? 'bg-white border-zinc-200 text-zinc-900 shadow-2xl' 
          : 'bg-[#0D0D0E] border-white/10 text-[#EDEDED] shadow-2xl'
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
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                <span>Auto-Scan Local Drives for Projects</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isLight 
                    ? 'bg-zinc-100 text-zinc-700 border-zinc-200' 
                    : 'bg-white/[0.06] text-zinc-300 border-white/10'
                }`}>
                  Recursive
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                Scans drives or folders to detect repositories (.git, package.json, requirements.txt)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isLight ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100' : 'text-[#8A8F98] hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scan Target Controls */}
        <div className={`mt-4 p-3.5 rounded-2xl border space-y-3 shrink-0 ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-[#141417] border-white/[0.08]'
        }`}>
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              Select Drive to Scan
            </label>
            <div className="flex items-center space-x-2">
              {availableDrives.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedTarget(d);
                    setCustomPath('');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedTarget === d && !customPath
                      ? isLight
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm font-bold'
                        : 'bg-white text-zinc-950 border-white shadow-sm font-bold'
                      : isLight
                      ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      : 'bg-white/[0.04] text-zinc-300 hover:text-white border-white/[0.06]'
                  }`}
                >
                  {d}
                </button>
              ))}

              <button
                type="button"
                onClick={handleBrowseCustomFolder}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                  customPath
                    ? isLight
                      ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                      : 'bg-white/[0.12] text-white border-white/20 font-bold'
                    : isLight
                    ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    : 'bg-white/[0.04] text-zinc-300 hover:text-white border-white/[0.06]'
                }`}
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <Folder className={`w-3.5 h-3.5 shrink-0 ${customPath ? 'text-white' : 'text-[#8A8F98]'}`} />
                  <span className="truncate">{customPath || 'Browse Specific Folder...'}</span>
                </div>
                <span className={`text-[10px] shrink-0 ml-2 font-semibold ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Choose</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className={`flex items-center space-x-2 text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              <span>Scan Depth:</span>
              <span className="font-mono font-semibold text-zinc-200">{scanDepth} levels</span>
              <input
                type="range"
                min="2"
                max="6"
                value={scanDepth}
                onChange={(e) => setScanDepth(Number(e.target.value))}
                className="w-24 accent-white cursor-pointer ml-1"
              />
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50 ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950 font-bold'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Drives...' : 'Start Drive Scan'}</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-1">
          {isScanning ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 animate-pulse border ${
                isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-white/[0.06] border-white/10 text-white'
              }`}>
                <Search className="w-6 h-6 animate-spin text-white" />
              </div>
              <p className={`text-sm font-semibold mb-1 ${isLight ? 'text-zinc-800' : 'text-white'}`}>
                Scanning directory tree...
              </p>
              <p className={`text-xs max-w-sm ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                Searching for git repositories, package.json files, and python requirements...
              </p>
            </div>
          ) : discovered.length > 0 ? (
            <div>
              {/* Filter and Selection Header */}
              <div className={`flex items-center justify-between pb-2 mb-2 border-b text-xs ${
                isLight ? 'border-zinc-200 text-zinc-600' : 'border-white/5 text-[#8A8F98]'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-zinc-200">Discovered ({discovered.length} projects)</span>
                  <span>•</span>
                  <button onClick={selectAll} className="text-white hover:underline font-semibold">Select All</button>
                  <span>•</span>
                  <button onClick={deselectAll} className={`hover:underline ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Deselect All</button>
                </div>
                <input
                  type="text"
                  placeholder="Filter results..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className={`px-2.5 py-1 text-xs rounded-xl outline-none border w-40 transition-all ${
                    isLight 
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-800 focus:bg-white' 
                      : 'bg-[#141417] border-white/10 text-slate-200 focus:border-white/20'
                  }`}
                />
              </div>

              <div className="space-y-2">
                {filteredDiscovered.map((item) => {
                  const isChecked = selectedItems.has(item.path);
                  return (
                    <div
                      key={item.path}
                      onClick={() => toggleSelect(item.path)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isChecked
                          ? isLight
                            ? 'bg-zinc-100 border-zinc-300 text-zinc-900 shadow-sm'
                            : 'bg-white/[0.08] border-white/20 text-white shadow-sm'
                          : isLight
                          ? 'bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100'
                          : 'bg-white/[0.03] border-white/[0.06] text-[#8A8F98] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate mr-3">
                        <div className="text-white shrink-0">
                          {isChecked ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4 text-[#8A8F98]" />}
                        </div>
                        {item.icon && (
                          <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center p-1 shrink-0">
                            <img src={item.icon} alt="" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <div className="truncate">
                          <div className="flex items-center space-x-2 truncate">
                            <span className={`font-semibold text-xs truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                              {item.name}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-white/10 text-slate-300'
                            }`}>
                              {item.framework}
                            </span>
                            {item.isGit && (
                              <span className={`text-[9px] px-1 py-0.2 rounded font-semibold font-mono ${
                                isLight ? 'bg-zinc-200 text-zinc-700' : 'bg-white/[0.08] text-zinc-300'
                              }`}>
                                git
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] truncate font-mono mt-0.5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`} title={item.path}>
                            {item.path}
                          </div>
                        </div>
                      </div>

                      <div className={`text-[10px] font-mono px-2 py-1 rounded-lg shrink-0 border ${
                        isLight ? 'bg-white border-zinc-200 text-zinc-700' : 'bg-black/40 border-white/5 text-[#8A8F98]'
                      }`}>
                        {item.suggestedCommand}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`py-16 text-center text-xs ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
              Click &quot;Start Drive Scan&quot; to discover repositories on your selected drive.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-4 border-t shrink-0 mt-3 ${
          isLight ? 'border-zinc-200' : 'border-white/10'
        }`}>
          <span className={`text-xs ${isLight ? 'text-zinc-600' : 'text-[#8A8F98]'}`}>
            <span className="font-semibold text-white">{selectedItems.size}</span> projects selected for import
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedItems.size === 0}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-40 ${
                isLight
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Import Selected ({selectedItems.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
