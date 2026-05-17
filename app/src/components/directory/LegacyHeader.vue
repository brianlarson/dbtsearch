<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { publicPath } from '@/lib/publicPath'

const props = withDefaults(
  defineProps<{
    isAdmin?: boolean
    /**
     * Provider portal: Contact + Manage only (no Login/Logout in the bar). Sign out lives elsewhere if needed.
     */
    providerPortalNav?: boolean
  }>(),
  {
    isAdmin: false,
    providerPortalNav: false,
  },
)

const authHref = computed(() => {
  if (props.isAdmin) return '/admin'
  return '/login'
})

const authLabel = computed(() => {
  if (props.isAdmin) return 'Admin'
  return 'Login'
})

const authButtonModifier = computed(() => 'btn-secondary fw-semibold')

/** Hide Login/Admin when viewing the portal as a provider (Manage is the portal entry). */
const showAuthButton = computed(() => !props.providerPortalNav || props.isAdmin)

const showManageButton = computed(() => props.providerPortalNav && !props.isAdmin)
</script>

<template>
  <header class="navbar navbar-expand-lg bg-body navbar-sticky sticky-top z-fixed px-0">
    <div class="container d-flex flex-nowrap align-items-center gap-2">
      <RouterLink
        class="navbar-brand py-1 py-lg-2 py-xl-1 me-0 flex-shrink-0"
        to="/"
      >
        <span class="d-flex flex-shrink-0 text-secondary rtl-flip me-2">
          <!-- Large mark only when the bar is expanded (lg+); compact logo with right-edge menu button below lg. -->
          <img
            :src="publicPath('images/dbtsearch-logo.svg')"
            alt="DBTsearch"
            class="d-lg-none"
            style="max-width: 170px"
          />
          <img
            :src="publicPath('images/dbtsearch-logo.svg')"
            alt="DBTsearch"
            class="d-none d-lg-block"
            style="max-width: 280px"
          />
        </span>
        <div class="visually-hidden">DBTsearch</div>
      </RouterLink>

      <nav
        id="navbarNav"
        class="legacy-header-offcanvas offcanvas offcanvas-start flex-grow-1 flex-shrink-1 min-w-0 w-lg-auto ms-lg-auto"
        tabindex="-1"
        aria-labelledby="navbarNavLabel"
      >
        <div class="offcanvas-header py-3 d-lg-none">
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div
          class="offcanvas-body pt-3 pb-4 py-lg-0 d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-lg-end flex-grow-1 gap-3"
        >
          <ul class="navbar-nav flex-lg-row align-items-lg-center gap-1 gap-lg-0">
            <li class="nav-item py-1 py-lg-2">
              <RouterLink class="nav-link" to="/providers">Providers</RouterLink>
            </li>
            <li class="nav-item py-1 py-lg-2">
              <RouterLink class="nav-link" to="/about">About</RouterLink>
            </li>
          </ul>
          <div
            class="d-flex flex-nowrap gap-2 align-items-center justify-content-between justify-content-lg-start w-100 w-lg-auto"
          >
            <RouterLink
              class="btn btn-outline-secondary flex-grow-1 flex-lg-grow-0 me-lg-2"
              to="/contact"
            >
              Contact
            </RouterLink>
            <RouterLink
              v-if="showAuthButton"
              class="btn flex-grow-1 flex-lg-grow-0"
              :class="[authButtonModifier, { active: isAdmin }]"
              :to="authHref"
            >
              <i v-if="isAdmin" class="fi-unlock fs-base ms-n1 me-2" />
              {{ authLabel }}
            </RouterLink>
            <RouterLink
              v-if="showManageButton"
              class="btn btn-secondary fw-semibold flex-grow-1 flex-lg-grow-0"
              to="/portal"
            >
              <i class="fi-edit fs-base ms-n1 me-2" aria-hidden="true" />
              Manage
            </RouterLink>
          </div>
        </div>
      </nav>

      <button
        type="button"
        class="navbar-toggler d-lg-none flex-shrink-0 ms-1"
        data-bs-toggle="offcanvas"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon" />
      </button>
    </div>
  </header>
</template>

<style scoped>
/*
 * Desktop: Finder sets .navbar-expand-lg .offcanvas { flex-grow: 1 } without pinning the block right.
 * Container is a flex row + ms-lg-auto on the nav; force-grow 0 / width auto so the cluster sits flush right.
 */
@media (min-width: 992px) {
  .legacy-header-offcanvas {
    display: flex !important;
    justify-content: flex-end !important;
    flex-grow: 0 !important;
    flex-basis: auto !important;
    width: auto !important;
    max-width: none !important;
    margin-left: auto !important;
  }
}
</style>
