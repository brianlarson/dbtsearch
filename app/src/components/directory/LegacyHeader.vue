<script setup lang="ts">
withDefaults(
  defineProps<{
    isAdmin?: boolean
  }>(),
  {
    isAdmin: false,
  },
)
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

      <nav id="navbarNav" class="offcanvas offcanvas-start" tabindex="-1" aria-labelledby="navbarNavLabel">
        <div class="offcanvas-header py-3">
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div class="offcanvas-body pt-2 pb-4 py-lg-0 mx-lg-auto">
          <ul class="navbar-nav position-relative">
            <li class="nav-item py-lg-2 me-lg-n2 me-xl-0"><a class="nav-link" href="/providers">Providers</a></li>
            <li class="nav-item py-lg-2 me-lg-n2 me-xl-0"><a class="nav-link" href="/about">About</a></li>
            <li class="nav-item py-lg-2 me-lg-n2 me-xl-0"><a class="nav-link" href="/faqs">FAQs</a></li>
          </ul>
        </div>
      </nav>

      <div class="d-flex gap-sm-1">
        <a class="btn btn-outline-secondary me-2 d-none d-md-inline" href="/contact">Contact</a>
        <div>
          <a class="btn btn-secondary fw-semibold" :class="{ active: isAdmin }" :href="isAdmin ? '/admin' : '/login'">
            <i v-if="isAdmin" class="fi-unlock fs-base ms-n1 me-2" />
            {{ isAdmin ? 'Admin' : 'Login' }}
          </a>
        </div>
      </div>
    </div>
  </header>
</template>
