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
    class="cookie-consent-bar bg-secondary text-white border-0 rounded shadow-sm py-3 px-3 px-md-4"
    role="region"
    aria-label="Cookie notice"
  >
    <div class="d-flex flex-column flex-md-row gap-3 align-items-md-center">
      <div class="flex-grow-1">
        <p class="small text-white text-opacity-90 mb-1 mb-md-0 lh-base">
          We use cookies for essential features (such as remembering your preferences on this device). Continuing to use
          the site assumes you are fine with that.
        </p>
        <RouterLink to="/about" class="small link-light link-offset-2 text-decoration-underline">
          About DBTsearch
        </RouterLink>
      </div>
      <div class="d-flex flex-shrink-0 gap-2 align-items-center">
        <button type="button" class="btn btn-sm btn-light fw-semibold px-3" @click="dismiss">Accept</button>
        <button type="button" class="btn-close btn-close-white" aria-label="Dismiss cookie notice" @click="dismiss" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Same corner insets and layering as `.directory-back-to-top` (Top); z-index below it so Top stays clickable. */
.cookie-consent-bar {
  position: fixed;
  left: max(1rem, env(safe-area-inset-left, 0px));
  right: max(1rem, env(safe-area-inset-right, 0px));
  bottom: max(1rem, env(safe-area-inset-bottom, 0px));
  z-index: 1035;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  opacity: 0.92;
  transition: opacity 0.2s ease;
}

.cookie-consent-bar:hover {
  opacity: 1;
}
</style>
