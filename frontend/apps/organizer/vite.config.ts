import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { portal } from './src/portal.config';

// Each portal runs on its own dev port and proxies /api to the shared backend.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // "@/..." → app src (shadcn convention used by the integrated dashboard).
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    port: portal.devPort,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
