import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { portal } from './src/portal.config';

// Each portal runs on its own dev port and proxies /api to the shared backend.
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
