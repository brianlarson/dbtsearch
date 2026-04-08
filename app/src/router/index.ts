import { createRouter, createWebHistory } from 'vue-router'
import AboutPageView from '@/views/AboutPageView.vue'
import AdminPageView from '@/views/AdminPageView.vue'
import ContactPageView from '@/views/ContactPageView.vue'
import DirectoryPageView from '@/views/DirectoryPageView.vue'
import FaqsPageView from '@/views/FaqsPageView.vue'
import LoginPageView from '@/views/LoginPageView.vue'
import LogoutPageView from '@/views/LogoutPageView.vue'
import RegisterPageView from '@/views/RegisterPageView.vue'
import SplashPageView from '@/views/SplashPageView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'splash',
      component: SplashPageView,
      meta: { title: 'Home' },
    },
    {
      path: '/directory',
      name: 'directory',
      component: DirectoryPageView,
      meta: { title: 'Providers' },
    },
    { path: '/providers', redirect: { name: 'directory' } },
    {
      path: '/about',
      name: 'about',
      component: AboutPageView,
      meta: { title: 'About' },
    },
    {
      path: '/faqs',
      name: 'faqs',
      component: FaqsPageView,
      meta: { title: 'FAQs' },
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactPageView,
      meta: { title: 'Contact' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPageView,
      meta: { title: 'Login' },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPageView,
      meta: { title: 'Register' },
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutPageView,
      meta: { title: 'Logged out' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPageView,
      meta: { title: 'Admin' },
    },
  ],
})

router.afterEach((to) => {
  const t = to.meta.title
  document.title = typeof t === 'string' && t.length > 0 ? `${t} · DBTsearch` : 'DBTsearch'
})

export default router
