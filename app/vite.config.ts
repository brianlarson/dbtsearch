import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const craftWebVue = fileURLToPath(new URL('../cms/web/vue', import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  /** Production build is served under Craft at https://www.dbtsearch.org/vue/ */
  base: mode === 'production' ? '/vue/' : '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  build:
    mode === 'production'
      ? {
          outDir: craftWebVue,
          emptyOutDir: true,
        }
      : undefined,
}))
