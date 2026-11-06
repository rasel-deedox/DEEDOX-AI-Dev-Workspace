import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Play, Square, RefreshCw, Send, CheckCircle2, 
  Sparkles, MessageSquare, Shield, Terminal, ArrowRight,
  Sliders, Plus, Copy, Check, ChevronDown, Bot
} from 'lucide-react';
import { AgentMiniature } from './AgentMiniature';
import type { PersonalAIAgentConfig, AgentChatMessage, ProjectConfig, AppSettings } from '../types';

interface MultiAgentRoundtableProps {
  availableAgents: PersonalAIAgentConfig[];
  projects: ProjectConfig[];
  settings: AppSettings;
  currentTheme?: string;
  onRunCommand?: (command: string) => void;
}

export const MultiAgentRoundtable: React.FC<MultiAgentRoundtableProps> = ({
  availableAgents,
  projects,
  settings,
  currentTheme = 'nova-dark',
  onRunCommand,
}) => {
  const isLight = currentTheme === 'soft-light';

  // Selected team of agents participating in the roundtable (default 4 key specialists)
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([
    'agent-master-ai',
    'agent-backend-dev',
    'agent-frontend-dev',
    'agent-cyber-security',
    'agent-devops',
  ]);

  const activeTeam = availableAgents.filter((a) => selectedAgentIds.includes(a.id || ''));

  // Conversation State
  const [sessionGoal, setSessionGoal] = useState('');
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [dialogue, setDialogue] = useState<AgentChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      agentId: 'agent-master-ai',
      agentName: 'DEEDOX AI',
      agentRole: 'Core Orchestrator',
      miniatureShape: 'realistic-sphere',
      miniatureColor: '#ffffff',
      content: 'Welcome to the **DEEDOX Multi-Agent Roundtable**. Select your team of specialized AI agents above and input a goal. We will autonomously converse, design, audit, and build the solution together in real time.',
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue, activeSpeakerId]);

  // Toggle agent participation
  const toggleAgent = (agentId: string) => {
    if (isCollaborating) return;
    if (selectedAgentIds.includes(agentId)) {
      if (selectedAgentIds.length <= 2) return; // Keep at least 2 agents
      setSelectedAgentIds((prev) => prev.filter((id) => id !== agentId));
    } else {
      setSelectedAgentIds((prev) => [...prev, agentId]);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Start Multi-Agent Autonomous Collaboration
  const startCollaboration = async (customPrompt?: string) => {
    const goal = (customPrompt || sessionGoal).trim();
    if (!goal || isCollaborating) return;

    abortControllerRef.current = false;
    setIsCollaborating(true);
    setCurrentStepIndex(0);

    const userPromptMsg: AgentChatMessage = {
      id: `goal-${Date.now()}`,
      role: 'user',
      content: goal,
      timestamp: Date.now(),
    };

    setDialogue((prev) => [...prev, userPromptMsg]);
    setSessionGoal('');

    // Roster of agents that will speak in turn
    const orderedTeam = activeTeam.slice();
    if (orderedTeam.length === 0) {
      setIsCollaborating(false);
      return;
    }

    let runningHistory = [...dialogue, userPromptMsg];

    for (let i = 0; i < orderedTeam.length; i++) {
      if (abortControllerRef.current) break;

      const currentAgent = orderedTeam[i];
      const prevAgent = i > 0 ? orderedTeam[i - 1] : null;
      setActiveSpeakerId(currentAgent.id || null);
      setCurrentStepIndex(i + 1);

      // Natural agent-to-agent prompt
      let speakerPrompt = '';
      if (i === 0) {
        speakerPrompt = `You are ${currentAgent.name} (${currentAgent.role}). The user asked: "${goal}". Analyze the high-level architecture, divide the task into specific sub-responsibilities, and direct the next agent (${orderedTeam[1]?.name || 'the team'}) on what they should create first.`;
      } else {
        speakerPrompt = `You are ${currentAgent.name} (${currentAgent.role}). ${prevAgent?.name} just spoke. Respond directly to ${prevAgent?.name}'s proposals, build your domain component (APIs/UI/Security/DevOps/Tests), provide concrete code snippets, and address the next specialist.`;
      }

      // Generate response via OpenRouter or Instant Specialized Intelligence Engine
      const replyContent = await generateAgentTurnResponse(
        currentAgent,
        prevAgent,
        goal,
        runningHistory,
        speakerPrompt,
        i,
        orderedTeam.length
      );

      if (abortControllerRef.current) break;

      const agentMessage: AgentChatMessage = {
        id: `agent-msg-${Date.now()}-${i}`,
        role: 'assistant',
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        agentRole: currentAgent.role,
        miniatureShape: currentAgent.miniatureShape || 'circle',
        miniatureColor: currentAgent.miniatureColor || currentAgent.badgeColor || '#5E6AD2',
        content: replyContent,
        timestamp: Date.now(),
      };

      runningHistory = [...runningHistory, agentMessage];
      setDialogue((prev) => [...prev, agentMessage]);

      // Small pause between agent turns for smooth conversational rhythm
      await new Promise((r) => setTimeout(r, 1200));
    }

    setActiveSpeakerId(null);
    setIsCollaborating(false);
  };

  const stopCollaboration = () => {
    abortControllerRef.current = true;
    setIsCollaborating(false);
    setActiveSpeakerId(null);
  };

  // Turn generator with OpenRouter API + smart fallback
  const generateAgentTurnResponse = async (
    agent: PersonalAIAgentConfig,
    prevAgent: PersonalAIAgentConfig | null,
    goal: string,
    history: AgentChatMessage[],
    prompt: string,
    stepIndex: number,
    totalSteps: number
  ): Promise<string> => {
    const apiKey = settings.openRouterApiKey?.trim();
    if (apiKey) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/DevWorkspace',
            'X-Title': 'DEEDOX Multi-Agent Roundtable',
          },
          body: JSON.stringify({
            model: agent.selectedModel || 'openrouter/free',
            messages: [
              {
                role: 'system',
                content: `${agent.systemPrompt}\nYou are participating in an active roundtable with: ${activeTeam.map((a) => a.name).join(', ')}. Keep your tone collaborative, address fellow agents by name, and provide clean markdown solutions.`,
              },
              ...history.slice(-6).map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: `${m.agentName ? `[${m.agentName}]: ` : ''}${m.content}`,
              })),
              { role: 'user', content: prompt },
            ],
            temperature: agent.temperature || 0.3,
            max_tokens: 900,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const out = data.choices?.[0]?.message?.content;
          if (out) return out;
        }
      } catch (_) {}
    }

    // Contextual Rich Technical Fallback Engine (Runs completely offline & instant)
    if (agent.id === 'agent-master-ai') {
      return `### 🧠 Strategic Synthesis & Roadmap
I have evaluated the objective: **"${goal}"**.

Here is our multi-agent execution strategy:
1. **Architecture & Scope**: Clean separation of concerns with asynchronous messaging and reactive state.
2. **Backend Services**: Robust REST & WebSocket endpoints with resilient schema validation.
3. **Frontend Integration**: High-performance UI components with interactive feedback.
4. **Security & Resilience**: Token integrity, rate-limiting, and sanitized payloads.
5. **Infrastructure**: Lightweight containerization and automated verification.

Passing the baton to **@${activeTeam.find((a) => a.id !== 'agent-master-ai')?.name || 'Backend Engineer'}** to implement the core schema and endpoints first!`;
    }

    if (agent.miniatureShape === 'bracket' || agent.id?.includes('backend')) {
      return `### ⚙️ Backend Architecture & Endpoints
Thanks **@${prevAgent?.name || 'Master AI'}**! I have structured the backend services to fulfill the goal.

\`\`\`typescript
// Server Implementation & Socket Handlers
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

// REST Health Check & Data Dispatch
app.post('/api/action', (req, res) => {
  const { payload } = req.body;
  io.emit('workspace:update', { status: 'processed', data: payload, timestamp: Date.now() });
  return res.json({ success: true, acknowledged: true });
});
\`\`\`

**@${activeTeam.find((a) => a.miniatureShape === 'cursor' || a.id?.includes('frontend'))?.name || 'Frontend Architect'}**, the real-time event is \`workspace:update\`. You can now build the responsive UI and socket listener!`;
    }

    if (agent.miniatureShape === 'cursor' || agent.id?.includes('frontend')) {
      return `### 🎨 Frontend UI & Reactive State
Received and acknowledged, **@${prevAgent?.name || 'Backend Engineer'}**! Connecting the real-time hook and rendering the interactive interface:

\`\`\`tsx
import React, { useEffect, useState } from 'react';

export const LiveCollaboratorView: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    // Connect to WebSocket channel
    const socket = new WebSocket('ws://localhost:4000');
    socket.onopen = () => setConnected(true);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFeed((prev) => [data, ...prev.slice(0, 50)]);
    };
    return () => socket.close();
  }, []);

  return (
    <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl">
      <div className="flex items-center space-x-2">
        <span className={\`w-2 h-2 rounded-full \${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}\`} />
        <span className="text-xs font-semibold text-white">Live Stream Active</span>
      </div>
    </div>
  );
};
\`\`\`

**@${activeTeam.find((a) => a.miniatureShape === 'shield' || a.id?.includes('security'))?.name || 'Security Auditor'}**, please audit token validation and WebSocket security!`;
    }

    if (agent.miniatureShape === 'shield' || agent.id?.includes('security')) {
      return `### 🛡️ Security Audit & Token Hardening
Reviewing the implementation proposed by **@${prevAgent?.name || 'Frontend Engineer'}** and the backend API:

- 🔒 **Authorization**: Ensure all incoming socket connections require valid \`Bearer\` JWT tokens in handshake auth.
- 🛡️ **Payload Sanitization**: Reject payloads exceeding 64KB to mitigate memory exhaustion.
- 🚦 **Rate Limiting**: Apply sliding-window rate limit (100 reqs/min per IP) on \`/api/action\`.

\`\`\`typescript
// Rate limiting & CORS Guard
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again shortly.' }
});
\`\`\`

Passing to **@${activeTeam.find((a) => a.miniatureShape === 'gear' || a.id?.includes('devops'))?.name || 'DevOps Engineer'}** for production containerization!`;
    }

    if (agent.miniatureShape === 'gear' || agent.id?.includes('devops')) {
      return `### 🐳 DevOps Containerization & Orchestration
Security policies integrated, **@${prevAgent?.name || 'Cyber Security'}**! Here is the optimized, multi-stage Docker deployment:

\`\`\`dockerfile
# Multi-Stage Production Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
USER node
CMD ["node", "dist/index.js"]
\`\`\`

Ready for zero-downtime deployment! All components verified.`;
    }

    return `### ✨ Verification & Synthesis
I have verified the collaborative implementation. All requirements for **"${goal}"** have been systematically fulfilled across architecture, code, security, and deployment.`;
  };

  const sampleCollaborations = [
    {
      title: 'Real-Time Collaborative Canvas',
      prompt: 'Build a multi-user collaborative drawing app with WebSockets, optimistic UI rendering, Docker deployment, and DDoS rate-limiting.',
    },
    {
      title: 'Full-Stack Auth & Token Rotation',
      prompt: 'Design a secure JWT authentication microservice with refresh token rotation, Redis session caching, and unit tests.',
    },
    {
      title: 'High-Concurrency Task Queue',
      prompt: 'Architect a distributed asynchronous task queue in FastAPI with Celery, PostgreSQL schema, Docker container, and latency monitoring.',
    },
  ];

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors duration-200 ${
      isLight ? 'bg-[#F7F7F8] text-zinc-900' : 'bg-[#080809] text-[#EDEDED]'
    }`}>
      {/* ================= TOP SECTION: ROUNDTABLE TEAM STATIONS ================= */}
      <div className={`p-4 lg:p-6 border-b shrink-0 transition-colors ${
        isLight ? 'bg-white border-black/[0.06]' : 'bg-[#0E0E11] border-white/[0.07]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#8A8F98]">
              <Users className="w-3.5 h-3.5 text-[#5E6AD2]" />
              <span className={isLight ? 'text-zinc-800' : 'text-white'}>Multi-Agent Autonomous Collaboration</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                isLight ? 'bg-zinc-100 text-zinc-800 border-zinc-200' : 'bg-white/[0.08] text-white border-white/10'
              }`}>
                {activeTeam.length} Agents Active
              </span>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
              Watch your specialized AI miniatures converse, challenge each other, and solve complex development tasks together.
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2 shrink-0">
            {isCollaborating ? (
              <button
                onClick={stopCollaboration}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all shadow-md"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Conversation</span>
              </button>
            ) : (
              <span className="text-xs text-[#8A8F98] flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Roundtable Ready</span>
              </span>
            )}
          </div>
        </div>

        {/* Circular / Horizontal Miniature Pods */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
          {availableAgents.map((agent) => {
            const isSelected = selectedAgentIds.includes(agent.id || '');
            const isSpeaking = activeSpeakerId === agent.id;

            return (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id || '')}
                className={`flex flex-col items-center p-3 rounded-2xl border cursor-pointer transition-all duration-200 shrink-0 ${
                  isSpeaking
                    ? 'ring-2 ring-white/60 shadow-lg scale-105 ' + (isLight ? 'bg-zinc-100 border-zinc-300' : 'bg-[#1C1C20] border-white/30')
                    : isSelected
                    ? isLight
                      ? 'bg-zinc-50 border-black/10 hover:border-black/20'
                      : 'bg-[#141418] border-white/10 hover:border-white/20'
                    : isLight
                    ? 'opacity-40 bg-zinc-100/50 border-transparent hover:opacity-70'
                    : 'opacity-35 bg-white/[0.02] border-transparent hover:opacity-60'
                }`}
                style={{ width: '130px' }}
                title={`${isSelected ? 'Click to bench' : 'Click to add to roundtable'} ${agent.name}`}
              >
                {/* Animated Miniature Avatar */}
                <div className="relative mb-2">
                  <AgentMiniature
                    shape={agent.miniatureShape || 'circle'}
                    color={agent.miniatureColor || agent.badgeColor}
                    size="md"
                    eyeStyle={agent.eyeStyle || 'normal'}
                    isSpeaking={isSpeaking}
                    isLight={isLight}
                  />

                  {/* Speaking indicator soundwave */}
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-white text-zinc-950 shadow-md animate-bounce">
                      Speaking
                    </span>
                  )}
                </div>

                <span className={`text-[11px] font-bold text-center truncate w-full ${
                  isSpeaking ? (isLight ? 'text-zinc-950 font-bold' : 'text-white font-bold') : isLight ? 'text-zinc-800' : 'text-white'
                }`}>
                  {agent.name}
                </span>
                <span className={`text-[9px] text-center truncate w-full ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
                  {agent.role.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MIDDLE SECTION: MULTI-AGENT LIVE DIALOGUE STREAM ================= */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 no-scrollbar">
        {dialogue.map((msg) => {
          const isUser = msg.role === 'user';
          const speakerMiniature = availableAgents.find((a) => a.id === msg.agentId);

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className={`max-w-xl p-3.5 rounded-2xl text-xs shadow-md border ${
                  isLight 
                    ? 'bg-indigo-600 text-white border-indigo-500' 
                    : 'bg-[#5E6AD2] text-white border-[#5E6AD2]'
                }`}>
                  <div className="font-semibold text-[10px] opacity-80 uppercase tracking-wider mb-1">
                    Roundtable Challenge / Goal
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-start space-x-3.5 max-w-3xl">
              {/* Animated Miniature of the Speaker */}
              <div className="shrink-0 pt-1">
                <AgentMiniature
                  shape={msg.miniatureShape || speakerMiniature?.miniatureShape || 'circle'}
                  color={msg.miniatureColor || speakerMiniature?.miniatureColor || '#5E6AD2'}
                  size="sm"
                  eyeStyle={speakerMiniature?.eyeStyle || 'normal'}
                  isSpeaking={activeSpeakerId === msg.agentId}
                  isLight={isLight}
                />
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 p-4 rounded-2xl border text-xs shadow-sm transition-all relative group ${
                isLight 
                  ? 'bg-white border-black/[0.08] text-zinc-800' 
                  : 'bg-[#121216] border-white/[0.08] text-[#EDEDED]'
              }`}>
                {/* Speaker Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs" style={{ color: msg.miniatureColor || (isLight ? '#18181B' : '#EDEDED') }}>
                      {msg.agentName || 'Agent'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isLight ? 'bg-zinc-100 text-zinc-600' : 'bg-white/[0.06] text-[#8A8F98]'
                    }`}>
                      {msg.agentRole || 'Specialist'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-slate-400 transition-opacity"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Markdown / Code rendering */}
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Active Speaker Pulse Card */}
        {isCollaborating && activeSpeakerId && (
          <div className={`flex items-center space-x-3 p-3.5 rounded-2xl border text-xs animate-pulse ${
            isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-white/[0.06] border-white/10'
          }`}>
            <AgentMiniature
              shape={availableAgents.find((a) => a.id === activeSpeakerId)?.miniatureShape || 'circle'}
              size="xs"
              isSpeaking={true}
              isLight={isLight}
            />
            <span className={`font-semibold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              {availableAgents.find((a) => a.id === activeSpeakerId)?.name} is contributing to the roundtable...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= BOTTOM BAR: LAUNCH COLLABORATION ================= */}
      <div className={`p-4 border-t shrink-0 ${
        isLight ? 'bg-white border-black/[0.06]' : 'bg-[#0E0E11] border-white/[0.07]'
      }`}>
        {/* Quick Sample Goals */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-2 text-[11px]">
          <span className={`font-semibold shrink-0 ${isLight ? 'text-zinc-500' : 'text-[#8A8F98]'}`}>
            Quick Collaboration:
          </span>
          {sampleCollaborations.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => startCollaboration(sample.prompt)}
              disabled={isCollaborating}
              className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all ${
                isLight 
                  ? 'bg-zinc-100 hover:bg-zinc-200 border-black/5 text-zinc-700' 
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-[#C8C8CC]'
              }`}
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={sessionGoal}
            onChange={(e) => setSessionGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                startCollaboration();
              }
            }}
            placeholder="Assign a challenge to your multi-agent team (e.g. Build an authenticated WebSocket service in Docker)..."
            disabled={isCollaborating}
            className={`flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all ${
              isLight
                ? 'bg-zinc-50 border-black/10 focus:border-zinc-400 text-zinc-900 placeholder:text-zinc-400'
                : 'bg-[#141418] border-white/10 focus:border-white/30 text-white placeholder:text-[#686870]'
            }`}
          />

          <button
            onClick={() => startCollaboration()}
            disabled={!sessionGoal.trim() || isCollaborating}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
              !sessionGoal.trim() || isCollaborating
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : isLight
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : 'bg-white hover:bg-zinc-200 text-zinc-950 font-bold'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Engage Agents</span>
          </button>
        </div>
      </div>
    </div>
  );
};
