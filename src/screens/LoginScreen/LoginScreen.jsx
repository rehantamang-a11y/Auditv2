/**
 * LoginScreen.jsx
 *
 * Employee sign-in screen. Validates against Firebase Auth.
 * Accounts are created by the admin in the Firebase Console —
 * employees cannot self-register.
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginScreen.css';

export default function LoginScreen({ onLogin }) {
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    if (result.success) {
      onLogin();
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <span className="login-logo">EyEagle</span>
        <p className="login-subtitle">Sign in to your account</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              placeholder="you@ipsator.com"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
