import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/sushruta_soldier/',
  plugins: [react()],
  server: {
    port: 4173,
    open: false
  }
});
