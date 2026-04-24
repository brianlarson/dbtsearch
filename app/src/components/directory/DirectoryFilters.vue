<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  searchTerm: string
  onlyAvailable: boolean
  resultCount: number
}>()

const emit = defineEmits<{
  'update:searchTerm': [value: string]
  'update:onlyAvailable': [value: boolean]
}>()

const searchModel = computed({
  get: () => props.searchTerm,
  set: (value: string) => emit('update:searchTerm', value),
})

const availabilityModel = computed({
  get: () => props.onlyAvailable,
  set: (value: boolean) => emit('update:onlyAvailable', value),
})
</script>

<template>
  <section class="space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/55 p-4 md:p-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <label class="inline-flex items-center gap-2 text-sm text-slate-300">
        <input
          v-model="availabilityModel"
          type="checkbox"
          class="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
        />
        <span>Only show providers with availability</span>
      </label>

      <div class="text-sm text-slate-400">Results: {{ resultCount }}</div>
    </div>

    <div>
      <label for="provider-search" class="mb-1 block text-sm font-medium text-slate-300">
        Search by provider name
      </label>
      <input
        id="provider-search"
        v-model="searchModel"
        type="search"
        placeholder="Start typing a provider name..."
        class="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
    </div>
  </section>
</template>
