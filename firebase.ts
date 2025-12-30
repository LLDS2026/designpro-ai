
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// These values are injected by vite.config.ts at build time from GitHub Secrets
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

// 嚴謹檢查金鑰是否有效
const hasValidConfig = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 20);

if (hasValidConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("✅ Firebase 雲端服務載入成功", { project: firebaseConfig.projectId });
  } catch (error) {
    console.error("❌ Firebase 初始化異常:", error);
  }
} else {
  console.warn("⚠️ Firebase 金鑰不完整，系統將維持訪客/展示模式。");
}

export { auth, db, googleProvider, hasValidConfig, firebaseConfig };
