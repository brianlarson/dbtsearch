<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DirectoryFilters from '@/components/directory/DirectoryFilters.vue'
import DirectoryListLoading from '@/components/directory/DirectoryListLoading.vue'
import DirectoryListNotice from '@/components/directory/DirectoryListNotice.vue'
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
  <div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
    <LegacyHeader />
    <LegacyPageHeader page-heading="Providers" page-subheading="DBT Providers in Minnesota" />

    <main class="pb-12">
      <section class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 md:pt-8 lg:px-8">
        <DirectoryFilters
          v-model:search-term="searchTerm"
          v-model:only-available="onlyAvailable"
          :result-count="resultCount"
        />

        <DirectoryListLoading v-if="isLoading" />

        <div v-else-if="errorMessage" class="mt-6">
          <DirectoryListNotice
            title="Failed to load providers."
            :detail="errorMessage"
            button-label="Retry"
            role="alert"
            @action="loadProviders"
          />
        </div>

        <ProviderList
          v-else
          :providers="providers"
          @reset-filters="resetFilters"
        />
      </section>
    </main>

    <LegacyFooter />
  </div>
</template>
