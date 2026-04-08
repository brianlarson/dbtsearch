<script setup lang="ts">
import LegacyContentLayout from '@/components/directory/LegacyContentLayout.vue'
</script>

<template>
  <LegacyContentLayout page-heading="Thank you!" :omit-subheading="true">
    <p class="text-slate-300">
      You are now logged out of the system.<br />
      <RouterLink to="/login" class="text-brand underline decoration-1 hover:opacity-90">Click here</RouterLink>
      if you would like to login again.
    </p>
  </LegacyContentLayout>
</template>
