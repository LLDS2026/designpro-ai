
import { initializeApp, getApp, getApps, type FirebaseApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from '@firebase/auth';
import { getFirestore, type Firestore } from '@firebase/firestore';

// 建立一個安全的環境變數讀取助手
const getEnv = (key: string): string => {
  try {
    // 優先嘗試 Vite 的 import.meta.env
    // @ts-ignore
    if (import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // 次之嘗試 Node/Studio 的 process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || '';
    }
  } catch (e) {
    // 忽略錯誤
  }
  return '';
};

// 支援 VITE_ 前綴與原始前綴（相容性）
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || getEnv('FIREBASE_API_KEY') || '',
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || getEnv('FIREBASE_AUTH_DOMAIN') || '',
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || getEnv('FIREBASE_PROJECT_ID') || '',
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || getEnv('FIREBASE_STORAGE_BUCKET') || '',
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || getEnv('FIREBASE_MESSAGING_SENDER_ID') || '',
  appId: getEnv('VITE_FIREBASE_APP_ID') || getEnv('FIREBASE_APP_ID') || ''
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
const googleProvider = new GoogleAuthProvider();

const hasValidConfig = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 10 &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (hasValidConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase Service Initialized:", firebaseConfig.projectId);
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
  }
}

export { auth, db, googleProvider, hasValidConfig, firebaseConfig };
