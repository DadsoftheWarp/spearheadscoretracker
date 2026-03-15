import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase.js';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches;
}


const provider = new GoogleAuthProvider();

export function useAuth() {
  // null = still resolving, false = signed out, object = signed-in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Handle redirect result (PWA standalone sign-in)
    getRedirectResult(auth).catch((err) => {
      if (err?.code !== 'auth/null-user') {
        setAuthError(err?.message ?? 'Sign-in failed. Please try again.');
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? false);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn() {
    setAuthError(null);
    try {
      if (isStandalone()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (err) {
      const code = err?.code ?? '';
      if (code === 'auth/cancelled-popup-request') return;
      if (code === 'auth/popup-blocked') {
        setAuthError('Pop-up was blocked. Please allow pop-ups for this site, or add it to your Home Screen and sign in from there.');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not authorized in Firebase. Add dadsofthewarp.github.io to Firebase Console → Authentication → Authorized domains.');
      } else if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in was cancelled or the pop-up closed unexpectedly. Try again.');
      } else {
        setAuthError(err?.message ?? 'Sign-in failed. Please try again.');
      }
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { user, loading, signIn, signOut, authError };
}
