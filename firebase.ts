
// Fix: Use scoped @firebase packages directly to resolve exported member errors in restricted environments
import { initializeApp, getApp, getApps, type FirebaseApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from '@firebase/auth';
import { getFirestore, type Firestore } from '@firebase/firestore';

// Values injected from GitHub Secrets via vite.config.ts
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || ''
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
const googleProvider = new GoogleAuthProvider();

// Strict check for configuration validity
const hasValidConfig = !!(
  firebaseConfig.apiKey && firebaseConfig.apiKey.length > 20 &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (hasValidConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase Service Loaded Successfully", { project: firebaseConfig.projectId });
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
  }
} else {
  console.warn("⚠️ Firebase configuration missing. App running in offline simulation mode.");
}

export { auth, db, googleProvider, hasValidConfig, firebaseConfig };
