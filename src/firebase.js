import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ PASTE YOUR COPIED FIREBASE CONFIG OVER THIS OBJECT:
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// We check if you have pasted the keys yet
export const hasFirebase = !!firebaseConfig.apiKey;

// Initialize Firebase only if keys are present
export const app = hasFirebase ? initializeApp(firebaseConfig) : null;
export const db = hasFirebase ? getFirestore(app) : null;
