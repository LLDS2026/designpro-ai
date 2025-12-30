
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/designpro-ai/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
          charts: ['recharts'],
          gemini: ['@google/genai']
        }
      }
    }
  },
  define: {
    // 注入 Gemini API Key
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    // 注入 Firebase 變數，確保即使 Secrets 沒設定也會回傳空字串而非 undefined
    'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY || ''),
    'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN || ''),
    'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID || ''),
    'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET || ''),
    'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID || ''),
    'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.FIREBASE_APP_ID || ''),
  }
});
