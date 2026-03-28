<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DirectoryFilters from '@/components/directory/DirectoryFilters.vue'
import ProviderList from '@/components/directory/ProviderList.vue'
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'
import { useProvidersQuery } from '@/composables/useProvidersQuery'

const searchTerm = ref('')
const onlyAvailable = ref(true)
const { providers, isLoading, errorMessage, fetchProviders } = useProvidersQuery()

const resultCount = computed(() => providers.value.length)

async function loadProviders() {
  await fetchProviders({
    searchTerm: searchTerm.value,
    onlyAvailable: onlyAvailable.value,
  })
}

function resetFilters() {
  searchTerm.value = ''
  onlyAvailable.value = true
}

let searchDebounceId: ReturnType<typeof setTimeout> | undefined

watch(onlyAvailable, () => {
  void loadProviders()
})

watch(searchTerm, () => {
  if (searchDebounceId) {
    clearTimeout(searchDebounceId)
  }
  searchDebounceId = setTimeout(() => {
    void loadProviders()
  }, 250)
})

onMounted(() => {
  void loadProviders()
})

onBeforeUnmount(() => {
  if (searchDebounceId) clearTimeout(searchDebounceId)
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <LegacyHeader />
    <LegacyPageHeader page-heading="Providers" page-subheading="DBT Providers in Minnesota" />

    <main class="pb-12">
      <section class="mx-auto max-w-6xl px-4 pt-2 sm:px-6 lg:px-8">
        <DirectoryFilters
          v-model:search-term="searchTerm"
          v-model:only-available="onlyAvailable"
          :result-count="resultCount"
        />

        <div v-if="isLoading" class="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
          Loading providers...
        </div>

        <div
          v-else-if="errorMessage"
          class="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-200"
          role="alert"
        >
          <p class="mb-4">{{ errorMessage }}</p>
          <button
            type="button"
            class="rounded-lg border border-red-400/50 px-3 py-2 text-sm hover:bg-red-500/20"
            @click="loadProviders"
          >
            Retry
          </button>
        </div>

        <ProviderList v-else :providers="providers" @reset-filters="resetFilters" />
      </section>
    </main>

    <LegacyFooter />
  </div>
</template>
