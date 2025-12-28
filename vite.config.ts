import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 確保 base 路徑與您的 repository 名稱一致
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
    // 增加空值保護
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});
