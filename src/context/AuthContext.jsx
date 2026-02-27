/**
 * AuthContext.jsx
 *
 * Technician identity and session state.
 *
 * On first visit: login() registers credentials in localStorage.
 * On return visits: login() validates against stored credentials.
 *
 * TODO: Replace localStorage credential storage with Firebase Auth
 * when backend integration is added in a later phase.
 */

import { createContext, useContext, useState } from 'react';
import { getUser, saveUser, clearUser } from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = getUser();
  const [user, setUser] = useState(
    stored ? { name: stored.name, loggedIn: true } : { name: '', loggedIn: false }
  );

  /**
   * Logs in or registers a technician.
   * Returns { success: true } or { success: false, error: string }.
   */
  const login = (name, password) => {
    const trimmedName = name.trim();
    const existing = getUser();

    if (existing) {
      // Return visit — validate credentials
      if (existing.name !== trimmedName || existing.password !== password) {
        return { success: false, error: 'Incorrect name or password.' };
      }
    } else {
      // First visit — register
      saveUser(trimmedName, password);
    }

    setUser({ name: trimmedName, loggedIn: true });
    return { success: true };
  };

  /** Clears session. Audits remain in localStorage. */
  const logout = () => {
    clearUser();
    setUser({ name: '', loggedIn: false });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
