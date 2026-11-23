import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4173,
    strictPort: false,
    allowedHosts: ['hack2skillchalange6.onrender.com', '.onrender.com', 'localhost', '127.0.0.1'],
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['hack2skillchalange6.onrender.com', '.onrender.com', 'localhost', '127.0.0.1'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
