<script setup lang="ts">
import CookieConsentBar from '@/components/CookieConsentBar.vue'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer bg-body border-top my-5">
    <CookieConsentBar />
    <div class="container pt-5">
      <p class="text-center fw-thin fs-6 mb-3">
        <span class="fw-bold">DBT Search</span> is powered by
        <br class="d-sm-none" />
        <a
          href="https://www.tinytreecounseling.com/"
          class="text-brand"
          target="_blank"
          rel="noopener noreferrer"
          style="text-decoration-thickness: 1px"
        >
          Tiny Tree Counseling
        </a>
      </p>
      <p class="small text-body-secondary text-center mb-0">
        &copy;{{ year }} DBT Search and dbtsearch.org. All rights reserved.
      </p>
    </div>
  </footer>
</template>
