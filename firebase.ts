
import { initializeApp, getApp, getApps, type FirebaseApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from '@firebase/auth';
import { getFirestore, type Firestore } from '@firebase/firestore';

// 必須使用靜態字串存取，Vite 才能在 Build 時正確替換值
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// 容錯檢查：如果是在非 Vite 環境或 AI Studio 預覽環境
if (!firebaseConfig.apiKey && typeof process !== 'undefined' && process.env) {
  firebaseConfig.apiKey = process.env.FIREBASE_API_KEY || '';
  firebaseConfig.authDomain = process.env.FIREBASE_AUTH_DOMAIN || '';
  firebaseConfig.projectId = process.env.FIREBASE_PROJECT_ID || '';
  firebaseConfig.storageBucket = process.env.FIREBASE_STORAGE_BUCKET || '';
  firebaseConfig.messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || '';
  firebaseConfig.appId = process.env.FIREBASE_APP_ID || '';
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
const googleProvider = new GoogleAuthProvider();

const hasValidConfig = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 10 &&
  firebaseConfig.projectId
);

if (hasValidConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
}

export { auth, db, googleProvider, hasValidConfig, firebaseConfig };
