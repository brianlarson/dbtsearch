import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
var craftWebFind = fileURLToPath(new URL('../cms/web/find', import.meta.url));
export default defineConfig(function (_a) {
    var mode = _a.mode;
    return ({
        plugins: [vue()],
        /** Production SPA lives at https://www.dbtsearch.org/find/ (Craft on same host). */
        base: mode === 'production' ? '/find/' : '/',
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: 3000,
        },
        build: mode === 'production'
            ? {
                outDir: craftWebFind,
                emptyOutDir: true,
            }
            : undefined,
    });
});
