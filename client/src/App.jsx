import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import { supabase } from './supabaseClient.js';

function userFromSession(session) {
  if (!session?.user) return null;
  const email = session.user.email || '';
  const meta  = session.user.user_metadata || {};
  const name  = meta.full_name || meta.name || (email ? email.split('@')[0] : 'advisor');
  return { email, name, id: session.user.id };
}

function BootSplash() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--paper-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--ink-500)',
      letterSpacing: '0.14em', textTransform: 'uppercase',
    }}>
      Loading session…
    </div>
  );
}

export default function App() {
  const [user, setUser]       = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(userFromSession(data?.session));
      setBooting(false);
    }).catch(() => {
      if (cancelled) return;
      setBooting(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(userFromSession(session));
    });

    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (booting) return <BootSplash />;
  if (!user)   return <Login onLogin={setUser} />;

  return <Dashboard user={user} onLogout={handleLogout} />;
}
