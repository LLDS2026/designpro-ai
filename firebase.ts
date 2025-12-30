
import { initializeApp, getApp, getApps, type FirebaseApp } from '@firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from '@firebase/auth';
import { getFirestore, type Firestore } from '@firebase/firestore';

/**
 * 重要說明：Vite 在 Build 期間會掃描程式碼中的 "import.meta.env.VITE_..." 字串。
 * 不能使用動態 Key 或變數代入，否則編譯器無法進行靜態替換。
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// 只有在靜態讀取失敗（非 Vite 環境）時才嘗試 process.env (用於本地開發或 Studio 預覽)
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
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
}

export { auth, db, googleProvider, hasValidConfig, firebaseConfig };
