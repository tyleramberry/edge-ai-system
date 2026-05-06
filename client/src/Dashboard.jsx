import { useState, useRef, useEffect } from 'react';
import {
  Briefcase, FileSearch, ClipboardList, CalendarCheck,
  Folder, ChevronsUpDown, PanelLeft, LogOut,
  ArrowUp, Paperclip, Slash, CornerDownRight, ArrowUpRight, RefreshCw,
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

// ── Design tokens (matched to colors_and_type.css) ─────────────────────────

const AGENTS = [
  {
    id: 'business',
    name: 'Business Assistant',
    Icon: Briefcase,
    lucide: 'briefcase',
    short: 'Workflow coordination',
    desc: 'Workflow coordination and task management. Messages are automatically routed to the most relevant agent.',
    suggestions: [
      'What tasks are outstanding this week?',
      'Route this document to the right team.',
      'Create a follow-up task for Aldridge & Co.',
    ],
  },
  {
    id: 'grant',
    name: 'Grant Specialist',
    Icon: FileSearch,
    lucide: 'file-search',
    short: 'Grant research, LOI drafting',
    desc: 'Funder research, eligibility screens, and letter-of-intent drafting against your client briefs.',
    suggestions: [
      'Find three foundations matching the Northwind brief.',
      'Draft an LOI for the McKenzie Family Trust.',
      'Summarize last quarter\u2019s grant calendar.',
    ],
  },
  {
    id: 'contract',
    name: 'Contracting Specialist',
    Icon: ClipboardList,
    lucide: 'clipboard-list',
    short: 'RFP parsing, compliance',
    desc: 'RFP parsing, compliance matrices, and red-line summaries against your standard MSA.',
    suggestions: [
      'Parse the attached RFP into a compliance matrix.',
      'Flag deviations from our standard MSA.',
      'Summarize Section L and M of this solicitation.',
    ],
  },
  {
    id: 'personal',
    name: 'Personal Agent',
    Icon: CalendarCheck,
    lucide: 'calendar-check',
    short: 'Scheduling, reminders',
    desc: 'Scheduling, reminders, and personal correspondence \u2014 the quiet one running in the background.',
    suggestions: [
      'Block 90 minutes of focus time tomorrow morning.',
      'Reschedule my Thursday with the Reyes group.',
      'Remind me to follow up with Priya on Friday.',
    ],
  },
];

// ── Atoms ───────────────────────────────────────────────────────────────────

function LogoMark({ size = 28, bg = 'var(--ink-900)', color = 'var(--paper-100)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: bg, color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="none">
        <path d="M5 6 L16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
        <path d="M5 26 L16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
        <path d="M16 16 L27 16" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      </svg>
    </div>
  );
}

function AgentTile({ Icon, size = 32, active = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: active ? 'var(--bark-600)' : '#FFF',
      border: `1px solid ${active ? 'var(--bark-600)' : 'var(--ink-200)'}`,
      color: active ? 'var(--paper-50)' : 'var(--ink-700)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 200ms var(--ease-standard)',
    }}>
      <Icon size={size * 0.46} strokeWidth={1.5} />
    </div>
  );
}

function StatusDot({ tone = 'positive', label }) {
  const color = tone === 'positive' ? 'var(--positive)' : 'var(--ink-500)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'var(--font-sans)', fontSize: 12,
      color: 'var(--ink-700)', fontWeight: 500,
    }}>
      <span style={{ position: 'relative', width: 7, height: 7, flexShrink: 0 }}>
        <span style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: color, opacity: 0.35,
          animation: 'eai-pulse 2s ease-in-out infinite',
        }} />
        <span style={{ position: 'absolute', inset: 1.5, borderRadius: '50%', background: color }} />
      </span>
      {label}
    </span>
  );
}

function Avatar({ name, size = 28 }) {
  const initials = name.split(/[\s@]/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--ink-900)', color: 'var(--paper-100)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', fontSize: Math.round(size * 0.36),
      fontWeight: 600, letterSpacing: '0.02em',
    }}>
      {initials}
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ currentId, onSelect, messages, user, onSignOut, projectId, onProjectChange }) {
  return (
    <aside style={{
      width: 288, background: 'var(--paper-100)',
      borderRight: '1px solid var(--ink-200)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0, flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        padding: '20px 20px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--ink-200)',
      }}>
        <LogoMark size={32} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500,
            letterSpacing: '-0.012em', color: 'var(--ink-900)', lineHeight: 1.15,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            Streak Advisors
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 11,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--ink-500)', marginTop: 2,
          }}>
            Agent system
          </div>
        </div>
      </div>

      {/* Project selector */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'var(--ink-500)', marginBottom: 10,
        }}>
          Project
        </div>
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', background: '#FFF', border: '1px solid var(--ink-300)',
          borderRadius: 4,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Folder size={14} strokeWidth={1.5} color="var(--ink-500)" />
            <input
              value={projectId}
              onChange={e => onProjectChange(e.target.value)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-900)',
                background: 'transparent', border: 'none', outline: 'none',
                width: 140,
              }}
            />
          </span>
          <ChevronsUpDown size={14} strokeWidth={1.5} color="var(--ink-500)" />
        </div>
      </div>

      {/* Agents list */}
      <div style={{ padding: '16px 20px 8px', flex: 1, overflowY: 'auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 10,
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-500)',
          }}>
            Agents · 4
          </div>
          <StatusDot tone="positive" label="All online" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {AGENTS.map(a => {
            const isActive = currentId === a.id;
            const msgCount = messages[a.id]?.length || 0;
            return (
              <button
                key={a.id}
                onClick={() => onSelect(a.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 10px', borderRadius: 6, border: 0,
                  background: isActive ? '#FFF' : 'transparent',
                  boxShadow: isActive ? 'inset 0 0 0 1px var(--ink-200)' : 'none',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 200ms var(--ease-standard)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--paper-200)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <AgentTile Icon={a.Icon} size={32} active={isActive} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 6,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontSize: 14,
                      fontWeight: isActive ? 600 : 500, color: 'var(--ink-900)', lineHeight: 1.2,
                    }}>
                      {a.name}
                    </span>
                    {msgCount > 0 && (
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        background: isActive ? 'var(--bark-600)' : 'var(--ink-300)',
                        color: isActive ? 'var(--paper-50)' : 'var(--ink-900)',
                        borderRadius: 3, padding: '1px 5px', flexShrink: 0,
                      }}>
                        {msgCount}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sans)', fontSize: 12,
                    color: 'var(--ink-500)', marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {a.short}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* User */}
      <div style={{
        padding: '14px 20px', borderTop: '1px solid var(--ink-200)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Avatar name={user.name} size={32} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
            color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {user.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 11,
            color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {user.email}
          </div>
        </div>
        <button
          onClick={onSignOut}
          title="Sign out"
          style={{
            width: 32, height: 32, borderRadius: 4,
            border: '1px solid var(--ink-200)', background: 'transparent',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ink-500)',
            transition: 'border-color 200ms, color 200ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-400)'; e.currentTarget.style.color = 'var(--ink-900)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink-200)'; e.currentTarget.style.color = 'var(--ink-500)'; }}
        >
          <LogOut size={14} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}

// ── Agent Header ─────────────────────────────────────────────────────────────

function AgentHeader({ agent, onToggleSidebar }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 32px', borderBottom: '1px solid var(--ink-200)',
      background: 'var(--paper-50)', minHeight: 56, flexShrink: 0,
    }}>
      <button
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        style={{
          width: 32, height: 32, borderRadius: 4,
          border: '1px solid transparent', background: 'transparent',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-500)',
          transition: 'border-color 200ms, color 200ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink-200)'; e.currentTarget.style.color = 'var(--ink-900)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--ink-500)'; }}
      >
        <PanelLeft size={16} strokeWidth={1.5} />
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--ink-200)' }} />

      <AgentTile Icon={agent.Icon} size={28} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 14, minWidth: 0 }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
          letterSpacing: '-0.012em', color: 'var(--ink-900)',
        }}>
          {agent.name}
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-500)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {agent.short}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-500)',
          letterSpacing: '0.04em',
        }}>
          claude-sonnet-4.5
        </span>
        <StatusDot tone="positive" label="Live" />
      </div>
    </header>
  );
}

// ── Suggestion Row ────────────────────────────────────────────────────────────

function SuggestionRow({ text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      style={{
        width: '100%', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        background: '#FFF', border: '1px solid var(--ink-200)',
        borderRadius: 6, cursor: 'pointer',
        fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-800)',
        transition: 'border-color 200ms var(--ease-standard)',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink-400)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ink-200)'}
    >
      <CornerDownRight size={16} strokeWidth={1.5} color="var(--ink-400)" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontStyle: 'italic', color: 'var(--ink-700)' }}>"{text}"</span>
      <ArrowUpRight size={14} strokeWidth={1.5} color="var(--ink-400)" />
    </button>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function AgentEmptyState({ agent, onSuggest }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '64px 32px 24px', overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-500)',
          marginBottom: 18,
        }}>
          You're talking to
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <AgentTile Icon={agent.Icon} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 44, fontWeight: 500,
              letterSpacing: '-0.022em', lineHeight: 1.04,
              color: 'var(--ink-900)', margin: 0,
            }}>
              {agent.name}.
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.55,
              color: 'var(--ink-700)', marginTop: 14,
            }}>
              {agent.desc}
            </p>
          </div>
        </div>

        {/* Capabilities grid */}
        <div style={{
          marginTop: 32,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid var(--ink-200)',
          borderBottom: '1px solid var(--ink-200)',
        }}>
          {[
            { k: 'Tools', v: '12 connected' },
            { k: 'Memory', v: 'Project-scoped' },
            { k: 'Routing', v: 'Auto · cross-agent' },
          ].map((m, i) => (
            <div key={m.k} style={{
              padding: '16px 18px',
              borderLeft: i === 0 ? 'none' : '1px solid var(--ink-200)',
            }}>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 11,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--ink-500)', fontWeight: 500,
              }}>
                {m.k}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)', fontSize: 14,
                color: 'var(--ink-900)', marginTop: 4, fontWeight: 500,
              }}>
                {m.v}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div style={{ marginTop: 36 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 14,
          }}>
            <div style={{
              fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-500)',
            }}>
              Suggestions
            </div>
            <button style={{
              fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)',
              background: 'transparent', border: 0, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <RefreshCw size={12} strokeWidth={1.5} />
              Shuffle
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agent.suggestions.map((s, i) => (
              <SuggestionRow key={i} text={s} onClick={onSuggest} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Message Views ─────────────────────────────────────────────────────────────

function UserMessage({ msg }) {
  return (
    <div style={{ marginBottom: 24, animation: 'message-in 200ms ease both' }}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--ink-500)', marginBottom: 8,
      }}>
        You · {msg.time}
      </div>
      <div style={{
        display: 'inline-block', maxWidth: 640,
        padding: '12px 16px',
        background: 'var(--paper-200)', border: '1px solid var(--ink-200)',
        borderRadius: 6,
        fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-800)',
        lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function AgentMessage({ msg }) {
  const agent = AGENTS.find(a => a.id === msg.agent) || AGENTS[0];
  return (
    <div style={{ marginBottom: 32, animation: 'message-in 200ms ease both' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
      }}>
        <AgentTile Icon={agent.Icon} size={24} active />
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500,
          letterSpacing: '-0.012em', color: 'var(--ink-900)',
        }}>
          {agent.name}
        </span>
        {msg.reason && (
          <span style={{
            fontFamily: 'var(--font-sans)', fontSize: 12,
            color: 'var(--ink-500)', fontStyle: 'italic',
          }}>
            · {msg.reason}
          </span>
        )}
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--ink-400)',
        }}>
          {msg.time}
        </span>
      </div>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--ink-700)',
        lineHeight: 1.65, maxWidth: 680,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 5, height: 28 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5,
          background: 'var(--ink-400)', borderRadius: '50%', display: 'inline-block',
          animation: `typing-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Composer ───────────────────────────────────────────────────────────────────

function Composer({ agent, value, onChange, onSend, charCount }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [value]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  }

  const canSend = value.trim().length > 0;

  return (
    <div style={{
      borderTop: '1px solid var(--ink-200)',
      padding: '20px 32px 24px',
      background: 'var(--paper-50)',
      flexShrink: 0,
    }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div
          style={{
            background: '#FFF', border: '1px solid var(--ink-300)', borderRadius: 8,
            padding: '14px 16px',
            transition: 'border-color 200ms, box-shadow 200ms',
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = 'var(--bark-600)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,66,38,0.12)';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'var(--ink-300)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agent.name.toLowerCase()}\u2026`}
            rows={2}
            style={{
              width: '100%', resize: 'none', border: 0, outline: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.55,
              color: 'var(--ink-900)', background: 'transparent',
              maxHeight: 160, overflowY: 'auto',
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 6,
          }}>
            <button title="Attach" style={{
              width: 30, height: 30, borderRadius: 4, border: 0,
              background: 'transparent', cursor: 'pointer',
              color: 'var(--ink-500)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 200ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-900)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-500)'}
            >
              <Paperclip size={16} strokeWidth={1.5} />
            </button>
            <button title="Commands" style={{
              width: 30, height: 30, borderRadius: 4, border: 0,
              background: 'transparent', cursor: 'pointer',
              color: 'var(--ink-500)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 200ms',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-900)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-500)'}
            >
              <Slash size={16} strokeWidth={1.5} />
            </button>
            <span style={{ flex: 1 }} />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)' }}>
              Auto-routed to the most relevant agent
            </span>
            <button
              onClick={onSend}
              disabled={!canSend}
              style={{
                width: 32, height: 32, borderRadius: 4, border: 0,
                background: canSend ? 'var(--bark-600)' : 'var(--ink-200)',
                color: canSend ? 'var(--paper-50)' : 'var(--ink-500)',
                cursor: canSend ? 'pointer' : 'not-allowed',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 200ms var(--ease-standard)',
              }}
              onMouseEnter={e => { if (canSend) e.currentTarget.style.background = 'var(--bark-700)'; }}
              onMouseLeave={e => { if (canSend) e.currentTarget.style.background = 'var(--bark-600)'; }}
            >
              <ArrowUp size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div style={{
          maxWidth: 880, marginTop: 10,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)',
        }}>
          <span>
            <kbd style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, padding: '1px 5px',
              border: '1px solid var(--ink-200)', borderRadius: 3, background: '#FFF',
            }}>
              Enter
            </kbd>
            {' '}to send{' · '}
            <kbd style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, padding: '1px 5px',
              border: '1px solid var(--ink-200)', borderRadius: 3, background: '#FFF',
            }}>
              Shift+Enter
            </kbd>
            {' '}for new line
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {charCount} / 8000
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Messages View ─────────────────────────────────────────────────────────────

function MessagesView({ msgs, loading }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      padding: '40px 32px',
      background: 'var(--paper-50)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {msgs.map((msg, i) =>
          msg.role === 'user'
            ? <UserMessage key={i} msg={msg} />
            : <AgentMessage key={i} msg={msg} />
        )}
        {loading && <TypingIndicator />}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ user, onLogout }) {
  const [activeId, setActiveId]   = useState('business');
  const [messages, setMessages]   = useState({ business: [], grant: [], contract: [], personal: [] });
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [projectId, setProjectId] = useState('project-001');
  const [sidebarOpen, setSidebar] = useState(true);
  const inputRef                  = useRef(null);

  const currentAgent = AGENTS.find(a => a.id === activeId);
  const currentMsgs  = messages[activeId] || [];

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function handleSuggest(text) {
    setInput(text);
    // Slight delay so the textarea is focused after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => ({
      ...prev,
      [activeId]: [...prev[activeId], { role: 'user', content: text, time: getTime() }],
    }));
    setInput('');
    setLoading(true);

    try {
      const res  = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Request failed');

      const respondingId = data.agent || activeId;
      setMessages(prev => ({
        ...prev,
        [respondingId]: [
          ...prev[respondingId],
          { role: 'assistant', content: data.reply, agent: respondingId, reason: data.reason, time: getTime() },
        ],
      }));
      if (respondingId !== activeId) setActiveId(respondingId);
    } catch (err) {
      setMessages(prev => ({
        ...prev,
        [activeId]: [
          ...prev[activeId],
          {
            role: 'assistant',
            content: `Error: ${err.message}. Make sure the backend is running at ${API_BASE}.`,
            agent: activeId,
            time: getTime(),
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  }

  const showEmpty = currentMsgs.length === 0 && !loading;

  return (
    <div style={{
      display: 'flex', height: '100vh',
      background: 'var(--paper-50)', overflow: 'hidden',
    }}>
      {sidebarOpen && (
        <Sidebar
          currentId={activeId}
          onSelect={id => { setActiveId(id); }}
          messages={messages}
          user={user}
          onSignOut={onLogout}
          projectId={projectId}
          onProjectChange={setProjectId}
        />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <AgentHeader
          agent={currentAgent}
          onToggleSidebar={() => setSidebar(o => !o)}
        />

        {showEmpty
          ? <AgentEmptyState agent={currentAgent} onSuggest={handleSuggest} />
          : <MessagesView msgs={currentMsgs} loading={loading} />
        }

        <Composer
          agent={currentAgent}
          value={input}
          onChange={setInput}
          onSend={sendMessage}
          charCount={input.length}
        />
      </main>
    </div>
  );
}
