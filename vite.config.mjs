import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    server: {
      proxy: {
        "/api":'http://localhost:5001',
      },
      // Avoid HMR churn when npm run capture:markup writes docs/reference-markup/*.html
      watch: {
        ignored: ['**/docs/reference-markup/**'],
      },
    },
    plugins: [react()],
  };
});
