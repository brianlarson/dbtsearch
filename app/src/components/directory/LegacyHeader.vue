<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    isAdmin?: boolean
    /** When true, primary auth control is Logout (e.g. provider portal). `isAdmin` wins if both set. */
    showLogout?: boolean
  }>(),
  {
    isAdmin: false,
    showLogout: false,
  },
)

const authHref = computed(() => {
  if (props.isAdmin) return '/admin'
  if (props.showLogout) return '/logout'
  return '/login'
})

const authLabel = computed(() => {
  if (props.isAdmin) return 'Admin'
  if (props.showLogout) return 'Logout'
  return 'Login'
})

/** Logout is outline (like Contact) to de-emphasize ending the session; Login/Admin stay solid. */
const authButtonModifier = computed(() => {
  if (props.showLogout && !props.isAdmin) return 'btn-outline-secondary'
  return 'btn-secondary fw-semibold'
})
</script>

<template>
  <header class="navbar navbar-expand-lg bg-body navbar-sticky sticky-top z-fixed px-0">
    <div class="container">
      <button
        type="button"
        class="navbar-toggler me-3 me-lg-0"
        data-bs-toggle="offcanvas"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon" />
      </button>

      <a class="navbar-brand py-1 py-md-2 py-xl-1 me-2 me-sm-n4 me-md-n5 me-lg-0" href="/">
        <span class="d-flex flex-shrink-0 text-secondary rtl-flip me-2">
          <img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="d-md-none" style="max-width: 170px" />
          <img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="d-none d-md-block" style="max-width: 280px" />
        </span>
        <div class="visually-hidden">DBTsearch</div>
      </a>

      <nav
        id="navbarNav"
        class="offcanvas offcanvas-start flex-grow-1"
        tabindex="-1"
        aria-labelledby="navbarNavLabel"
      >
        <div class="offcanvas-header py-3 d-lg-none">
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div
          class="offcanvas-body pt-2 pb-4 py-lg-0 d-lg-flex align-items-lg-center justify-content-lg-end flex-grow-1 gap-3"
        >
          <ul class="navbar-nav flex-lg-row align-items-lg-center">
            <li class="nav-item py-lg-2">
              <a class="nav-link" href="/providers">Providers</a>
            </li>
            <li class="nav-item py-lg-2">
              <a class="nav-link" href="/about">About</a>
            </li>
          </ul>
          <div class="d-flex flex-wrap gap-sm-1 align-items-center">
            <a class="btn btn-outline-secondary me-2" href="/contact">Contact</a>
            <a class="btn" :class="[authButtonModifier, { active: isAdmin }]" :href="authHref">
              <i v-if="isAdmin" class="fi-unlock fs-base ms-n1 me-2" />
              {{ authLabel }}
            </a>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>
