<script setup lang="ts">
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
    <div v-if="providers.length === 0" class="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center">
      <p class="mb-4 text-slate-300">No providers match your current filters.</p>
      <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90"
        @click="emit('resetFilters')"
      >
        Reset filters
      </button>
    </div>

    <ul v-else class="space-y-4">
      <li v-for="provider in providers" :key="provider.id">
        <ProviderCard :provider="provider" />
      </li>
    </ul>
  </section>
</template>
