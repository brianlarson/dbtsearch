import { createRouter, createWebHistory } from 'vue-router'
import SplashPageView from '@/views/SplashPageView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: SplashPageView,
    },
  ],
})

export default router
