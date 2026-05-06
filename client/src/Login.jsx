import { useState } from 'react';
import { Layers } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    // Simulated auth — replace with Supabase
    setTimeout(() => {
      setLoading(false);
      onLogin({ email, name: email.split('@')[0] });
    }, 500);
  }

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '9px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg)',
    transition: 'border-color 0.15s',
    marginBottom: '16px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '40px 36px',
      }}>
        {/* Brand */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: 'var(--color-accent)',
            borderRadius: '6px',
            marginBottom: '16px',
          }}>
            <Layers size={18} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '20px',
            fontWeight: '400',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: '1.2',
            marginBottom: '4px',
          }}>
            Edge AI for Streak Advisors
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
            AI Agent System
          </p>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            Welcome back
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Sign in to access your agents
          </div>
        </div>

        {error && (
          <div style={{
            padding: '9px 12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#B91C1C',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--color-text-secondary)',
            marginBottom: '6px',
          }}>
            Email
          </label>
          <input
            style={inputStyle}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            autoComplete="email"
          />

          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: 'var(--color-text-secondary)',
            marginBottom: '6px',
          }}>
            Password
          </label>
          <input
            style={{ ...inputStyle, marginBottom: '20px' }}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'block',
              width: '100%',
              padding: '9px 16px',
              background: loading ? 'var(--color-surface-raised)' : 'var(--color-accent)',
              color: loading ? 'var(--color-text-tertiary)' : '#fff',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              border: 'none',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = 'var(--color-accent-hover)'; }}
            onMouseLeave={e => { if (!loading) e.target.style.background = 'var(--color-accent)'; }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-border)',
          fontSize: '12px',
          color: 'var(--color-text-tertiary)',
          textAlign: 'center',
        }}>
          Edge AI Solutions © 2026
        </div>
      </div>
    </div>
  );
}
