<script setup lang="ts">
import DirectoryListNotice from '@/components/directory/DirectoryListNotice.vue'
import ProviderCard from '@/components/directory/ProviderCard.vue'
import type { Provider } from '@/types/provider'

defineProps<{
  providers: Provider[]
}>()

const emit = defineEmits<{
  resetFilters: []
}>()
</script>

<template>
  <section class="mt-6">
    <DirectoryListNotice
      v-if="providers.length === 0"
      title="No providers match your current filters."
      button-label="Reset filters"
      @action="emit('resetFilters')"
    />

    <!-- Storybook `provider-card-stack`: gap 2.5rem between cards -->
    <ul v-else class="list-none space-y-[2.5rem] p-0">
      <li v-for="provider in providers" :key="provider.id">
        <ProviderCard :provider="provider" />
      </li>
    </ul>
  </section>
</template>
