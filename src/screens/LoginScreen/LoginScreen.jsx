/**
 * LoginScreen.jsx
 *
 * Technician identity screen. Shown on first visit and after logout.
 *
 * First visit  → registers name + password in localStorage, proceeds to AuditListScreen.
 * Return visit → validates against stored credentials, proceeds to AuditListScreen.
 *
 * TODO: Replace with Firebase Auth in a later phase.
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUser } from '../../services/storageService';
import './LoginScreen.css';

export default function LoginScreen({ onLogin }) {
  const { login } = useAuth();
  const isReturning = !!getUser();

  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !password) {
      setError('Please enter both your name and a password.');
      return;
    }
    const result = login(name, password);
    if (result.success) {
      onLogin();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <span className="login-logo">EyEagle</span>
        <p className="login-subtitle">
          {isReturning ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-name">Your name</label>
            <input
              id="login-name"
              className="login-input"
              type="text"
              placeholder="e.g. Jamie"
              autoComplete="name"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              placeholder="Your password"
              autoComplete={isReturning ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="btn-login" type="submit">
            {isReturning ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
