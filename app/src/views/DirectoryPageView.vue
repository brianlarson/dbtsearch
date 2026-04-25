<script setup lang="ts">
import { computed, ref } from 'vue'
import DirectoryFilters from '@/components/directory/DirectoryFilters.vue'
import ProviderList from '@/components/directory/ProviderList.vue'
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'
import { providerPortalMock } from '@/mocks/providerPortalMock'

const onlyAvailable = ref(true)
const providers = ref(providerPortalMock)

const filteredProviders = computed(() =>
  providers.value.filter((provider) => (onlyAvailable.value ? provider.availability : true)),
)
const resultCount = computed(() => filteredProviders.value.length)

function resetFilters() {
  onlyAvailable.value = true
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <LegacyHeader />
    <LegacyPageHeader page-heading="Providers" page-subheading="DBT Providers in Minnesota" />

    <main class="pb-12">
      <section class="mx-auto max-w-6xl px-4 pt-1 sm:px-6 lg:px-8">
        <DirectoryFilters
          v-model:only-available="onlyAvailable"
          :result-count="resultCount"
        />
        <ProviderList
          :providers="filteredProviders"
          @reset-filters="resetFilters"
        />
      </section>
    </main>

    <LegacyFooter />
  </div>
</template>
