import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC4GKGwExRba4FUJBN1qwZtWuixbMC7ugA',
  authDomain: 'spearheadscoretracker.web.app',
  projectId: 'spearheadscoretracker',
  storageBucket: 'spearheadscoretracker.firebasestorage.app',
  messagingSenderId: '176525277455',
  appId: '1:176525277455:web:2d6f9964e8f65c249d667a',
  measurementId: 'G-FCHXTYLKFS',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
