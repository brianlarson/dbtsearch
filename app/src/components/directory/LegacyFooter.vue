<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer bg-body border-top my-5">
    <div class="container pt-5">
      <p class="text-center fw-thin fs-6 mb-3">
        <span class="fw-bold">DBTsearch</span> is powered by
        <a
          href="https://www.tinytreecounseling.com/"
          class="text-brand"
          target="_blank"
          rel="noopener noreferrer"
          style="text-decoration-thickness: 1px"
        >
          Tiny Tree Counseling &amp; Consulting
        </a>
      </p>
      <p class="text-body-secondary fs-sm text-center mb-0">
        Copyright &copy;{{ year }} DBTsearch.org. All rights reserved.
      </p>
    </div>
  </footer>
</template>
