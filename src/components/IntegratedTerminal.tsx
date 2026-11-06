import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { 
  Sparkles, RotateCcw, Trash2, Copy, 
  Check, AlertCircle, Play, Square, Terminal as TerminalIcon 
} from 'lucide-react';
import type { TerminalLog, ProjectConfig, ProjectRuntime } from '../types';

interface IntegratedTerminalProps {
  projectId: string;
  project: ProjectConfig;
  runtime?: ProjectRuntime;
  logs: TerminalLog[];
  onDiagnoseAI: (errorLog: string) => void;
  onRestart: () => void;
  onStop: () => void;
  onStart: () => void;
}

export const IntegratedTerminal: React.FC<IntegratedTerminalProps> = ({
  projectId,
  project,
  runtime,
  logs,
  onDiagnoseAI,
  onRestart,
  onStop,
  onStart,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [copied, setCopied] = useState(false);
  const [detectedError, setDetectedError] = useState<string | null>(null);

  const isRunning = runtime?.status === 'running';
  const isStarting = runtime?.status === 'starting';

  // Initialize xterm.js instance
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 12,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      theme: {
        background: '#0a0d14',
        foreground: '#e2e8f0',
        cursor: '#60a5fa',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
        black: '#1e293b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#f8fafc',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    // Send stdin inputs to child process
    term.onData((data) => {
      window.electronAPI?.sendTerminalInput(projectId, data);
    });

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (_) {}
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermInstance.current = null;
    };
  }, [projectId]);

  // Sync incoming logs to xterm
  const lastLogCountRef = useRef(0);
  useEffect(() => {
    if (!xtermInstance.current) return;

    // If new logs were added
    if (logs.length > lastLogCountRef.current) {
      const newLogs = logs.slice(lastLogCountRef.current);
      for (const log of newLogs) {
        if (log.type === 'stderr' || log.type === 'error') {
          // Red tint for errors
          xtermInstance.current.write(`\x1b[31m${log.text}\x1b[0m`);
        } else if (log.type === 'system') {
          // Cyan for system notifications
          xtermInstance.current.write(`\x1b[36m${log.text}\x1b[0m`);
        } else {
          xtermInstance.current.write(log.text);
        }

        // Error detection pattern check
        const lower = log.text.toLowerCase();
        if (
          lower.includes('error:') ||
          lower.includes('modulenotfounderror') ||
          lower.includes('cannot find module') ||
          lower.includes('failed to compile') ||
          lower.includes('traceback (most recent call last)') ||
          lower.includes('syntaxerror') ||
          lower.includes('eaddrinuse')
        ) {
          setDetectedError(log.text);
        }
      }
      lastLogCountRef.current = logs.length;
    } else if (logs.length === 0 && lastLogCountRef.current > 0) {
      xtermInstance.current.clear();
      lastLogCountRef.current = 0;
    }
  }, [logs]);

  const handleClear = () => {
    xtermInstance.current?.clear();
    setDetectedError(null);
  };

  const handleCopy = () => {
    const fullText = logs.map((l) => l.text).join('');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#080809] border-t border-white/[0.08] select-text overflow-hidden relative">
      {/* Terminal Toolbar */}
      <div className="h-9 px-3 bg-[#121215] border-b border-white/[0.07] flex items-center justify-between select-none shrink-0">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Terminal: {project.name}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
            {project.command}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* AI Diagnostic Quick Trigger */}
          {detectedError && (
            <button
              onClick={() => onDiagnoseAI(detectedError)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-semibold shadow-glow-purple transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Solve Error</span>
            </button>
          )}

          {/* Start / Stop Toggle */}
          {isRunning || isStarting ? (
            <button
              onClick={onStop}
              className="p-1.5 rounded-lg glass-button text-rose-400 hover:bg-rose-500/20"
              title="Stop Process"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          ) : (
            <button
              onClick={onStart}
              className="p-1.5 rounded-lg glass-button text-emerald-400 hover:bg-emerald-500/20"
              title="Start Process"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          )}

          {/* Restart */}
          <button
            onClick={onRestart}
            className="p-1.5 rounded-lg glass-button text-slate-400 hover:text-white"
            title="Restart Server"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg glass-button text-slate-400 hover:text-white"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg glass-button text-slate-400 hover:text-white"
            title="Clear Terminal Output"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Floating Error Bar if an error was detected */}
      {detectedError && (
        <div className="bg-rose-950/80 backdrop-blur-xl border-b border-rose-500/30 px-3 py-1.5 flex items-center justify-between text-xs text-rose-200 shrink-0">
          <div className="flex items-center space-x-2 truncate mr-3">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate font-medium">Issue detected in process output.</span>
          </div>
          <button
            onClick={() => onDiagnoseAI(detectedError)}
            className="px-2.5 py-1 rounded bg-rose-500/30 hover:bg-rose-500/40 text-white font-semibold text-[11px] flex items-center space-x-1 shrink-0 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>OpenRouter AI Fix</span>
          </button>
        </div>
      )}

      {/* Terminal View Container */}
      <div ref={terminalRef} className="flex-1 w-full p-2 overflow-hidden" />
    </div>
  );
};
