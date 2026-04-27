<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { acceptCookieConsent, hasCookieConsent } from '@/lib/cookieConsent'

const open = ref(!hasCookieConsent())

function dismiss(): void {
  acceptCookieConsent()
  open.value = false
}
</script>

<template>
  <div
    v-if="open"
    class="cookie-consent-bar text-white border-top border-light border-opacity-25 shadow-sm"
    role="region"
    aria-label="Cookie notice"
  >
    <div class="container-fluid py-3 px-3 px-md-4">
      <div class="d-flex flex-column flex-md-row gap-3 align-items-md-center">
        <div class="flex-grow-1">
          <p class="small mb-1 mb-md-0 lh-base text-white">
            We use cookies for essential features (such as remembering your preferences on this device). Continuing to
            use the site assumes you are fine with that.
          </p>
          <RouterLink to="/about" class="small link-light link-offset-2 text-decoration-underline">
            About DBTsearch
          </RouterLink>
        </div>
        <div class="d-flex flex-shrink-0 gap-2 align-items-center">
          <button type="button" class="btn btn-sm btn-secondary fw-semibold px-3" @click="dismiss">Accept</button>
          <button type="button" class="btn-close btn-close-white" aria-label="Dismiss cookie notice" @click="dismiss" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Full-width bottom sheet; above `.directory-back-to-top` (1040) so it may cover that control. */
.cookie-consent-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1050;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* Slightly darker than `bg-body` while tracking theme. */
  background-color: color-mix(in srgb, var(--bs-body-bg) 88%, black);
}
</style>
