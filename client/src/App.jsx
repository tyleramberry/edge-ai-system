import { useState } from 'react';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
