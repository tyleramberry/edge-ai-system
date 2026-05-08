import { useState, useEffect, useCallback } from 'react';
import {
  Database, Tag as TagIcon, Trash2, Plus, RefreshCw,
  Briefcase, FileSearch, ClipboardList, CalendarCheck,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

const AGENT_OPTIONS = [
  { value: 'business', label: 'Business Assistant', Icon: Briefcase },
  { value: 'grant',    label: 'Grant Specialist',   Icon: FileSearch },
  { value: 'contract', label: 'Contracting Specialist', Icon: ClipboardList },
  { value: 'personal', label: 'Personal Agent',     Icon: CalendarCheck },
];

const ACCESS_OPTIONS = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
];

const AGENT_LABEL = AGENT_OPTIONS.reduce((m, a) => (m[a.value] = a.label, m), {});
const AGENT_ICON  = AGENT_OPTIONS.reduce((m, a) => (m[a.value] = a.Icon, m), {});

// ── Shared input style ──────────────────────────────────────────────────────

const inputBase = {
  width: '100%',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  color: 'var(--ink-900)',
  background: '#FFF',
  border: '1px solid var(--ink-300)',
  borderRadius: 4,
  padding: '10px 12px',
  transition: 'border-color 200ms, box-shadow 200ms',
};

function applyFocus(e) {
  e.target.style.borderColor = 'var(--bark-600)';
  e.target.style.boxShadow = '0 0 0 3px rgba(107,66,38,0.12)';
}
function applyBlur(e) {
  e.target.style.borderColor = 'var(--ink-300)';
  e.target.style.boxShadow = 'none';
}

function FieldLabel({ children }) {
  return (
    <span style={{
      fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--ink-500)',
    }}>
      {children}
    </span>
  );
}

// ── Banner ──────────────────────────────────────────────────────────────────

function Banner({ tone, message, onDismiss }) {
  if (!message) return null;
  const positive = tone === 'positive';
  return (
    <div style={{
      padding: '10px 14px',
      background: positive ? 'var(--positive-bg)' : 'var(--critical-bg)',
      border: `1px solid ${positive ? '#BFD9C0' : '#FECACA'}`,
      borderRadius: 4,
      fontFamily: 'var(--font-sans)', fontSize: 13,
      color: positive ? 'var(--positive)' : 'var(--critical)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: 12,
    }}>
      <span>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: 12,
          color: positive ? 'var(--positive)' : 'var(--critical)',
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

// ── Add form ────────────────────────────────────────────────────────────────

function AddForm({ onAdded, onError }) {
  const [title, setTitle]     = useState('');
  const [agent, setAgent]     = useState('business');
  const [access, setAccess]   = useState('business');
  const [tags, setTags]       = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setTitle('');
    setAgent('business');
    setAccess('business');
    setTags('');
    setContent('');
  }

  async function submit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/knowledge/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          agentId: agent,
          access,
          tags: tagList,
          content: content.trim(),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      reset();
      onAdded(`Added "${title.trim()}" to the knowledge base.`);
    } catch (err) {
      onError(`Failed to add entry: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  return (
    <form
      onSubmit={submit}
      style={{
        background: '#FFF',
        border: '1px solid var(--ink-200)',
        borderRadius: 6,
        padding: '24px 26px',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 14, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--ink-500)', marginBottom: 6,
          }}>
            New entry
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500,
            letterSpacing: '-0.018em', color: 'var(--ink-900)', margin: 0,
            lineHeight: 1.1,
          }}>
            Add knowledge.
          </h2>
        </div>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 13,
          color: 'var(--ink-500)', maxWidth: 360,
        }}>
          Routed into the named agent's retrieval index. Tag carefully — these are
          searched verbatim during recall.
        </span>
      </div>

      <div style={{ height: 1, background: 'var(--ink-200)' }} />

      {/* Title */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Short, descriptive label"
          style={inputBase}
          onFocus={applyFocus}
          onBlur={applyBlur}
          required
        />
      </label>

      {/* Agent + Access — side by side */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
      }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FieldLabel>Agent</FieldLabel>
          <select
            value={agent}
            onChange={e => setAgent(e.target.value)}
            style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}
            onFocus={applyFocus}
            onBlur={applyBlur}
          >
            {AGENT_OPTIONS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FieldLabel>Access level</FieldLabel>
          <select
            value={access}
            onChange={e => setAccess(e.target.value)}
            style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}
            onFocus={applyFocus}
            onBlur={applyBlur}
          >
            {ACCESS_OPTIONS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Tags */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Tags</FieldLabel>
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="comma, separated, keywords"
          style={inputBase}
          onFocus={applyFocus}
          onBlur={applyBlur}
        />
      </label>

      {/* Content */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel>Content</FieldLabel>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste or write the canonical reference text…"
          rows={10}
          style={{
            ...inputBase,
            resize: 'vertical',
            lineHeight: 1.55,
            fontFamily: 'var(--font-sans)',
            minHeight: 220,
          }}
          onFocus={applyFocus}
          onBlur={applyBlur}
          required
        />
      </label>

      {/* Submit row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 4,
      }}>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)',
        }}>
          Posted to <span style={{ fontFamily: 'var(--font-mono)' }}>/knowledge/add</span>.
        </span>
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            background: canSubmit ? 'var(--bark-600)' : 'var(--ink-200)',
            color: canSubmit ? 'var(--paper-50)' : 'var(--ink-500)',
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
            borderRadius: 4, border: 0,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            transition: 'background 200ms var(--ease-standard)',
          }}
          onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = 'var(--bark-700)'; }}
          onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = 'var(--bark-600)'; }}
        >
          <Plus size={14} strokeWidth={1.8} />
          {submitting ? 'Adding…' : 'Add to knowledge base'}
        </button>
      </div>
    </form>
  );
}

// ── Entry row ───────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function AgentBadge({ agentId }) {
  const Icon  = AGENT_ICON[agentId] || Database;
  const label = AGENT_LABEL[agentId] || agentId || 'Unassigned';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px',
      background: 'var(--paper-200)',
      border: '1px solid var(--ink-200)',
      borderRadius: 3,
      fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
      color: 'var(--ink-800)',
      letterSpacing: '0.02em',
    }}>
      <Icon size={11} strokeWidth={1.8} />
      {label}
    </span>
  );
}

function EntryRow({ entry, onDelete }) {
  const [hover, setHover] = useState(false);
  const [busy, setBusy]   = useState(false);
  const id = entry.id ?? entry._id;
  const tags = Array.isArray(entry.tags)
    ? entry.tags
    : typeof entry.tags === 'string'
      ? entry.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

  async function handleDelete() {
    if (!id || busy) return;
    setBusy(true);
    await onDelete(id, entry.title || '(untitled)');
    setBusy(false);
  }

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#FFF',
        border: '1px solid var(--ink-200)',
        borderColor: hover ? 'var(--ink-300)' : 'var(--ink-200)',
        borderRadius: 6,
        padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'border-color 200ms var(--ease-standard)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
            letterSpacing: '-0.012em', color: 'var(--ink-900)', lineHeight: 1.2,
            wordBreak: 'break-word',
          }}>
            {entry.title || '(untitled)'}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
            flexWrap: 'wrap',
          }}>
            <AgentBadge agentId={entry.agent} />
            {entry.access && (
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: 'var(--ink-500)',
              }}>
                {entry.access}
              </span>
            )}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-500)',
            }}>
              {formatDate(entry.createdAt || entry.created_at || entry.date)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={!id || busy}
          title="Delete entry"
          style={{
            width: 32, height: 32, borderRadius: 4,
            border: '1px solid var(--ink-200)',
            background: 'transparent',
            color: 'var(--ink-500)',
            cursor: id ? 'pointer' : 'not-allowed',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 200ms, color 200ms, background 200ms',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--critical)';
            e.currentTarget.style.color = 'var(--critical)';
            e.currentTarget.style.background = 'var(--critical-bg)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--ink-200)';
            e.currentTarget.style.color = 'var(--ink-500)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Trash2 size={14} strokeWidth={1.6} />
        </button>
      </div>

      {tags.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6,
          paddingTop: 4, borderTop: '1px solid var(--ink-200)',
        }}>
          <TagIcon size={12} strokeWidth={1.5} color="var(--ink-400)" />
          {tags.map((t, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--ink-700)',
              background: 'var(--paper-100)',
              border: '1px solid var(--ink-200)',
              borderRadius: 3,
              padding: '1px 6px',
            }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function KnowledgeBase() {
  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [loadError, setLoadError] = useState('');
  const [banner, setBanner]     = useState(null); // { tone, message }

  const showSuccess = useCallback(msg => setBanner({ tone: 'positive', message: msg }), []);
  const showError   = useCallback(msg => setBanner({ tone: 'critical', message: msg }), []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch(`${API_BASE}/knowledge/list`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.entries || data.items || []);
      setEntries(list);
    } catch (err) {
      setLoadError(`Could not load entries: ${err.message}.`);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id, title) {
    try {
      const res = await fetch(`${API_BASE}/knowledge/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      showSuccess(`Removed "${title}".`);
      await load();
    } catch (err) {
      showError(`Failed to delete entry: ${err.message}`);
    }
  }

  async function handleAdded(msg) {
    showSuccess(msg);
    await load();
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      padding: '40px 32px 64px',
      background: 'var(--paper-50)',
    }}>
      <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Heading */}
        <header>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--ink-500)', marginBottom: 10,
          }}>
            Admin · Retrieval index
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 500,
              letterSpacing: '-0.022em', lineHeight: 1.04,
              color: 'var(--ink-900)', margin: 0,
            }}>
              Knowledge base.
            </h1>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-500)',
            }}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.55,
            color: 'var(--ink-700)', marginTop: 14, maxWidth: 620,
          }}>
            Curate the reference material your agents recall against. Entries are
            scoped to a single agent and an access level.
          </p>
        </header>

        {/* Banner */}
        {banner && (
          <Banner
            tone={banner.tone}
            message={banner.message}
            onDismiss={() => setBanner(null)}
          />
        )}

        {/* Add form */}
        <AddForm onAdded={handleAdded} onError={showError} />

        {/* Section divider with refresh */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 8, paddingBottom: 10, borderBottom: '1px solid var(--ink-200)',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-500)',
          }}>
            Existing entries
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 10px',
              background: 'transparent',
              border: '1px solid var(--ink-200)',
              borderRadius: 4,
              fontFamily: 'var(--font-sans)', fontSize: 12,
              color: 'var(--ink-700)',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'border-color 200ms, color 200ms',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'var(--ink-400)'; e.currentTarget.style.color = 'var(--ink-900)'; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ink-200)'; e.currentTarget.style.color = 'var(--ink-700)'; }}
          >
            <RefreshCw size={12} strokeWidth={1.6} style={{
              animation: loading ? 'eai-spin 900ms linear infinite' : 'none',
            }} />
            Refresh
          </button>
        </div>

        {/* List */}
        {loadError && (
          <div style={{
            padding: '14px 16px',
            background: 'var(--critical-bg)',
            border: '1px solid #FECACA',
            borderRadius: 4,
            fontFamily: 'var(--font-sans)', fontSize: 13,
            color: 'var(--critical)',
          }}>
            {loadError} Make sure the backend is running at <span style={{ fontFamily: 'var(--font-mono)' }}>{API_BASE}</span>.
          </div>
        )}

        {!loadError && entries.length === 0 && !loading && (
          <div style={{
            padding: '32px 24px',
            background: '#FFF',
            border: '1px dashed var(--ink-300)',
            borderRadius: 6,
            textAlign: 'center',
            fontFamily: 'var(--font-sans)', color: 'var(--ink-500)',
          }}>
            <Database size={20} strokeWidth={1.4} style={{ marginBottom: 10, color: 'var(--ink-400)' }} />
            <div style={{ fontSize: 14 }}>No entries yet. Add the first one above.</div>
          </div>
        )}

        {entries.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map((entry, i) => (
              <EntryRow
                key={entry.id ?? entry._id ?? i}
                entry={entry}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
