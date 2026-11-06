import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Shield, Check, Sparkles, Send, 
  Terminal, Play, Square, RefreshCw, Trash2, Cpu, Key, ExternalLink,
  ChevronDown, ChevronUp, Layers, HardDrive, AlertTriangle, Zap,
  Sliders, MessageSquare, Copy, CheckCircle2, Globe, Newspaper,
  Minus, Maximize2, X, Paperclip, ArrowUp, GitBranch, Info, Plus, Edit3, CheckSquare,
  Users, Palette, Eye, LayoutGrid, FolderGit2, Star, Server
} from 'lucide-react';
import type { 
  ProjectConfig, ProjectRuntime, TerminalLog, MiniApp, 
  PersonalAIAgentConfig, PersonalAIAgentPermissions, AgentChatMessage, AppSettings 
} from '../types';
import { AgentMiniature, MINIATURE_CATALOG, type MiniatureShapeId } from './AgentMiniature';
import { BUILTIN_AGENTS, DEFAULT_PERMISSIONS } from '../data/agentPresets';
import { MultiAgentRoundtable } from './MultiAgentRoundtable';
import appLogo from '../assets/logo.png';

interface PersonalAIAgentViewProps {
  projects: ProjectConfig[];
  runtimes: Record<string, ProjectRuntime>;
  logs: Record<string, TerminalLog[]>;
  miniApps: MiniApp[];
  settings: AppSettings;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onRunProject: (project: ProjectConfig) => void;
  onStopProject: (projectId: string) => void;
  onRunCommand: (command: string, cwd?: string) => void;
  onOpenProjectTab: (project: ProjectConfig) => void;
  currentTheme?: string;
}

const FREE_MODELS = [
  { id: 'openrouter/free', label: 'openrouter/free (Universal Free AI Router)', badge: 'FREE' },
  { id: 'openrouter/auto', label: 'openrouter/auto (Auto Best Available)', badge: 'AUTO' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', badge: 'PAID' },
  { id: 'openai/gpt-4o', label: 'OpenAI GPT-4o', badge: 'PAID' },
  { id: 'qwen/qwen3.8-27b:free', label: 'Qwen 3.8 27B Free', badge: 'FREE' },
  { id: 'google/gemma-4-26b-a4b-it:free', label: 'Google Gemma 4 26B Free', badge: 'FREE' },
];

export const PersonalAIAgentView: React.FC<PersonalAIAgentViewProps> = ({
  projects,
  runtimes,
  logs,
  miniApps,
  settings,
  onSaveSettings,
  onRunProject,
  onStopProject,
  onRunCommand,
  onOpenProjectTab,
  currentTheme = 'nova-dark',
}) => {
  const isLight = currentTheme === 'soft-light';

  // Mode View: Single Specialist Copilot vs Multi-Agent Autonomous Roundtable
  const [viewMode, setViewMode] = useState<'copilot' | 'roundtable'>('copilot');

  // Custom AI Agents State & Active Selection
  const [customAgents, setCustomAgents] = useState<PersonalAIAgentConfig[]>(() => {
    try {
      const saved = localStorage.getItem('devworkspace_custom_agents');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return settings.customAgents || [];
  });

  const [activeAgentId, setActiveAgentId] = useState<string>(
    settings.activeAgentId || 'agent-master-ai'
  );

  const [isAgentMenuOpen, setIsAgentMenuOpen] = useState(false);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [builderCategoryFilter, setBuilderCategoryFilter] = useState<'all' | 'core' | 'admin' | 'tech' | 'creative' | 'finance'>('all');

  const [agentForm, setAgentForm] = useState<Partial<PersonalAIAgentConfig>>({
    name: '',
    role: '',
    systemPrompt: '',
    selectedModel: 'openrouter/free',
    temperature: 0.3,
    badgeColor: '#5E6AD2',
    miniatureShape: 'realistic-sphere',
    miniatureColor: '#ffffff',
    eyeStyle: 'normal',
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  const allAgents = [...BUILTIN_AGENTS, ...customAgents];
  const activeAgent = allAgents.find((a) => a.id === activeAgentId) || BUILTIN_AGENTS[0];

  // Agent configuration & permissions
  const [config, setConfig] = useState<PersonalAIAgentConfig>(
    activeAgent || settings.aiAgentConfig || BUILTIN_AGENTS[0]
  );
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  // Sync activeAgent to config
  useEffect(() => {
    setConfig(activeAgent);
  }, [activeAgentId, customAgents]);

  // Chat state
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      agentId: activeAgent.id,
      agentName: activeAgent.name,
      agentRole: activeAgent.role,
      miniatureShape: activeAgent.miniatureShape || 'realistic-sphere',
      miniatureColor: activeAgent.miniatureColor || activeAgent.badgeColor,
      content: `Hello! I am **${activeAgent.name}** (${activeAgent.role}). I am connected to your workspace with live monitoring over your repositories, terminal logs, and running servers. What would you like to build or inspect?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved chat messages on mount
  useEffect(() => {
    const loadSavedHistory = async () => {
      if (window.electronAPI) {
        try {
          const store = await window.electronAPI.getStoreData();
          if (store.agentMessages && store.agentMessages.length > 0) {
            setMessages(store.agentMessages);
          }
          if (store.settings?.aiAgentConfig) {
            setConfig(store.settings.aiAgentConfig);
          }
        } catch (_) {}
      }
    };
    loadSavedHistory();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, viewMode]);

  // Persist messages to store
  const updateMessages = (newMessages: AgentChatMessage[]) => {
    setMessages(newMessages);
    if (window.electronAPI) {
      window.electronAPI.saveAgentMessages(newMessages.slice(-50));
    }
  };

  // Toggle individual permissions
  const handleTogglePermission = (key: keyof PersonalAIAgentPermissions) => {
    const updatedPermissions = {
      ...config.permissions,
      [key]: !config.permissions[key],
    };
    const updatedConfig = { ...config, permissions: updatedPermissions };
    setConfig(updatedConfig);
    onSaveSettings({ aiAgentConfig: updatedConfig });
  };

  // Toggle master access switch
  const handleToggleMasterAccess = () => {
    const newMaster = !config.permissions.masterAccess;
    const updatedPermissions = {
      ...config.permissions,
      masterAccess: newMaster,
    };
    const updatedConfig = { ...config, permissions: updatedPermissions };
    setConfig(updatedConfig);
    onSaveSettings({ aiAgentConfig: updatedConfig });
  };

  // Custom Agent Builder Actions
  const handleOpenCreateAgent = () => {
    setAgentForm({
      name: '',
      role: '',
      systemPrompt: '',
      selectedModel: 'openrouter/free',
      temperature: 0.3,
      badgeColor: '#5E6AD2',
      miniatureShape: 'realistic-sphere',
      miniatureColor: '#ffffff',
      eyeStyle: 'normal',
      permissions: { ...DEFAULT_PERMISSIONS },
    });
    setBuilderCategoryFilter('all');
    setIsBuilderModalOpen(true);
    setIsAgentMenuOpen(false);
  };

  const handleOpenEditAgent = (agent: PersonalAIAgentConfig) => {
    setAgentForm({
      ...agent,
      miniatureShape: agent.miniatureShape || 'circle',
      miniatureColor: agent.miniatureColor || agent.badgeColor || '#5E6AD2',
      eyeStyle: agent.eyeStyle || 'normal',
    });
    setBuilderCategoryFilter('all');
    setIsBuilderModalOpen(true);
    setIsAgentMenuOpen(false);
  };

  const handleSaveCustomAgent = () => {
    if (!agentForm.name?.trim()) return;
    const agentToSave: PersonalAIAgentConfig = {
      id: agentForm.id || `agent-custom-${Date.now()}`,
      name: agentForm.name.trim(),
      role: agentForm.role?.trim() || 'Custom AI Specialist',
      systemPrompt: agentForm.systemPrompt?.trim() || 'You are an expert AI assistant dedicated to optimizing the workspace.',
      selectedModel: agentForm.selectedModel || 'openrouter/free',
      temperature: typeof agentForm.temperature === 'number' ? agentForm.temperature : 0.3,
      badgeColor: agentForm.miniatureColor || agentForm.badgeColor || '#5E6AD2',
      miniatureShape: agentForm.miniatureShape || 'realistic-sphere',
      miniatureColor: agentForm.miniatureColor || agentForm.badgeColor || '#ffffff',
      eyeStyle: agentForm.eyeStyle || 'normal',
      permissions: agentForm.permissions || { ...DEFAULT_PERMISSIONS },
    };

    let updated: PersonalAIAgentConfig[];
    if (customAgents.some((a) => a.id === agentToSave.id)) {
      updated = customAgents.map((a) => (a.id === agentToSave.id ? agentToSave : a));
    } else {
      updated = [...customAgents, agentToSave];
    }

    setCustomAgents(updated);
    setActiveAgentId(agentToSave.id || 'agent-master-ai');
    setConfig(agentToSave);
    setIsBuilderModalOpen(false);

    try {
      localStorage.setItem('devworkspace_custom_agents', JSON.stringify(updated));
    } catch (_) {}

    onSaveSettings({
      customAgents: updated,
      activeAgentId: agentToSave.id || 'agent-master-ai',
      aiAgentConfig: agentToSave,
    });
  };

  const handleDeleteCustomAgent = (idToDelete: string) => {
    const updated = customAgents.filter((a) => a.id !== idToDelete);
    setCustomAgents(updated);
    try {
      localStorage.setItem('devworkspace_custom_agents', JSON.stringify(updated));
    } catch (_) {}
    if (activeAgentId === idToDelete) {
      setActiveAgentId(BUILTIN_AGENTS[0].id || 'agent-master-ai');
      setConfig(BUILTIN_AGENTS[0]);
    }
    onSaveSettings({
      customAgents: updated,
      activeAgentId: BUILTIN_AGENTS[0].id || 'agent-master-ai',
      aiAgentConfig: BUILTIN_AGENTS[0],
    });
  };

  // Assemble real-time system context
  const buildSystemContext = (): string => {
    if (!config.permissions.masterAccess) {
      return 'MASTER_ACCESS_DISABLED: User has turned off all AI access to the workspace.';
    }

    const sections: string[] = [];

    // Projects Context
    if (config.permissions.readProjects) {
      const projectList = projects.map((p) => {
        const rt = runtimes[p.id];
        return `- Project ID: "${p.id}", Name: "${p.name}", Framework: ${p.framework || 'unknown'}, Command: "${p.command}", DefaultPort: ${p.defaultPort || 'none'}, Status: ${rt?.status || 'stopped'}, ActiveUrl: ${rt?.detectedUrl || 'none'}`;
      }).join('\n');
      sections.push(`### Added Repositories & Projects (${projects.length}):\n${projectList || 'No projects configured yet.'}`);
    } else {
      sections.push('### Projects: [PERMISSION DENIED by user]');
    }

    // Terminal Logs & Errors Context
    if (config.permissions.readTerminalLogs) {
      const activeErrors: string[] = [];
      for (const p of projects) {
        const pLogs = logs[p.id] || [];
        const errLogs = pLogs.filter((l) => l.type === 'stderr' || l.type === 'error');
        if (errLogs.length > 0) {
          const recentText = errLogs.slice(-5).map((l) => l.text).join('\n');
          activeErrors.push(`Error in ${p.name} (ID: ${p.id}):\n${recentText}`);
        }
      }

      if (activeErrors.length > 0) {
        sections.push(`### Recent Terminal Errors:\n${activeErrors.join('\n---\n')}`);
      } else {
        sections.push('### Terminal Status: All active servers running with zero detected errors.');
      }
    } else {
      sections.push('### Terminal Logs: [PERMISSION DENIED by user]');
    }

    // Mini-Apps Context
    if (config.permissions.readMiniApps) {
      const appList = miniApps.map((a) => `- Mini-App: "${a.name}" (${a.category}) -> ${a.url}`).join('\n');
      sections.push(`### Saved Web Mini-Apps:\n${appList || 'None'}`);
    }

    // Scraped News & GitHub Trending Context Access
    if (config.permissions.readNews) {
      sections.push('### Live Scraped News & GitHub Intelligence:\nRead access GRANTED to local TechCrunch, VentureBeat, and GitHub Trending SQLite database.');
    } else {
      sections.push('### Live Scraped News & GitHub Intelligence: [PERMISSION DENIED by user]');
    }

    return sections.join('\n\n');
  };

  // Send message to AI Agent
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMessage];
    updateMessages(nextMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const context = buildSystemContext();

      if (window.electronAPI) {
        const response = await window.electronAPI.chatWithPersonalAgent(
          nextMessages.map((m) => ({ role: m.role, content: m.content })),
          context,
          config.permissions,
          config.selectedModel
        );

        const aiMessage: AgentChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          agentId: activeAgent.id,
          agentName: activeAgent.name,
          agentRole: activeAgent.role,
          miniatureShape: activeAgent.miniatureShape || 'circle',
          miniatureColor: activeAgent.miniatureColor || activeAgent.badgeColor,
          content: response.reply,
          timestamp: Date.now(),
          suggestedAction: response.suggestedAction,
        };

        updateMessages([...nextMessages, aiMessage]);
      } else {
        // Direct browser call to OpenRouter API
        if (!config.permissions.masterAccess) {
          const aiMessage: AgentChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            agentId: activeAgent.id,
            agentName: activeAgent.name,
            agentRole: activeAgent.role,
            miniatureShape: activeAgent.miniatureShape || 'circle',
            miniatureColor: activeAgent.miniatureColor || activeAgent.badgeColor,
            content: `⚠️ **Personal AI Workspace Access is Disabled**\n\nThe master access switch is currently turned off. To allow the AI Agent to inspect your repositories, active servers, and terminal logs, switch **System Access to ON** in the permissions control bar.`,
            timestamp: Date.now(),
          };
          updateMessages([...nextMessages, aiMessage]);
          setIsLoading(false);
          return;
        }

        const apiKey = settings.openRouterApiKey || '';
        const modelToUse = config.selectedModel || settings.openRouterModel || 'openrouter/free';

        const systemPrompt = `You are ${activeAgent.name} (${activeAgent.role}).
${activeAgent.systemPrompt}
Live Workspace Context:
${context}

Instructions:
1. Provide concise, expert full-stack and DevOps guidance in Linear style.
2. If the user asks you to run, stop, or fix a project and Execute Commands permission is GRANTED, append an action tag:
[ACTION:RUN_PROJECT:projectId] or [ACTION:STOP_PROJECT:projectId] or [ACTION:RUN_COMMAND:shell command]
3. Format all code blocks with clean markdown.`;

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/DevWorkspace',
            'X-Title': 'DevWorkspace Personal AI Agent',
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              { role: 'system', content: systemPrompt },
              ...nextMessages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
            ],
            temperature: config.temperature || 0.3,
            max_tokens: 1500,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          let rawContent = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning || data.choices?.[0]?.text || 'I have analyzed your workspace context. All systems are operational.';
          
          let suggestedAction: AgentChatMessage['suggestedAction'] = undefined;
          const runProjMatch = rawContent.match(/\[ACTION:RUN_PROJECT:([^\]]+)\]/i);
          if (runProjMatch) {
            suggestedAction = { type: 'run_project', projectId: runProjMatch[1].trim(), label: 'Run Project Now' };
            rawContent = rawContent.replace(runProjMatch[0], '').trim();
          }

          const runCmdMatch = rawContent.match(/\[ACTION:RUN_COMMAND:([^\]]+)\]/i);
          if (runCmdMatch) {
            suggestedAction = { type: 'run_command', command: runCmdMatch[1].trim(), label: `Run: ${runCmdMatch[1].trim()}` };
            rawContent = runCmdMatch ? rawContent.replace(runCmdMatch[0], '').trim() : rawContent;
          }

          const aiMessage: AgentChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            agentId: activeAgent.id,
            agentName: activeAgent.name,
            agentRole: activeAgent.role,
            miniatureShape: activeAgent.miniatureShape || 'circle',
            miniatureColor: activeAgent.miniatureColor || activeAgent.badgeColor,
            content: rawContent,
            timestamp: Date.now(),
            suggestedAction,
          };
          updateMessages([...nextMessages, aiMessage]);
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error?.message || `OpenRouter API error (HTTP ${res.status})`;
          const aiMessage: AgentChatMessage = {
            id: `msg-${Date.now() + 1}`,
            role: 'assistant',
            agentId: activeAgent.id,
            agentName: activeAgent.name,
            agentRole: activeAgent.role,
            miniatureShape: activeAgent.miniatureShape || 'circle',
            miniatureColor: activeAgent.miniatureColor || activeAgent.badgeColor,
            content: `❌ **AI Request Failed**\n\n${errMsg}\n\nPlease check your API key in Workspace Settings or choose another model.`,
            timestamp: Date.now(),
          };
          updateMessages([...nextMessages, aiMessage]);
        }
      }
    } catch (err: any) {
      const aiMessage: AgentChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        agentRole: activeAgent.role,
        miniatureShape: activeAgent.miniatureShape || 'circle',
        miniatureColor: activeAgent.miniatureColor || activeAgent.badgeColor,
        content: `❌ **Connection Error**: ${err?.message || 'Failed to reach AI service'}.`,
        timestamp: Date.now(),
      };
      updateMessages([...nextMessages, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChatHistory = () => {
    const fresh: AgentChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        agentRole: activeAgent.role,
        miniatureShape: activeAgent.miniatureShape || 'realistic-sphere',
        miniatureColor: activeAgent.miniatureColor || activeAgent.badgeColor,
        content: `Chat session refreshed. Ready to assist with your workspace tasks!`,
        timestamp: Date.now(),
      },
    ];
    updateMessages(fresh);
  };

  const quickPrompts = [
    { icon: Newspaper, label: 'Top 5 tech news today', prompt: 'Give me the top 5 tech news today' },
    { icon: Star, label: 'Trending on GitHub', prompt: 'What is trending on GitHub right now?' },
    { icon: Server, label: 'Check servers & ports', prompt: 'Inspect all running servers and ports.' },
    { icon: Terminal, label: 'Check terminal errors', prompt: 'Check active terminal logs for any build errors.' },
    { icon: Shield, label: 'Security review', prompt: 'Review our codebase security vulnerabilities and token protections.' },
  ];

  // Filtered catalog shapes for builder
  const filteredShapes = MINIATURE_CATALOG.filter((item) => {
    if (builderCategoryFilter === 'all') return true;
    return item.category === builderCategoryFilter;
  });

  return (
    <div className={`flex-1 flex overflow-hidden select-none transition-colors duration-200 relative ${
      isLight ? 'bg-[#F7F7F8] text-zinc-900' : 'bg-[#080809] text-[#EDEDED]'
    }`}>
      {/* ================= LEFT PANE: MASTER AI SHOWCASE & LIVE CONTEXT ================= */}
      <div className={`w-1/2 hidden lg:flex flex-col border-r overflow-y-auto no-scrollbar p-6 lg:p-8 ${
        isLight ? 'border-black/[0.06] bg-white' : 'border-white/[0.06] bg-[#0A0A0C]'
      }`}>
        {/* Workspace Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-[#8A8F98] pb-3">
          <img src={appLogo} alt="logo" className="w-3.5 h-3.5 rounded-full object-contain shrink-0" />
          <span className={`font-semibold tracking-tight ${isLight ? 'text-zinc-700' : 'text-[#EDEDED]'}`}>AI Platform</span>
          <span className="text-[#686870]">/</span>
          <span>Miniature Copilots</span>
        </div>

        {/* Hero Card: Signature Master AI / Active Agent Showcase */}
        <div className={`p-6 rounded-3xl border mb-6 relative overflow-hidden transition-all ${
          isLight 
            ? 'bg-zinc-50 border-black/10 shadow-sm' 
            : 'bg-[#121216] border-white/[0.08] shadow-lg'
        }`}>
          <div className="flex items-center space-x-6">
            <div className="shrink-0 p-2">
              <AgentMiniature
                shape={activeAgent.miniatureShape || 'realistic-sphere'}
                color={activeAgent.miniatureColor || activeAgent.badgeColor}
                size="lg"
                eyeStyle={activeAgent.eyeStyle || 'normal'}
                isSpeaking={isLoading}
                isLight={isLight}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {activeAgent.name}
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  isLight ? 'bg-zinc-100 text-zinc-800 border-zinc-200' : 'bg-white/[0.08] text-[#EDEDED] border-white/[0.12]'
                }`}>
                  ACTIVE
                </span>
              </div>
              <p className={`text-xs mt-1 font-medium ${isLight ? 'text-zinc-600' : 'text-[#8A8F98]'}`}>
                {activeAgent.role}
              </p>
              <p className={`text-[11px] mt-1.5 leading-relaxed line-clamp-2 ${isLight ? 'text-zinc-500' : 'text-[#686872]'}`}>
                {activeAgent.description || activeAgent.systemPrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Specialized Agents Miniature Gallery */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8A8F98]">
              Specialist Agent Roster ({allAgents.length})
            </h2>
            <button
              onClick={handleOpenCreateAgent}
              className={`text-[11px] font-bold ${isLight ? 'text-zinc-700 hover:text-black' : 'text-[#EDEDED] hover:text-white'} flex items-center space-x-1`}
            >
              <Plus className="w-3 h-3" />
              <span>Create Custom Agent</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {allAgents.slice(0, 6).map((agent) => {
              const isActive = agent.id === activeAgentId;
              return (
                <div
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id || '')}
                  className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                    isActive
                      ? isLight
                        ? 'bg-zinc-100 border-zinc-300 shadow-sm'
                        : 'bg-[#1C1C20] border-white/20 shadow-sm'
                      : isLight
                      ? 'bg-zinc-50 border-black/5 hover:border-black/15'
                      : 'bg-[#121216] border-white/5 hover:border-white/10'
                  }`}
                >
                  <AgentMiniature
                    shape={agent.miniatureShape || 'circle'}
                    color={agent.miniatureColor || agent.badgeColor}
                    size="xs"
                    isLight={isLight}
                  />
                  <div className="min-w-0 flex-1 truncate">
                    <div className={`text-xs font-semibold truncate ${isActive ? (isLight ? 'text-zinc-950 font-bold' : 'text-white font-bold') : isLight ? 'text-zinc-800' : 'text-[#C8C8CC]'}`}>
                      {agent.name}
                    </div>
                    <div className="text-[10px] text-[#8A8F98] truncate">
                      {agent.role.split(' ')[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Workspace Context */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8A8F98]">
            Live Context
          </h2>

          <div className="space-y-2">
            {projects.slice(0, 3).map((p) => {
              const rt = runtimes[p.id];
              const isRunning = rt?.status === 'running';
              return (
                <div key={p.id} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                  isLight ? 'bg-zinc-50 border-black/[0.06]' : 'bg-[#121215] border-white/[0.07]'
                }`}>
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${
                      isRunning ? (isLight ? 'bg-zinc-200 text-zinc-900' : 'bg-white/10 text-white') : 'bg-white/[0.06] text-[#8A8F98]'
                    }`}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-medium ${isLight ? 'text-zinc-800' : 'text-[#EDEDED]'}`}>{p.name}</div>
                      <div className="text-[10px] text-[#686870] font-mono">{p.command}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    isRunning ? (isLight ? 'bg-zinc-200 text-zinc-900 font-medium' : 'bg-white/10 text-white font-medium') : 'bg-white/[0.04] text-[#686870]'
                  }`}>
                    {rt?.status || 'stopped'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANE: COPILOT OR MULTI-AGENT ROUNDTABLE ================= */}
      <div className={`flex-1 flex flex-col items-center justify-center p-3 lg:p-6 overflow-hidden ${
        isLight ? 'bg-[#F8F8FA]' : 'bg-[#080809]'
      }`}>
        <div className={`w-full max-w-2xl h-full max-h-[860px] flex flex-col linear-floating-window overflow-hidden ${
          isLight ? 'bg-white border-black/[0.1] shadow-xl' : 'bg-[#141416] border-white/[0.1] shadow-2xl'
        }`}>
          {/* Header & Mode Switcher */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            isLight ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-[#141416]'
          } relative shrink-0`}>
            {/* View Mode Switcher: Specialist vs Multi-Agent */}
            <div className={`flex items-center space-x-1 p-0.5 rounded-xl border ${
              isLight ? 'bg-zinc-100 border-black/5' : 'bg-white/[0.05] border-white/10'
            }`}>
              <button
                onClick={() => setViewMode('copilot')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'copilot'
                    ? isLight
                      ? 'bg-zinc-900 text-white font-bold shadow-sm'
                      : 'bg-white text-zinc-950 font-bold shadow-sm'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-950'
                    : 'text-[#8A8F98] hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Specialist Copilot</span>
              </button>

              <button
                onClick={() => setViewMode('roundtable')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'roundtable'
                    ? isLight
                      ? 'bg-zinc-900 text-white font-bold shadow-sm'
                      : 'bg-white text-zinc-950 font-bold shadow-sm'
                    : isLight
                    ? 'text-zinc-600 hover:text-zinc-950'
                    : 'text-[#8A8F98] hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Multi-Agent Roundtable</span>
                <span className={`text-[8px] px-1 py-0.2 rounded-full font-bold uppercase ${
                  isLight ? 'bg-zinc-200 text-zinc-800' : 'bg-white/[0.12] text-white'
                }`}>
                  Multi
                </span>
              </button>
            </div>

            {/* Agent Selector (When in Copilot Mode) */}
            {viewMode === 'copilot' ? (
              <div className="relative">
                <button
                  onClick={() => setIsAgentMenuOpen(!isAgentMenuOpen)}
                  className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg ${
                    isLight ? 'hover:bg-zinc-100' : 'hover:bg-white/[0.06]'
                  } transition-colors group`}
                  title="Switch or Create AI Agent"
                >
                  <AgentMiniature
                    shape={activeAgent.miniatureShape || 'circle'}
                    color={activeAgent.miniatureColor || activeAgent.badgeColor}
                    size="xs"
                    isSpeaking={isLoading}
                    isLight={isLight}
                  />
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-semibold ${
                      isLight ? 'text-zinc-900 group-hover:text-black' : 'text-[#EDEDED] group-hover:text-white'
                    } tracking-tight`}>
                      {activeAgent.name}
                    </span>
                    <ChevronDown className={`w-3 h-3 ${isLight ? 'text-zinc-400' : 'text-[#8A8F98]'} transition-transform ${isAgentMenuOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isAgentMenuOpen && (
                  <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl ${
                    isLight ? 'bg-white border-black/10 shadow-xl' : 'bg-[#141418] border-white/10 shadow-2xl'
                  } p-2 z-50 text-xs max-h-96 overflow-y-auto no-scrollbar`}>
                    <div className={`px-2.5 py-1 text-[10px] font-semibold ${
                      isLight ? 'text-zinc-400' : 'text-[#8A8F98]'
                    } uppercase tracking-wider`}>
                      Select Agent Preset
                    </div>

                    {allAgents.map((agent) => (
                      <div
                        key={agent.id}
                        onClick={() => {
                          setActiveAgentId(agent.id || '');
                          setIsAgentMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
                          activeAgentId === agent.id
                            ? isLight
                              ? 'bg-zinc-100 text-zinc-950 font-medium border border-zinc-200'
                              : 'bg-white/10 text-white font-medium border border-white/20'
                            : isLight
                            ? 'hover:bg-zinc-100 text-zinc-700'
                            : 'hover:bg-white/[0.05] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <AgentMiniature
                            shape={agent.miniatureShape || 'circle'}
                            color={agent.miniatureColor || agent.badgeColor}
                            size="xs"
                            isLight={isLight}
                          />
                          <div className="truncate">
                            <div className="font-semibold truncate">{agent.name}</div>
                            <div className={`text-[10px] truncate ${isLight ? 'text-zinc-400' : 'text-slate-400'}`}>{agent.role}</div>
                          </div>
                        </div>

                        {customAgents.some((c) => c.id === agent.id) && (
                          <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEditAgent(agent)}
                              className="p-1 hover:text-white text-slate-400"
                              title="Edit Custom Agent"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomAgent(agent.id || '')}
                              className="p-1 hover:text-rose-400 text-slate-400"
                              title="Delete Agent"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="my-1 border-t border-white/10" />

                    <button
                      onClick={handleOpenCreateAgent}
                      className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl font-bold transition-all shadow-md mt-1 ${
                        isLight
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                          : 'bg-white hover:bg-zinc-200 text-zinc-950'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Custom Agent</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Window Controls */}
            <div className="flex items-center space-x-2 text-[#8A8F98]">
              <button 
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                className="hover:text-white transition-colors p-1"
                title="Configure Agent & Permissions"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={clearChatHistory}
                className="hover:text-rose-400 transition-colors p-1"
                title="Clear Chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Section */}
          {viewMode === 'roundtable' ? (
            <MultiAgentRoundtable
              availableAgents={allAgents}
              projects={projects}
              settings={settings}
              currentTheme={currentTheme}
              onRunCommand={onRunCommand}
            />
          ) : (
            <div className={`flex-1 flex flex-col overflow-hidden ${isLight ? 'bg-white' : 'bg-[#141416]'}`}>
              {/* Optional Expanded Permissions Bar */}
              {isConfigExpanded && (
                <div className={`p-3 border-b ${
                  isLight ? 'border-black/[0.06] bg-zinc-50' : 'border-white/[0.08] bg-[#111114]'
                } text-xs space-y-2 shrink-0`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isLight ? 'text-zinc-800' : 'text-[#EDEDED]'}`}>Workspace System Permissions</span>
                    <button
                      onClick={handleToggleMasterAccess}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                        config.permissions.masterAccess
                          ? isLight
                            ? 'bg-zinc-900 text-white shadow-sm'
                            : 'bg-white text-zinc-950 shadow-sm'
                          : 'bg-rose-500/20 text-rose-500'
                      }`}
                    >
                      {config.permissions.masterAccess ? 'SYSTEM ACCESS: ON' : 'SYSTEM ACCESS: OFF'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      onClick={() => handleTogglePermission('readProjects')}
                      className={`p-1.5 rounded-lg text-left border transition-all flex items-center space-x-1.5 ${
                        config.permissions.readProjects
                          ? isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200 font-medium' : 'bg-[#1C1C20] text-[#EDEDED] border-white/15 font-medium'
                          : isLight ? 'bg-transparent border-black/5 text-zinc-400 opacity-60' : 'bg-transparent border-white/5 opacity-50 text-[#8A8F98]'
                      }`}
                    >
                      <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Repositories ({projects.length})</span>
                    </button>
                    <button
                      onClick={() => handleTogglePermission('readTerminalLogs')}
                      className={`p-1.5 rounded-lg text-left border transition-all flex items-center space-x-1.5 ${
                        config.permissions.readTerminalLogs
                          ? isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200 font-medium' : 'bg-[#1C1C20] text-[#EDEDED] border-white/15 font-medium'
                          : isLight ? 'bg-transparent border-black/5 text-zinc-400 opacity-60' : 'bg-transparent border-white/5 opacity-50 text-[#8A8F98]'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Terminal Logs</span>
                    </button>
                    <button
                      onClick={() => handleTogglePermission('executeCommands')}
                      className={`p-1.5 rounded-lg text-left border transition-all flex items-center space-x-1.5 ${
                        config.permissions.executeCommands
                          ? isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200 font-medium' : 'bg-[#1C1C20] text-[#EDEDED] border-white/15 font-medium'
                          : isLight ? 'bg-transparent border-black/5 text-zinc-400 opacity-60' : 'bg-transparent border-white/5 opacity-50 text-[#8A8F98]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">1-Click Run & Shell</span>
                    </button>
                    <button
                      onClick={() => handleTogglePermission('readMiniApps')}
                      className={`p-1.5 rounded-lg text-left border transition-all flex items-center space-x-1.5 ${
                        config.permissions.readMiniApps
                          ? isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200 font-medium' : 'bg-[#1C1C20] text-[#EDEDED] border-white/15 font-medium'
                          : isLight ? 'bg-transparent border-black/5 text-zinc-400 opacity-60' : 'bg-transparent border-white/5 opacity-50 text-[#8A8F98]'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Mini-Apps ({miniApps.length})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Message Stream */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar ${
                isLight ? 'bg-zinc-50/50' : 'bg-transparent'
              }`}>
                {messages.map((msg) => {
                  if (msg.role === 'user') {
                    return (
                      <div key={msg.id} className="flex justify-end pt-1">
                        <div className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed border shadow-sm ${
                          isLight
                            ? 'bg-zinc-100 border-black/[0.06] text-zinc-900'
                            : 'bg-[#222226] border-white/[0.08] text-[#EDEDED]'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex items-start space-x-3 max-w-xl pt-1">
                      {/* Animated Miniature Avatar */}
                      <div className="shrink-0 pt-0.5">
                        <AgentMiniature
                          shape={msg.miniatureShape || activeAgent.miniatureShape || 'realistic-sphere'}
                          color={msg.miniatureColor || activeAgent.miniatureColor || activeAgent.badgeColor}
                          size="xs"
                          eyeStyle={activeAgent.eyeStyle || 'normal'}
                          isSpeaking={isLoading && msg.id === messages[messages.length - 1]?.id}
                          isLight={isLight}
                        />
                      </div>

                      {/* Content Bubble */}
                      <div className={`flex-1 rounded-2xl p-4 border text-xs leading-relaxed shadow-sm relative group ${
                        isLight
                          ? 'bg-white border-black/[0.08] text-zinc-800'
                          : 'bg-[#141418] border-white/[0.08] text-[#EDEDED]'
                      }`}>
                        <div className={`flex items-center justify-between pb-1.5 mb-1.5 border-b ${
                          isLight ? 'border-black/[0.06]' : 'border-white/[0.06]'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs" style={{ color: msg.miniatureColor || (isLight ? '#18181B' : '#EDEDED') }}>
                              {msg.agentName || activeAgent.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {msg.agentRole || activeAgent.role.split(' ')[0]}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Interactive Action Tag */}
                        {msg.suggestedAction && (
                          <div className="pt-2">
                            {msg.suggestedAction.type === 'run_project' && msg.suggestedAction.projectId && (
                              <button
                                onClick={() => {
                                  const p = projects.find((proj) => proj.id === msg.suggestedAction?.projectId);
                                  if (p) onRunProject(p);
                                }}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${
                                  isLight ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white hover:bg-zinc-200 text-zinc-950 font-bold'
                                } text-xs font-semibold shadow-sm transition-all`}
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>{msg.suggestedAction.label || 'Run Project'}</span>
                              </button>
                            )}
                            {msg.suggestedAction.type === 'run_command' && msg.suggestedAction.command && (
                              <button
                                onClick={() => onRunCommand?.(msg.suggestedAction!.command!)}
                                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1C1C20] hover:bg-[#25252B] text-[#EDEDED] border border-white/10 text-xs font-medium transition-all"
                              >
                                <Zap className="w-3 h-3 text-[#F5A623]" />
                                <span>{msg.suggestedAction.label}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center space-x-2 text-[#8A8F98] text-xs py-2">
                    <AgentMiniature
                      shape={activeAgent.miniatureShape || 'realistic-sphere'}
                      size="xs"
                      isSpeaking={true}
                      isLight={isLight}
                    />
                    <span>{activeAgent.name} is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className={`p-3 border-t ${
                isLight ? 'border-black/[0.08] bg-white' : 'border-white/[0.08] bg-[#141416]'
              } shrink-0`}>
                {/* Quick Prompts */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-2">
                  {quickPrompts.map((qp, idx) => {
                    const IconComp = qp.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qp.prompt)}
                        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] ${
                          isLight
                            ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-black/5'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] text-[#8A8F98] hover:text-[#EDEDED] border-white/[0.05]'
                        } transition-all shrink-0`}
                      >
                        <IconComp className="w-3 h-3 text-[#8A8F98]" />
                        <span>{qp.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={`rounded-xl ${
                  isLight ? 'bg-zinc-50 border-black/10 focus-within:border-zinc-400' : 'bg-[#18181B] border-white/[0.08] focus-within:border-white/20'
                } p-2.5 transition-all`}>
                  <textarea
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message ${activeAgent.name}...`}
                    rows={2}
                    className={`w-full bg-transparent text-xs ${
                      isLight ? 'text-zinc-900 placeholder:text-zinc-400' : 'text-[#EDEDED] placeholder-[#686870]'
                    } outline-none resize-none leading-relaxed`}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] ${isLight ? 'text-zinc-400' : 'text-[#686870]'}`}>
                      Press Enter to send, Shift+Enter for new line
                    </span>

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputPrompt.trim() || isLoading}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md ${
                        isLight
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                          : 'bg-white hover:bg-zinc-200 text-zinc-950 font-bold'
                      }`}
                      title="Send Message"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= CUSTOM AGENT BUILDER MODAL WITH VISUAL MINIATURE PICKER ================= */}
      {isBuilderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 text-xs flex flex-col max-h-[92vh] ${
            isLight ? 'bg-white border-black/10 text-zinc-900 shadow-xl' : 'bg-[#141418] border-white/10 text-[#EDEDED] shadow-2xl'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-4 border-b shrink-0 ${
              isLight ? 'border-black/[0.08]' : 'border-white/10'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="p-1">
                  <AgentMiniature
                    shape={agentForm.miniatureShape || 'realistic-sphere'}
                    color={agentForm.miniatureColor || agentForm.badgeColor || '#ffffff'}
                    size="sm"
                    eyeStyle={agentForm.eyeStyle || 'normal'}
                    isSpeaking={true}
                    isLight={isLight}
                  />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                    {agentForm.id ? 'Configure Custom Agent' : 'Create Custom AI Miniature Agent'}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>Pick a shape avatar, customize personality, and assign permissions</p>
                </div>
              </div>

              <button
                onClick={() => setIsBuilderModalOpen(false)}
                className={`p-1 transition-colors ${isLight ? 'text-zinc-400 hover:text-zinc-900' : 'text-[#8A8F98] hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="space-y-4 overflow-y-auto no-scrollbar py-4 pr-1 flex-1">
              {/* Hero Live Miniature Creature Preview */}
              <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden ${
                isLight ? 'bg-zinc-50 border-black/10' : 'bg-white/[0.03] border-white/10'
              }`}>
                <AgentMiniature
                  shape={agentForm.miniatureShape || 'realistic-sphere'}
                  color={agentForm.miniatureColor || agentForm.badgeColor || '#ffffff'}
                  size="lg"
                  eyeStyle={agentForm.eyeStyle || 'normal'}
                  isSpeaking={true}
                  isLight={isLight}
                />
                <span className={`mt-2 text-xs font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {agentForm.name || 'Unnamed Creature'}
                </span>
                <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-500' : 'text-slate-400'}`}>
                  {agentForm.role || 'Specialist Role'} · Shape: {agentForm.miniatureShape || 'realistic-sphere'}
                </span>
              </div>

              {/* Visual Miniature Shape Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Choose Miniature Avatar Shape (40+ Shapes)
                  </label>

                  {/* Category Filter Tabs */}
                  <div className={`flex items-center space-x-1 p-0.5 rounded-lg border text-[10px] ${
                    isLight ? 'bg-zinc-100 border-black/5' : 'bg-white/[0.05] border-white/10'
                  }`}>
                    {(['all', 'core', 'admin', 'tech', 'creative', 'finance'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setBuilderCategoryFilter(cat)}
                        className={`px-2 py-0.5 rounded capitalize font-medium transition-all ${
                          builderCategoryFilter === cat 
                            ? isLight ? 'bg-zinc-900 text-white font-bold' : 'bg-white text-zinc-950 font-bold'
                            : isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape Grid */}
                <div className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-3 rounded-2xl border max-h-48 overflow-y-auto no-scrollbar ${
                  isLight ? 'bg-zinc-50 border-black/[0.08]' : 'bg-[#0F0F13] border-white/10'
                }`}>
                  {filteredShapes.map((shape) => {
                    const isSelected = agentForm.miniatureShape === shape.id;
                    return (
                      <div
                        key={shape.id}
                        onClick={() => {
                          setAgentForm({
                            ...agentForm,
                            miniatureShape: shape.id,
                            miniatureColor: shape.defaultColor,
                            badgeColor: shape.defaultColor,
                            name: agentForm.name || shape.name,
                            role: agentForm.role || shape.role,
                          });
                        }}
                        className={`flex flex-col items-center p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? isLight ? 'bg-zinc-100 border-zinc-900 shadow-md scale-105' : 'bg-white/[0.12] border-white/40 scale-105 shadow-md'
                            : isLight
                            ? 'bg-white border-black/5 hover:border-black/20 shadow-sm'
                            : 'bg-white/[0.03] border-white/5 hover:border-white/20'
                        }`}
                        title={`${shape.name} (${shape.desc})`}
                      >
                        <AgentMiniature
                          shape={shape.id}
                          color={shape.defaultColor}
                          size="xs"
                          isLight={isLight}
                        />
                        <span className={`text-[9px] mt-1 text-center truncate w-full ${
                          isSelected ? (isLight ? 'text-zinc-950 font-bold' : 'text-white font-bold') : isLight ? 'text-zinc-600' : 'text-slate-400'
                        }`}>
                          {shape.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Eye Style & Color Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Eye Animation Style
                  </label>
                  <div className="flex items-center space-x-1.5">
                    {[
                      { id: 'normal', label: 'Blink (5s)' },
                      { id: 'fast-blink', label: 'Fast Blink (3s)' },
                      { id: 'no-look', label: 'Laser Focus' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAgentForm({ ...agentForm, eyeStyle: opt.id as any })}
                        className={`flex-1 py-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                          (agentForm.eyeStyle || 'normal') === opt.id
                            ? isLight ? 'bg-zinc-900 text-white font-bold border-zinc-900' : 'bg-white text-zinc-950 font-bold border-white'
                            : isLight
                            ? 'bg-zinc-100 border-black/5 text-zinc-600 hover:text-zinc-950'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Color Accent
                  </label>
                  <div className="flex items-center space-x-2">
                    {['#ffffff', '#5E6AD2', '#818cf8', '#10b981', '#f59e0b', '#e11d48', '#ec4899'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAgentForm({ ...agentForm, miniatureColor: c, badgeColor: c })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          agentForm.miniatureColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & Role Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={agentForm.name || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                    placeholder="e.g. Master Orchestrator, DevOps Lead"
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isLight 
                        ? 'bg-zinc-50 border-black/10 focus:border-zinc-400 text-zinc-900 placeholder:text-zinc-400' 
                        : 'bg-white/[0.05] border-white/10 focus:border-white/30 text-white placeholder-slate-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Role & Specialty Title
                  </label>
                  <input
                    type="text"
                    value={agentForm.role || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, role: e.target.value })}
                    placeholder="e.g. Kubernetes & Docker Architect"
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isLight 
                        ? 'bg-zinc-50 border-black/10 focus:border-zinc-400 text-zinc-900 placeholder:text-zinc-400' 
                        : 'bg-white/[0.05] border-white/10 focus:border-white/30 text-white placeholder-slate-500'
                    }`}
                  />
                </div>
              </div>

              {/* System Persona Prompt */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                  System Persona Prompt
                </label>
                <textarea
                  rows={3}
                  value={agentForm.systemPrompt || ''}
                  onChange={(e) => setAgentForm({ ...agentForm, systemPrompt: e.target.value })}
                  placeholder="Instructions for how this agent should think, inspect code, diagnose errors, and guide you..."
                  className={`w-full px-3 py-2 rounded-xl border outline-none resize-none leading-relaxed font-mono text-[11px] ${
                    isLight 
                      ? 'bg-zinc-50 border-black/10 focus:border-zinc-400 text-zinc-900 placeholder:text-zinc-400' 
                      : 'bg-white/[0.05] border-white/10 focus:border-white/30 text-white placeholder-slate-500'
                  }`}
                />
              </div>

              {/* AI Model & Temperature */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    AI Model
                  </label>
                  <select
                    value={agentForm.selectedModel || 'openrouter/free'}
                    onChange={(e) => setAgentForm({ ...agentForm, selectedModel: e.target.value })}
                    className={`w-full px-2.5 py-2 rounded-xl border outline-none font-mono text-[11px] ${
                      isLight 
                        ? 'bg-zinc-50 border-black/10 focus:border-zinc-400 text-zinc-900' 
                        : 'bg-white/[0.05] border-white/10 focus:border-white/30 text-white'
                    }`}
                  >
                    {FREE_MODELS.map((m) => (
                      <option key={m.id} value={m.id} className={isLight ? 'bg-white text-zinc-900' : 'bg-[#141418] text-white'}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                    Creativity (Temp): {agentForm.temperature ?? 0.3}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={agentForm.temperature ?? 0.3}
                    onChange={(e) => setAgentForm({ ...agentForm, temperature: parseFloat(e.target.value) })}
                    className={`w-full mt-2 ${isLight ? 'accent-zinc-900' : 'accent-white'}`}
                  />
                </div>
              </div>

              {/* Workspace Permissions */}
              <div>
                <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                  Workspace Access Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {[
                    { key: 'readProjects', label: 'Inspect Projects & Repos' },
                    { key: 'readTerminalLogs', label: 'Read Live Terminal Logs' },
                    { key: 'executeCommands', label: '1-Click Run & Commands' },
                    { key: 'readMiniApps', label: 'Access Web Mini-Apps' },
                  ].map((p) => {
                    const isChecked = Boolean(agentForm.permissions?.[p.key as keyof PersonalAIAgentPermissions]);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => {
                          const perms = { ...(agentForm.permissions || DEFAULT_PERMISSIONS) };
                          perms[p.key as keyof PersonalAIAgentPermissions] = !perms[p.key as keyof PersonalAIAgentPermissions];
                          setAgentForm({ ...agentForm, permissions: perms });
                        }}
                        className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition-colors ${
                          isChecked 
                            ? isLight 
                              ? 'bg-zinc-100 border-zinc-300 text-zinc-950 font-medium' 
                              : 'bg-white/[0.10] border-white/20 text-white font-medium'
                            : isLight 
                            ? 'bg-zinc-50 border-black/5 text-zinc-500' 
                            : 'bg-white/[0.02] border-white/5 text-[#8A8F98]'
                        }`}
                      >
                        <CheckSquare className={`w-3.5 h-3.5 ${isChecked ? (isLight ? 'text-zinc-900' : 'text-white') : isLight ? 'text-zinc-300' : 'text-slate-600'}`} />
                        <span className="truncate">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex items-center justify-between pt-3 border-t shrink-0 ${
              isLight ? 'border-black/[0.08]' : 'border-white/10'
            }`}>
              {agentForm.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (agentForm.id) handleDeleteCustomAgent(agentForm.id);
                    setIsBuilderModalOpen(false);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Agent</span>
                </button>
              )}
              <div className="flex items-center space-x-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsBuilderModalOpen(false)}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors ${
                    isLight ? 'hover:bg-zinc-100 text-zinc-600' : 'hover:bg-white/[0.08] text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomAgent}
                  disabled={!agentForm.name?.trim()}
                  className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-xl font-bold shadow-md transition-all disabled:opacity-50 ${
                    isLight
                      ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                      : 'bg-white hover:bg-zinc-200 text-zinc-950'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Agent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
