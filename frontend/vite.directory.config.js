import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type { import('vite').UserConfig } */
export default {
  plugins: [tailwindcss()],
  build: {
    outDir: path.resolve(__dirname, '../web/css'),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'directory-entry.js'),
      output: {
        assetFileNames: 'directory.css',
        entryFileNames: 'directory.min.js',
      },
    },
    cssCodeSplit: false,
  },
};
