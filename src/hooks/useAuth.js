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

const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(() => {});

export function useAuth() {
  // null = loading, false = signed out, object = signed-in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Pick up the auth result after returning from Google's sign-in page
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch(() => {
        setAuthError('Sign-in failed. Please try again.');
      });

    // Restore auth state from localStorage on every visit
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? false);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn() {
    setAuthError(null);
    await signInWithRedirect(auth, provider);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { user, loading, signIn, signOut, authError };
}
