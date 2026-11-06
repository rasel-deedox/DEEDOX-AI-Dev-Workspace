import React, { useState } from 'react';
import { 
  X, Sparkles, Check, Copy, Terminal, 
  AlertTriangle, Lightbulb, Play, Settings, RefreshCw, Cpu
} from 'lucide-react';
import type { AIErrorAnalysis, ProjectConfig } from '../types';
import { AgentMiniature } from './AgentMiniature';

interface AIErrorDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorLog: string;
  project: ProjectConfig;
  analysis: AIErrorAnalysis | null;
  isLoading: boolean;
  onReAnalyze: () => void;
  onRunSuggestedCommand: (command: string) => void;
  onOpenSettings: () => void;
}

export const AIErrorDiagnosticModal: React.FC<AIErrorDiagnosticModalProps> = ({
  isOpen,
  onClose,
  errorLog,
  project,
  analysis,
  isLoading,
  onReAnalyze,
  onRunSuggestedCommand,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 shadow-2xl border border-white/15 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="shrink-0">
              <AgentMiniature shape="flask" color="#7c3aed" size="sm" isSpeaking={isLoading} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">AI Error Diagnostics & Solution</h2>
                {analysis && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                    {analysis.confidence}% Confidence
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Powered by OpenRouter API & intelligent DevOps analysis
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onReAnalyze}
              disabled={isLoading}
              className="p-1.5 rounded-lg glass-button text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
              title="Re-analyze with AI"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {/* Project Details Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <span className="font-semibold text-white">{project.name}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-400">{project.command}</span>
            </div>
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1 text-[11px] text-purple-400 hover:text-purple-300 underline"
            >
              <Settings className="w-3 h-3" />
              <span>Configure AI Key</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mb-3 animate-pulse">
                <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Analyzing Error with OpenRouter AI...</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Parsing stack trace, inspecting missing dependencies, and compiling step-by-step fix...
              </p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Error Summary */}
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
                <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Issue Summary</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed pl-6">
                  {analysis.errorSummary}
                </p>
              </div>

              {/* Root Cause */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Root Cause Analysis</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {analysis.rootCause}
                </p>
              </div>

              {/* Suggested Shell Command (if any) */}
              {analysis.suggestedCommand && (
                <div className="p-3.5 rounded-2xl bg-black/60 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-purple-300 flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-purple-400" />
                      <span>Recommended Fix Command</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleCopyCommand(analysis.suggestedCommand!)}
                        className="px-2 py-1 rounded-lg glass-button text-slate-300 hover:text-white text-[11px] flex items-center space-x-1"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onRunSuggestedCommand(analysis.suggestedCommand!);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center space-x-1 transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run in Terminal</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/80 font-mono text-xs text-emerald-400 border border-white/5 select-all">
                    {analysis.suggestedCommand}
                  </div>
                </div>
              )}

              {/* Step-by-Step Resolution */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs font-semibold text-slate-200 block mb-2">
                  Resolution Checklist:
                </span>
                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-2 font-sans">
                  {analysis.solution}
                </div>
              </div>

              {/* Model Attribution Badge */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/10">
                <div className="flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Model: {analysis.modelUsed}</span>
                </div>
                <span>DevWorkspace AI Assistant</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              No analysis available. Click the refresh button above to analyze with AI.
            </div>
          )}

          {/* Raw Error Log Preview */}
          <details className="mt-2 text-xs text-slate-400 bg-black/40 rounded-xl p-2.5 border border-white/5">
            <summary className="cursor-pointer font-semibold text-slate-300 hover:text-white">
              View Raw Terminal Output
            </summary>
            <pre className="mt-2 p-2 bg-black/80 text-[11px] font-mono text-rose-300/80 rounded-lg overflow-x-auto max-h-40 whitespace-pre-wrap">
              {errorLog}
            </pre>
          </details>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-white/10 shrink-0 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl glass-button text-slate-300 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
