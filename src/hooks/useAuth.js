import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
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
    // After Google redirects back to the app, grab the signed-in user
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch(() => {
        setAuthError('Sign-in failed. Please try again.');
      });

    // Listen for auth state changes (restores session on page load)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? false);  // false = definitively signed out
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  function signIn() {
    setAuthError(null);
    // Redirect works on all browsers including iOS Safari
    // Popup is blocked by Safari's ITP when using a cross-origin auth handler
    signInWithRedirect(auth, googleProvider);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { user, loading, signIn, signOut, authError };
}
