<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
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
      <RouterLink class="text-brand" to="/login">Click here</RouterLink> if you would like to login again.
    </p>
  </LegacyPageLayout>
</template>
