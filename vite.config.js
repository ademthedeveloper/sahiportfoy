import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: '/' so the build works at any host (Vercel, GitHub Pages, custom domain).
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});