import React from 'react';

export type MiniatureShapeId =
  | 'realistic-sphere'
  | 'signature'
  | 'circle' | 'drop' | 'cloud' | 'hex' | 'dome' | 'egg' | 'pill' | 'triangle' | 'squircle'
  | 'diamond' | 'gear' | 'cylinder' | 'shield' | 'flask' | 'battery' | 'infinity' | 'cursor' | 'bracket' | 'terminal'
  | 'star' | 'heart' | 'bulb' | 'chat' | 'leaf' | 'eye' | 'bow' | 'speaker' | 'play' | 'blob'
  | 'chart' | 'tag' | 'wallet' | 'plus' | 'safe' | 'ticket' | 'doc' | 'balance' | 'coin' | 'lock';

export interface MiniatureCatalogItem {
  id: MiniatureShapeId;
  name: string;
  category: 'core' | 'admin' | 'tech' | 'creative' | 'finance';
  defaultColor: string;
  role: string;
  desc: string;
  fastBlink?: boolean;
}

export const MINIATURE_CATALOG: MiniatureCatalogItem[] = [
  // Signature Core & Realistic 3D Spheres
  { id: 'realistic-sphere', name: 'DEEDOX Master AI', category: 'core', defaultColor: '#ffffff', role: 'Living Companion & Orchestrator', desc: 'DEEDOX Photorealistic 3D Companion Sphere' },
  { id: 'signature', name: 'Star Miniature', category: 'creative', defaultColor: '#818cf8', role: 'Aura Star Specialist', desc: '10-Point Star Miniature' },

  // Core Administration
  { id: 'circle', name: 'Chief of Staff', category: 'admin', defaultColor: '#8b5cf6', role: 'Strategy Architect', desc: 'Executive Strategy' },
  { id: 'drop', name: 'EA Assistant', category: 'admin', defaultColor: '#3b82f6', role: 'Executive Assistant', desc: 'Coordination & Schedule' },
  { id: 'cloud', name: 'Inbox Manager', category: 'admin', defaultColor: '#22c55e', role: 'Communications Lead', desc: 'Emails & Triaging' },
  { id: 'hex', name: 'Sales Outbound', category: 'admin', defaultColor: '#14b8a6', role: 'Growth Specialist', desc: 'Outreach & Deals' },
  { id: 'dome', name: 'Talent Scout', category: 'admin', defaultColor: '#92400e', role: 'Recruitment Lead', desc: 'Hiring & Sourcing', fastBlink: true },
  { id: 'egg', name: 'Growth Marketer', category: 'admin', defaultColor: '#f97316', role: 'Conversion Specialist', desc: 'A/B Testing & Funnels' },
  { id: 'pill', name: 'Customer Support', category: 'admin', defaultColor: '#f43f5e', role: 'Support Copilot', desc: 'Ticket Resolution' },
  { id: 'triangle', name: 'Expense Manager', category: 'admin', defaultColor: '#d946ef', role: 'Spend Auditor', desc: 'Receipts & Approvals' },
  { id: 'squircle', name: 'Invoice Collector', category: 'admin', defaultColor: '#6366f1', role: 'Billing Specialist', desc: 'Accounts Receivable' },

  // Technology & Engineering
  { id: 'diamond', name: 'CTO Agent', category: 'tech', defaultColor: '#0ea5e9', role: 'Chief Tech Officer', desc: 'System Architecture' },
  { id: 'gear', name: 'DevOps Bot', category: 'tech', defaultColor: '#475569', role: 'DevOps Architect', desc: 'Docker & CI/CD Pipelines' },
  { id: 'cylinder', name: 'Database Admin', category: 'tech', defaultColor: '#059669', role: 'Database Engineer', desc: 'SQL & Cache Optimization' },
  { id: 'shield', name: 'Cyber Security', category: 'tech', defaultColor: '#dc2626', role: 'Security Auditor', desc: 'Vulnerability & Auth', fastBlink: true },
  { id: 'flask', name: 'AI Researcher', category: 'tech', defaultColor: '#7c3aed', role: 'ML Engineer', desc: 'Model Training & Prompts' },
  { id: 'battery', name: 'Performance', category: 'tech', defaultColor: '#ca8a04', role: 'Performance Optimizer', desc: 'Speed & Latency Tuning' },
  { id: 'infinity', name: 'QA Tester', category: 'tech', defaultColor: '#0284c7', role: 'QA Automation', desc: 'Unit & End-to-End Tests' },
  { id: 'cursor', name: 'Frontend Dev', category: 'tech', defaultColor: '#e11d48', role: 'UI Engineer', desc: 'React, Tailwind & UX' },
  { id: 'bracket', name: 'Backend Dev', category: 'tech', defaultColor: '#ea580c', role: 'API Engineer', desc: 'Node, FastAPI & Logic' },
  { id: 'terminal', name: 'SysAdmin', category: 'tech', defaultColor: '#1f2937', role: 'Systems Operator', desc: 'Server Health & Ports' },

  // Creative & Marketing
  { id: 'star', name: 'CMO Agent', category: 'creative', defaultColor: '#facc15', role: 'Brand Strategist', desc: 'Creative Vision & Marketing', fastBlink: true },
  { id: 'heart', name: 'Community Mgr', category: 'creative', defaultColor: '#f43f5e', role: 'Community Lead', desc: 'Engagement & Advocacy' },
  { id: 'bulb', name: 'Ideation Bot', category: 'creative', defaultColor: '#fbbf24', role: 'Brainstorm Partner', desc: 'Feature Innovation' },
  { id: 'chat', name: 'Social Media', category: 'creative', defaultColor: '#ec4899', role: 'Social Lead', desc: 'Viral Content Strategy' },
  { id: 'leaf', name: 'Copywriter', category: 'creative', defaultColor: '#84cc16', role: 'Technical Writer', desc: 'Documentation & Copy' },
  { id: 'eye', name: 'Visual Designer', category: 'creative', defaultColor: '#06b6d4', role: 'Graphic Designer', desc: 'Assets & Aesthetics' },
  { id: 'bow', name: 'PR Manager', category: 'creative', defaultColor: '#c026d3', role: 'Public Relations', desc: 'Press & Announcements' },
  { id: 'speaker', name: 'Ad Campaigner', category: 'creative', defaultColor: '#f97316', role: 'PPC Specialist', desc: 'Ad Networks & ROI' },
  { id: 'play', name: 'Video Editor', category: 'creative', defaultColor: '#ef4444', role: 'Media Producer', desc: 'Demos & Walkthroughs' },
  { id: 'blob', name: 'UX Researcher', category: 'creative', defaultColor: '#a855f7', role: 'UX Analyst', desc: 'Usability & User Testing' },

  // Operations & Finance
  { id: 'chart', name: 'Data Analyst', category: 'finance', defaultColor: '#3b82f6', role: 'Analytics Lead', desc: 'Metrics & Dashboards' },
  { id: 'tag', name: 'Product Mgr', category: 'finance', defaultColor: '#10b981', role: 'Product Owner', desc: 'Roadmap & Specs' },
  { id: 'wallet', name: 'CFO Agent', category: 'finance', defaultColor: '#8b5cf6', role: 'Finance Director', desc: 'Budget & Runway' },
  { id: 'plus', name: 'HR Manager', category: 'finance', defaultColor: '#059669', role: 'People Operations', desc: 'Team & Culture' },
  { id: 'safe', name: 'Compliance', category: 'finance', defaultColor: '#475569', role: 'Legal & Risk', desc: 'Data Privacy & SOC2' },
  { id: 'ticket', name: 'Event Planner', category: 'finance', defaultColor: '#f59e0b', role: 'Event Coordinator', desc: 'Releases & Demos' },
  { id: 'doc', name: 'Legal Review', category: 'finance', defaultColor: '#6366f1', role: 'Contract Counsel', desc: 'Terms & Licensing' },
  { id: 'balance', name: 'Risk Assessor', category: 'finance', defaultColor: '#d946ef', role: 'Risk Analyst', desc: 'Security Audits' },
  { id: 'coin', name: 'Payroll Agent', category: 'finance', defaultColor: '#fbbf24', role: 'Compensation Lead', desc: 'Payroll & Benefits' },
  { id: 'lock', name: 'Access Control', category: 'finance', defaultColor: '#dc2626', role: 'IAM Architect', desc: 'Keys & Permissions' },
];

export interface AgentMiniatureProps {
  shape?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  eyeStyle?: 'normal' | 'fast-blink' | 'no-look';
  isSpeaking?: boolean;
  isLight?: boolean;
  useDarkSpherical?: boolean; // When true, uses the reference dark-mode radial sphere style
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const AgentMiniature: React.FC<AgentMiniatureProps> = ({
  shape = 'circle',
  color,
  size = 'md',
  eyeStyle = 'normal',
  isSpeaking = false,
  isLight = false,
  useDarkSpherical = false,
  className = '',
  onClick,
  title,
}) => {
  // Normalize shape string
  const cleanShape = (shape || 'circle').toLowerCase().replace(/^shape-/, '');
  const shapeClass = `shape-${cleanShape}`;

  // Find metadata in catalog
  const catalogItem = MINIATURE_CATALOG.find((c) => c.id === cleanShape);
  const effectiveColor = color || catalogItem?.defaultColor || '#5E6AD2';
  const effectiveEyeStyle = eyeStyle !== 'normal' ? eyeStyle : catalogItem?.fastBlink ? 'fast-blink' : 'normal';

  // Dimension scaling
  const sizeConfig = {
    xs: { wrapper: 24, eyeW: 3, eyeH: 7, gap: 3 },
    sm: { wrapper: 36, eyeW: 4, eyeH: 10, gap: 4 },
    md: { wrapper: 52, eyeW: 6, eyeH: 14, gap: 6 },
    lg: { wrapper: 80, eyeW: 10, eyeH: 22, gap: 9 }, // Reference HTML standard
    xl: { wrapper: 120, eyeW: 14, eyeH: 30, gap: 13 },
  }[size];

  const inlineStyles: React.CSSProperties = {
    width: `${sizeConfig.wrapper}px`,
    height: `${sizeConfig.wrapper}px`,
    // If a custom color is provided and not signature or realistic-sphere, override --agent-bg
    ...(cleanShape !== 'signature' && cleanShape !== 'realistic-sphere' && effectiveColor
      ? { ['--agent-bg' as any]: effectiveColor }
      : {}),
    ['--eye-width' as any]: `${sizeConfig.eyeW}px`,
    ['--eye-height' as any]: `${sizeConfig.eyeH}px`,
    ['--eye-gap' as any]: `${sizeConfig.gap}px`,
    ...(isLight ? { ['--eye-color' as any]: '#ffffff' } : {}),
  };

  const eyeClass = effectiveEyeStyle === 'fast-blink' ? 'fast-blink' : effectiveEyeStyle === 'no-look' ? 'no-look' : '';

  return (
    <div
      onClick={onClick}
      title={title || catalogItem?.name || 'AI Miniature'}
      className={`agent-wrapper ${cleanShape === 'realistic-sphere' ? 'realistic-wrapper' : ''} ${isSpeaking ? 'is-speaking' : ''} ${isLight ? 'is-light' : ''} ${useDarkSpherical && !isLight ? 'dark-theme-spherical' : ''} ${className}`}
      style={inlineStyles}
    >
      {/* Body Layer with shape animation */}
      <div className="agent-body-layer">
        <div className={`agent-body ${shapeClass}`} />
      </div>

      {/* Eyes Layer */}
      {cleanShape === 'realistic-sphere' ? (
        <div className="realistic-eyes-container">
          <div className="realistic-eye-wrapper-left">
            <div className="realistic-eye" />
          </div>
          <div className="realistic-eye-wrapper-right">
            <div className="realistic-eye" />
          </div>
        </div>
      ) : (
        <div className="agent-eyes-layer">
          <div className={`agent-eyes-container ${eyeClass}`}>
            <div className="agent-eye" />
            <div className="agent-eye" />
          </div>
        </div>
      )}
    </div>
  );
};
