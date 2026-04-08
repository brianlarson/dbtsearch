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
  <section class="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <!-- Legacy: form-check form-switch + form-check-input role="switch" (ProviderList.jsx) -->
      <label
        for="availability-input"
        class="flex cursor-pointer items-start gap-3 pb-1 text-sm text-slate-300 md:items-center"
      >
        <input
          id="availability-input"
          v-model="availabilityModel"
          type="checkbox"
          role="switch"
          class="peer sr-only"
        />
        <span
          class="relative mt-0.5 inline-block h-7 w-12 shrink-0 rounded-full border border-slate-600 bg-slate-700 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-checked:border-primary/50 peer-checked:bg-primary/35 after:pointer-events-none after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 after:ease-out peer-checked:after:translate-x-[1.25rem] md:mt-0"
          aria-hidden="true"
        />
        <span class="ms-0.5 leading-snug">Only show providers with availability</span>
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
