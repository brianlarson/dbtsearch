/// <reference types="vite/client" />

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Browser tab title segment (see `router.afterEach` in `router/index.ts`). */
    title?: string
  }
}
