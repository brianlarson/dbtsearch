<script setup lang="ts">
import LegacyContentLayout from '@/components/directory/LegacyContentLayout.vue'
</script>

<template>
  <LegacyContentLayout
    page-heading="Admin"
    page-subheading="Provider Management"
  >
    <p class="mb-4 text-slate-300">
      Admin tools are not wired in this build yet. Use the directory to browse providers.
    </p>
    <RouterLink
      to="/directory"
      class="inline-flex items-center rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 hover:border-primary/50 hover:text-white"
    >
      Go to directory
    </RouterLink>
  </LegacyContentLayout>
</template>
