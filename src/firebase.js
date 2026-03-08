// ⚠️  Paste your Firebase config object here.
// Get it from: Firebase Console → Project Settings → Your apps → Web app
//
// Example shape (replace ALL values with your own):
//
// const firebaseConfig = {
//   apiKey: "AIzaSy...",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abc123",
// };

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyC4GKGwExRba4FUJBN1qwZtWuixbMC7ugA',
  authDomain: 'spearheadscoretracker.firebaseapp.com',
  projectId: 'spearheadscoretracker',
  storageBucket: 'spearheadscoretracker.firebasestorage.app',
  messagingSenderId: '176525277455',
  appId: '1:176525277455:web:2d6f9964e8f65c249d667a',
  measurementId: 'G-FCHXTYLKFS',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
