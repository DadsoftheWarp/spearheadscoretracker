import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC4GKGwExRba4FUJBN1qwZtWuixbMC7ugA',
  // Must match the hosting domain so the auth handler is same-origin (required for iOS Safari)
  authDomain: 'spearheadscoretracker.web.app',
  projectId: 'spearheadscoretracker',
  storageBucket: 'spearheadscoretracker.firebasestorage.app',
  messagingSenderId: '176525277455',
  appId: '1:176525277455:web:2d6f9964e8f65c249d667a',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
