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
    class="alert alert-light border border-secondary border-opacity-25 rounded shadow-sm mb-4 py-3 px-3 px-md-4"
    role="region"
    aria-label="Cookie notice"
  >
    <div class="d-flex flex-column flex-md-row gap-3 align-items-md-start">
      <div class="flex-grow-1">
        <p class="small text-body-secondary mb-1 mb-md-0 lh-base">
          We use cookies for essential features (such as remembering your preferences on this device). Continuing to use
          the site assumes you are fine with that.
        </p>
        <RouterLink to="/about" class="small text-body-secondary text-decoration-underline">
          About DBTsearch
        </RouterLink>
      </div>
      <div class="d-flex flex-shrink-0 gap-2 align-items-center">
        <button type="button" class="btn btn-sm btn-outline-secondary px-3" @click="dismiss">Accept</button>
        <button type="button" class="btn-close" aria-label="Dismiss cookie notice" @click="dismiss" />
      </div>
    </div>
  </div>
</template>
