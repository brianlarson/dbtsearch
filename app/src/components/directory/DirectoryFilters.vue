<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  onlyAvailable: boolean
  resultCount: number
}>()

const emit = defineEmits<{
  'update:onlyAvailable': [value: boolean]
}>()

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

    <p class="text-sm text-slate-400">
      Static markup preview mode: availability is the only active filter in this first pass.
    </p>
  </section>
</template>
