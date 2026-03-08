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

  useEffect(() => {
    // Handle redirect result (PWA standalone sign-in)
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? false);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn() {
    try {
      if (isStandalone()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch {
      // user cancelled or error — ignore
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { user, loading, signIn, signOut };
}
