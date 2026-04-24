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
      path: '/providers',
      name: 'directory',
      component: DirectoryPageView,
    },
    {
      path: '/directory',
      redirect: '/providers',
    },
  ],
})

export default router
