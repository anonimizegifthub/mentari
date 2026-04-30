
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
    hmr: false,
    ws: false,
  },
});
