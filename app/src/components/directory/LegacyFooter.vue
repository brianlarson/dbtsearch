<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-14 border-t border-slate-800">
    <div class="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 lg:px-8">
      <p class="mb-3 text-sm text-slate-300">
        <span class="font-semibold text-white">DBTsearch</span> is powered by
        <a
          href="https://www.tinytreecounseling.com/"
          class="ml-1 text-primary underline decoration-1 hover:opacity-90"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tiny Tree Counseling &amp; Consulting
        </a>
      </p>
      <p class="text-xs text-slate-400">Copyright &copy; {{ year }} DBTsearch.org. All rights reserved.</p>
    </div>
  </footer>
</template>
