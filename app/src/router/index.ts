import { createRouter, createWebHistory } from 'vue-router'
import SplashPageView from '@/views/SplashPageView.vue'
import DirectoryPageView from '@/views/DirectoryPageView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: SplashPageView,
    },
    {
      path: '/directory',
      name: 'directory',
      component: DirectoryPageView,
    },
  ],
})

export default router
