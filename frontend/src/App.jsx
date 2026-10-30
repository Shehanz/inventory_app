
import { useEffect, useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

const API = 'http://localhost:3000/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch(`${API}/auth/me`, {
          credentials: 'include',
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Gagal memeriksa sesi:', error.message);
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    const yakin = window.confirm(
      'Apakah kamu yakin ingin logout dari Stockwise?'
    );

    if (!yakin) return;

    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout gagal. Silakan coba lagi.');
      }

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      window.alert(error.message || 'Terjadi kesalahan saat logout.');
    }
  }

  if (checkingSession) {
    return (
      <div className="session-loading">
        Memeriksa sesi login...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}
