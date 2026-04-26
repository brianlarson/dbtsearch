<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import ProviderList from '@/components/directory/ProviderList.vue'
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'
import { useProvidersQuery } from '@/composables/useProvidersQuery'

const onlyAvailable = ref(true)
const { providers, isLoading, errorMessage, fetchProviders } = useProvidersQuery()

function loadProviders() {
  void fetchProviders({ onlyAvailable: onlyAvailable.value })
}

onMounted(loadProviders)

watch(onlyAvailable, loadProviders)
</script>

<template>
  <LegacyHeader />

  <main class="content-wrapper">
    <LegacyPageHeader
      page-heading="Providers"
      page-subheading="DBT Providers in Minnesota"
      compact-below
    />
    <p v-if="errorMessage" class="container text-danger small mb-0">{{ errorMessage }}</p>
    <p v-else-if="isLoading && providers.length === 0" class="container text-body-secondary small mb-0">
      Loading providers…
    </p>
    <ProviderList
      v-if="!errorMessage"
      :providers="providers"
      :only-available="onlyAvailable"
      @update:only-available="onlyAvailable = $event"
    />
  </main>

  <LegacyFooter />
</template>
