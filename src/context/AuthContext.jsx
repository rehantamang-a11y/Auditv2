/**
 * AuthContext.jsx
 *
 * Technician identity and session state via Firebase Auth.
 *
 * login()  — signs in with email + password via Firebase
 * logout() — signs out and clears local session
 *
 * Firebase persists the session automatically (indexedDB),
 * so technicians stay logged in across page reloads.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on reload
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        setUser({ email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  /**
   * Sign in with email + password.
   * Returns { success: true } or { success: false, error: string }.
   */
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg =
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
          ? 'Incorrect email or password.'
          : err.code === 'auth/user-not-found'
          ? 'No account found with that email.'
          : err.code === 'auth/too-many-requests'
          ? 'Too many attempts. Try again later.'
          : 'Sign in failed. Please try again.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) return null; // wait for Firebase to restore session

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
