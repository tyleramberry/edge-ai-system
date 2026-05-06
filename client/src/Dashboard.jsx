import { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Briefcase,
  FileCheck,
  ClipboardList,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUp,
  LogOut,
  Circle,
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const AGENTS = [
  {
    id: 'business',
    label: 'Business Assistant',
    description: 'Workflow coordination and task management',
    Icon: Briefcase,
  },
  {
    id: 'grant',
    label: 'Grant Specialist',
    description: 'Grant research, LOI drafting, and compliance',
    Icon: FileCheck,
  },
  {
    id: 'contract',
    label: 'Contracting Specialist',
    description: 'RFP parsing, compliance matrices, and proposals',
    Icon: ClipboardList,
  },
  {
    id: 'personal',
    label: 'Personal Agent',
    description: 'Scheduling, reminders, and personal tasks',
    Icon: CalendarDays,
  },
];

const EXAMPLE_PROMPTS = {
  business: [
    'What tasks are outstanding this week?',
    'Route this document to the right team',
    'Create a follow-up task for Client X',
  ],
  grant: [
    'Find STEM grants in Utah',
    'Draft an LOI for an NSF opportunity',
    'Check this draft for compliance',
  ],
  contract: [
    'Parse this RFP and list all requirements',
    'Build a compliance matrix',
    'Flag gaps in our proposal',
  ],
  personal: [
    "What's on my calendar today?",
    'Set a reminder for Friday',
    'Research travel options to DC',
  ],
};

function AgentBadge({ agentId }) {
  const agent = AGENTS.find(a => a.id === agentId) || AGENTS[0];
  const { Icon } = agent;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '11px',
      fontWeight: '500',
      color: 'var(--color-accent)',
      background: 'var(--color-accent-light)',
      border: '1px solid #D4E0D4',
      padding: '2px 8px 2px 6px',
      borderRadius: '4px',
      letterSpacing: '0.01em',
    }}>
      <Icon size={11} strokeWidth={2} />
      {agent.label}
    </span>
  );
}

function UserMessage({ msg }) {
  return (
    <div style={{ marginBottom: '20px', animation: 'message-in 200ms ease both' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: '500',
        color: 'var(--color-text-tertiary)',
        marginBottom: '5px',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}>
        You
      </div>
      <div style={{
        display: 'inline-block',
        maxWidth: '640px',
        padding: '9px 14px',
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
        {msg.time}
      </div>
    </div>
  );
}

function AgentMessage({ msg }) {
  return (
    <div style={{ marginBottom: '28px', animation: 'message-in 200ms ease both' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
      }}>
        {msg.agent && <AgentBadge agentId={msg.agent} />}
        {msg.reason && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            · {msg.reason}
          </span>
        )}
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
          {msg.time}
        </span>
      </div>
      <div style={{
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        lineHeight: '1.7',
        maxWidth: '640px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        height: '22px',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '5px',
            height: '5px',
            background: 'var(--color-text-tertiary)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: `typing-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ agent }) {
  const examples = EXAMPLE_PROMPTS[agent?.id] || EXAMPLE_PROMPTS.business;
  const { Icon } = agent || AGENTS[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      height: '100%',
      maxWidth: '520px',
      padding: '0',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: 'var(--color-accent-light)',
        border: '1px solid #D4E0D4',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <Icon size={18} color="var(--color-accent)" strokeWidth={1.5} />
      </div>
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.01em',
        marginBottom: '6px',
      }}>
        {agent?.label}
      </div>
      <div style={{
        fontSize: '14px',
        color: 'var(--color-text-secondary)',
        marginBottom: '28px',
        lineHeight: '1.6',
      }}>
        {agent?.description}. Messages are automatically routed to the most relevant agent.
      </div>
      <div style={{ width: '100%' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '500',
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          Suggestions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {examples.map((ex, i) => (
            <div key={i} style={{
              padding: '9px 14px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              cursor: 'default',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
              e.currentTarget.style.background = 'var(--color-surface-raised)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.background = 'var(--color-surface)';
            }}
            >
              "{ex}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [activeAgent, setActiveAgent] = useState('business');
  const [messages, setMessages] = useState({
    business: [],
    grant: [],
    contract: [],
    personal: [],
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState('project-001');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => ({
      ...prev,
      [activeAgent]: [...prev[activeAgent], { role: 'user', content: text, time: getTime() }],
    }));
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Request failed');

      const respondingAgent = data.agent || activeAgent;
      setMessages(prev => ({
        ...prev,
        [respondingAgent]: [
          ...prev[respondingAgent],
          { role: 'assistant', content: data.reply, agent: respondingAgent, reason: data.reason, time: getTime() },
        ],
      }));
      if (respondingAgent !== activeAgent) setActiveAgent(respondingAgent);
    } catch (err) {
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [
          ...prev[activeAgent],
          { role: 'assistant', content: `Error: ${err.message}. Make sure the backend is running at ${API_BASE}.`, agent: activeAgent, time: getTime() },
        ],
      }));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const currentMessages = messages[activeAgent] || [];
  const currentAgent = AGENTS.find(a => a.id === activeAgent);
  const canSend = input.trim().length > 0 && !loading;
  const { Icon: CurrentIcon } = currentAgent || AGENTS[0];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--color-bg)', overflow: 'hidden' }}>
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .sidebar-tab {
          transition: background 150ms ease;
        }
        .sidebar-tab:hover:not(.active) {
          background: var(--color-surface-raised) !important;
        }
        .sign-out-btn:hover svg {
          stroke: var(--color-accent) !important;
        }
      `}</style>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside style={{
          width: '240px',
          minWidth: '240px',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Brand header */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                background: 'var(--color-accent)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Layers size={14} color="#fff" strokeWidth={1.5} />
              </div>
              <div style={{
                fontFamily: 'DM Serif Display, serif',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
                lineHeight: '1.3',
              }}>
                Edge AI for Streak Advisors
              </div>
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.02em',
            }}>
              AI Agent System
            </div>
          </div>

          {/* Project ID */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <label style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: '500',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom: '5px',
            }}>
              Project
            </label>
            <input
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                fontSize: '12px',
                color: 'var(--color-text-primary)',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {/* Agents nav */}
          <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            <div style={{
              padding: '4px 16px 8px',
              fontSize: '10px',
              fontWeight: '500',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
            }}>
              Agents
            </div>
            {AGENTS.map(agent => {
              const isActive = activeAgent === agent.id;
              const msgCount = messages[agent.id]?.length || 0;
              const { Icon } = agent;
              return (
                <button
                  key={agent.id}
                  className={`sidebar-tab${isActive ? ' active' : ''}`}
                  onClick={() => setActiveAgent(agent.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 16px',
                    background: isActive ? 'var(--color-accent-light)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--color-accent)' : 'transparent'}`,
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    color={isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)'}
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                    }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: isActive ? '600' : '400',
                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {agent.label}
                      </span>
                      {msgCount > 0 && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '500',
                          background: isActive ? 'var(--color-accent)' : 'var(--color-border-strong)',
                          color: isActive ? '#fff' : 'var(--color-text-secondary)',
                          borderRadius: '3px',
                          padding: '1px 5px',
                          flexShrink: 0,
                        }}>
                          {msgCount}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--color-text-tertiary)',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: '1px',
                    }}>
                      {agent.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.name}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--color-text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user.email}
              </div>
            </div>
            <button
              className="sign-out-btn"
              onClick={onLogout}
              title="Sign out"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '4px',
                flexShrink: 0,
              }}
            >
              <LogOut size={14} strokeWidth={1.5} color="var(--color-text-tertiary)" />
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: '48px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px',
              borderRadius: '4px',
              color: 'var(--color-text-tertiary)',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
          >
            {sidebarOpen
              ? <PanelLeftClose size={16} strokeWidth={1.5} />
              : <PanelLeftOpen size={16} strokeWidth={1.5} />
            }
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--color-border)' }} />

          <CurrentIcon size={15} strokeWidth={1.5} color="var(--color-accent)" />
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
          }}>
            {currentAgent?.label}
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--color-text-tertiary)',
          }}>
            {currentAgent?.description}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Circle
              size={7}
              fill="#4ade80"
              color="#4ade80"
            />
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Live</span>
          </div>
        </header>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 40px',
          background: 'var(--color-bg)',
        }}>
          {currentMessages.length === 0 ? (
            <EmptyState agent={currentAgent} />
          ) : (
            currentMessages.map((msg, i) =>
              msg.role === 'user'
                ? <UserMessage key={i} msg={msg} />
                : <AgentMessage key={i} msg={msg} />
            )
          )}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 24px 16px',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '10px 10px 10px 16px',
              background: 'var(--color-bg)',
              transition: 'border-color 0.15s',
            }}
            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <textarea
              ref={el => { inputRef.current = el; textareaRef.current = el; }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${currentAgent?.label}…`}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                lineHeight: '1.6',
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '1px 0',
                outline: 'none',
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!canSend}
              style={{
                width: '32px',
                height: '32px',
                minWidth: '32px',
                background: canSend ? 'var(--color-accent)' : 'var(--color-surface-raised)',
                border: `1px solid ${canSend ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canSend ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s, border-color 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (canSend) e.currentTarget.style.background = 'var(--color-accent-hover)'; }}
              onMouseLeave={e => { if (canSend) e.currentTarget.style.background = 'var(--color-accent)'; }}
            >
              <ArrowUp
                size={14}
                strokeWidth={2}
                color={canSend ? '#fff' : 'var(--color-text-tertiary)'}
              />
            </button>
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            textAlign: 'center',
            marginTop: '8px',
            letterSpacing: '0.01em',
          }}>
            Enter to send · Shift+Enter for new line · Auto-routed to the most relevant agent
          </div>
        </div>
      </main>
    </div>
  );
}
