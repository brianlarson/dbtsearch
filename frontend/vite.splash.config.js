import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type { import('vite').UserConfig } */
export default {
  plugins: [tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, '../cms/web/css'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'splash-entry.js'),
      output: {
        assetFileNames: 'splash.css',
        entryFileNames: 'splash.min.js',
      },
    },
    cssCodeSplit: false,
  },
};
