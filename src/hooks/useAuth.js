import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase.js';

// Keep the user signed in across browser restarts
setPersistence(auth, browserLocalPersistence).catch(() => {});

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState(null);     // null = still loading
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Listen for auth state changes (restores session on page load)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? false);  // false = definitively signed out
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn() {
    setAuthError(null);
    try {
      // Popup opens a Google sign-in window without redirecting the whole page.
      // This avoids the redirect-URL loop that occurs when authDomain === hosting domain.
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        // Popup was blocked by the browser — fall back to full-page redirect
        signInWithRedirect(auth, googleProvider);
      } else if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError('Sign-in failed. Please try again.');
      }
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { user, loading, signIn, signOut, authError };
}
