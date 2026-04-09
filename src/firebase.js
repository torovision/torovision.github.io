import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ PASTE YOUR COPIED FIREBASE CONFIG OVER THIS OBJECT:
const firebaseConfig = {
  apiKey: "AIzaSyC7YDEeDlUK5wEnSV90k9-9jeVhpufXTRQ",
  authDomain: "ouni-8d935.firebaseapp.com",
  projectId: "ouni-8d935",
  storageBucket: "ouni-8d935.firebasestorage.app",
  messagingSenderId: "529988333963",
  appId: "1:529988333963:web:2c99a842bca83a9e1a3f8e",
  measurementId: "G-78TXZ38ZN0"
};

// We check if you have pasted the keys yet
export const hasFirebase = !!firebaseConfig.apiKey;

// Initialize Firebase only if keys are present
export const app = hasFirebase ? initializeApp(firebaseConfig) : null;
export const db = hasFirebase ? getFirestore(app) : null;
