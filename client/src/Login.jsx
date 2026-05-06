import { useState } from 'react';
import { ArrowRight, KeyRound } from 'lucide-react';

// Brand logo mark — matches logo-mark.svg from design bundle
function LogoMark({ size = 32, bg = 'var(--ink-900)', color = 'var(--paper-100)' }) {
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

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function submit(e) {
    e?.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ email, name: email.split('@')[0] });
    }, 500);
  }

  const inputStyle = {
    width: '100%', fontSize: 15, color: 'var(--ink-900)',
    background: '#FFF', border: '1px solid var(--ink-300)',
    borderRadius: 4, padding: '12px 14px',
    transition: 'border-color 200ms, box-shadow 200ms',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper-100)',
      display: 'grid',
      gridTemplateColumns: '1fr minmax(440px, 520px)',
    }}>
      {/* ── Left: editorial ink panel ── */}
      <aside style={{
        background: 'var(--ink-900)',
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogoMark size={32} bg="var(--paper-100)" color="var(--ink-900)" />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '-0.012em',
            color: 'var(--paper-100)',
          }}>
            Edge<em style={{ fontStyle: 'italic' }}>AI</em>
          </span>
        </div>

        {/* Hero copy */}
        <div style={{ maxWidth: 520 }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--bark-300)',
            marginBottom: 24,
          }}>
            The agent system, for streak advisors
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 52,
            fontWeight: 500,
            letterSpacing: '-0.022em',
            lineHeight: 1.04,
            color: 'var(--paper-100)',
            margin: 0,
          }}>
            Four specialists.{' '}
            <span style={{ display: 'block' }}>One inbox.</span>
            <span style={{ display: 'block', color: 'var(--bark-300)', fontStyle: 'italic' }}>
              Built for your stack.
            </span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 17,
            lineHeight: 1.55,
            color: 'var(--ink-300)',
            marginTop: 28,
            maxWidth: 460,
          }}>
            Business coordination, grant research, contracting, and personal
            scheduling — each running as its own agent, routed automatically
            when you message the team.
          </p>
        </div>

        {/* Footer meta */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          letterSpacing: '0.02em',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: 'var(--ink-300)' }}>Deployment</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-400)' }}>
              streak-advisors.edgeai.app
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            <span style={{ color: 'var(--ink-300)' }}>Build</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-400)' }}>
              v2.4 · agents online
            </span>
          </div>
        </div>

        {/* Agent index — top right */}
        <div style={{
          position: 'absolute',
          top: 48, right: 56,
          display: 'flex', flexDirection: 'column', gap: 14,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ink-400)',
          letterSpacing: '0.04em',
          textAlign: 'right',
        }}>
          <div>01 &nbsp; Business Assistant</div>
          <div>02 &nbsp; Grant Specialist</div>
          <div>03 &nbsp; Contracting Specialist</div>
          <div>04 &nbsp; Personal Agent</div>
        </div>
      </aside>

      {/* ── Right: sign-in form on cream ── */}
      <main style={{
        background: 'var(--paper-50)',
        padding: '48px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderLeft: '1px solid var(--ink-200)',
      }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink-500)',
            marginBottom: 16,
          }}>
            Sign in
          </div>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 38,
            fontWeight: 500,
            letterSpacing: '-0.018em',
            lineHeight: 1.08,
            color: 'var(--ink-900)',
            margin: 0,
          }}>
            Welcome back, advisor.
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            lineHeight: 1.55,
            color: 'var(--ink-500)',
            marginTop: 12,
          }}>
            Sign in to reach your agents.
          </p>

          {error && (
            <div style={{
              marginTop: 20,
              padding: '10px 14px',
              background: 'var(--critical-bg)',
              border: '1px solid #FECACA',
              borderRadius: 4,
              fontSize: 13,
              color: 'var(--critical)',
            }}>
              {error}
            </div>
          )}

          <form
            onSubmit={submit}
            style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 40 }}
          >
            {/* Email field */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-sans)' }}>
              <span style={{
                fontSize: 12, fontWeight: 500, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--ink-500)',
              }}>
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@firm.com"
                autoComplete="email"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--bark-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,66,38,0.18)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--ink-300)'; e.target.style.boxShadow = 'none'; }}
              />
            </label>

            {/* Password field */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-sans)' }}>
              <span style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                fontSize: 12, fontWeight: 500, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--ink-500)',
              }}>
                <span>Password</span>
                <span style={{
                  letterSpacing: 0, textTransform: 'none', fontSize: 12,
                  color: 'var(--ink-500)', cursor: 'pointer', fontWeight: 400,
                  textDecoration: 'underline', textDecorationColor: 'var(--ink-300)',
                }}>
                  Forgot?
                </span>
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--bark-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(107,66,38,0.18)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--ink-300)'; e.target.style.boxShadow = 'none'; }}
              />
            </label>

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 20px',
                  background: loading ? 'var(--bark-300)' : 'var(--bark-600)',
                  color: 'var(--paper-50)',
                  fontSize: 15, fontWeight: 500,
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 200ms var(--ease-standard)',
                  border: 'none',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--bark-700)'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--bark-600)'; }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && <ArrowRight size={16} strokeWidth={1.6} />}
              </button>
            </div>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              color: 'var(--ink-400)', fontFamily: 'var(--font-sans)', fontSize: 12,
              margin: '4px 0',
            }}>
              <span style={{ flex: 1, height: 1, background: 'var(--ink-200)' }} />
              <span style={{ letterSpacing: '0.14em', textTransform: 'uppercase' }}>Or</span>
              <span style={{ flex: 1, height: 1, background: 'var(--ink-200)' }} />
            </div>

            <button
              type="button"
              onClick={submit}
              style={{
                width: '100%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px 20px',
                background: '#FFF', color: 'var(--ink-900)',
                border: '1px solid var(--ink-300)',
                fontSize: 15, fontWeight: 500,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'border-color 200ms',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink-500)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ink-300)'}
            >
              <KeyRound size={16} strokeWidth={1.6} />
              Continue with SSO
            </button>
          </form>

          <div style={{
            marginTop: 48, paddingTop: 20,
            borderTop: '1px solid var(--ink-200)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--ink-500)',
          }}>
            <span>
              Edge<em style={{ fontStyle: 'italic' }}>AI</em> Solutions · 2026
            </span>
            <a href="#" style={{
              color: 'var(--ink-700)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--ink-300)',
            }}>
              Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
