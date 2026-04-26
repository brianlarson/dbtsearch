import { createRouter, createWebHistory } from 'vue-router'
import SplashPageView from '@/views/SplashPageView.vue'
import DirectoryPageView from '@/views/DirectoryPageView.vue'
import AdminPageView from '@/views/AdminPageView.vue'
import AboutPageView from '@/views/AboutPageView.vue'
import ContactPageView from '@/views/ContactPageView.vue'
import RegisterPageView from '@/views/RegisterPageView.vue'
import LoginPageView from '@/views/LoginPageView.vue'
import LogoutPageView from '@/views/LogoutPageView.vue'
import NotFoundPageView from '@/views/NotFoundPageView.vue'
import ProviderPortalPageView from '@/views/ProviderPortalPageView.vue'
import { isProviderPortalLoggedIn } from '@/lib/providerSession'

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
    {
      path: '/about',
      name: 'about',
      component: AboutPageView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactPageView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPageView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPageView,
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutPageView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPageView,
    },
    {
      path: '/portal',
      name: 'provider-portal',
      component: ProviderPortalPageView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPageView,
    },
  ],
})

router.beforeEach((to) => {
  if (to.name !== 'provider-portal') return true
  if (isProviderPortalLoggedIn()) return true
  return { name: 'login', query: { redirect: to.fullPath } }
})

export default router
