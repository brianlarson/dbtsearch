<script setup lang="ts">
import ProviderCard from '@/components/directory/ProviderCard.vue'
import type { Provider } from '@/types/provider'

defineProps<{
  providers: Provider[]
  onlyAvailable: boolean
  resultCount: number
}>()

const emit = defineEmits<{
  resetFilters: []
  'update:onlyAvailable': [value: boolean]
}>()

function handleAvailabilityChange(event: Event) {
  const target = event.target as HTMLInputElement | null
  emit('update:onlyAvailable', Boolean(target?.checked))
}
</script>

<template>
  <section class="mt-6">
    <div class="pb-2 lg:mb-4">
      <label class="inline-flex items-center gap-2 text-sm text-slate-300">
        <input
          :checked="onlyAvailable"
          type="checkbox"
          class="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
          @change="handleAvailabilityChange"
        />
        <span>Only show providers with availability</span>
      </label>
      <div class="mt-2 text-xs text-slate-400">Results: {{ resultCount }}</div>
    </div>

    <div
      v-if="providers.length === 0"
      class="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center"
    >
      <p class="mb-4 text-slate-300">No providers match your current filters.</p>
      <button
        type="button"
        class="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
        @click="emit('resetFilters')"
      >
        Reset filters
      </button>
    </div>

    <ul v-else class="space-y-5 px-0">
      <li v-for="provider in providers" :key="provider.id">
        <ProviderCard :provider="provider" />
      </li>
    </ul>
  </section>
</template>
