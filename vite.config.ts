
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
          vendor: ['react', 'react-dom'],
          firebase: ['@firebase/app', '@firebase/auth', '@firebase/firestore'],
          lucide: ['lucide-react']
        }
      }
    }
  }
});
