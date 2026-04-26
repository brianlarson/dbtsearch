<script setup lang="ts">
import { onMounted } from 'vue'
import LegacyPageLayout from '@/components/directory/LegacyPageLayout.vue'
import { clearProviderPortalSession } from '@/lib/providerSession'

onMounted(() => {
  clearProviderPortalSession()
})
</script>

<template>
  <LegacyPageLayout page-heading="Thank you!">
    <p class="fs-base">
      You are now logged out of the system.
      <br />
      <a class="text-brand" href="/login">Click here</a> if you would like to login again.
    </p>
  </LegacyPageLayout>
</template>
