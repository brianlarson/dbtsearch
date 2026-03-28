<script setup lang="ts">
import type { Provider } from '@/types/provider'

defineProps<{
  provider: Provider
}>()

function formatUpdatedAt(value: string): string {
  if (!value) return 'Unknown'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <article class="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
    <div class="grid grid-cols-1 gap-0 sm:grid-cols-[12rem_1fr]">
      <div class="border-b border-slate-800 bg-slate-800/40 p-5 sm:border-r sm:border-b-0">
        <div class="flex h-full min-h-[7rem] items-center justify-center rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <img
            v-if="provider.imageUrl"
            :src="provider.imageUrl"
            :alt="`${provider.name} logo`"
            class="max-h-20 w-auto object-contain"
          />
          <span v-else class="text-3xl text-primary" aria-hidden="true">❤</span>
        </div>
      </div>

      <div class="p-5">
        <div class="mb-3 flex flex-wrap gap-2">
          <span
            class="rounded-full border px-2.5 py-1 text-xs font-medium"
            :class="
              provider.availability
                ? 'border-emerald-500/50 text-emerald-300'
                : 'border-slate-600 text-slate-300'
            "
          >
            {{ provider.availability ? 'Availability' : 'No Availability' }}
          </span>
          <span
            v-if="provider.dbtaCertified"
            class="rounded-full border border-cyan-500/50 px-2.5 py-1 text-xs font-medium text-cyan-300"
          >
            DBT-A Certified
          </span>
        </div>

        <h3 class="mb-1 text-lg font-semibold text-primary">{{ provider.name }}</h3>
        <p class="mb-3 text-sm text-slate-300">
          {{ provider.address }} {{ provider.city }}, {{ provider.state }} {{ provider.zip }}
        </p>

        <div class="mb-4 text-sm">
          <a
            v-if="provider.phone"
            :href="`tel:${provider.phone}`"
            class="text-primary underline decoration-primary/40 underline-offset-2 hover:opacity-90"
          >
            {{ provider.phone }}
          </a>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex flex-wrap gap-2">
            <a
              v-if="provider.website"
              :href="provider.website"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-white"
            >
              Website
            </a>
            <a
              v-if="provider.email"
              :href="`mailto:${provider.email}?subject=Inquiry%20from%20DBT%20Search`"
              class="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-white"
            >
              Email
            </a>
          </div>

          <div class="text-sm text-slate-400">
            Last updated:
            <span class="font-medium text-slate-200">{{ formatUpdatedAt(provider.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
