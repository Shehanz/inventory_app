
import { useState } from 'react';
import { Eye, EyeOff, Boxes, LoaderCircle } from 'lucide-react';
import './Login.css';

const API = 'http://localhost:3000/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal.');
      }

      onLogin(data.user);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Server tidak terhubung. Pastikan backend berjalan.'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="visual-content">
          <div className="brand-mark">
            <Boxes size={28} />
          </div>

          <span className="visual-label">INVENTORY MANAGEMENT</span>

          <h1>
            Kelola inventaris.
            <br />
            Lebih mudah.
          </h1>

          <p>
            Pantau stok barang, kelola kategori, dan
            jaga operasional bisnis tetap terorganisir
            dalam satu dashboard.
          </p>

          <div className="visual-footer">
            INVENTORY SYSTEM · SECURE WORKSPACE
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-brand">
            <Boxes size={25} />
            <span>Inventory</span>
          </div>

          <span className="welcome-label">WELCOME BACK</span>
          <h2>Login akun</h2>
          <p className="login-description">
            Masukkan akun kamu untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? 'Sembunyikan password'
                    : 'Tampilkan password'
                }
              >
                {showPassword
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Memverifikasi...
                </>
              ) : (
                'Login ke Dashboard'
              )}
            </button>
          </form>

          <p className="login-security">
            Akses terbatas untuk pengguna terdaftar.
          </p>
        </div>
      </section>
    </main>
  );
}
