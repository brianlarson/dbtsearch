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

function phoneDigits(phone: string): string {
  return String(phone || '').replace(/\D/g, '')
}

const globePath =
  'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418'

const mailPath =
  'M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75'

const heartPath =
  'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z'
</script>

<template>
  <article class="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
    <div class="grid grid-cols-1 sm:grid-cols-12">
      <!-- Logo column — ~md 3/12 + pe-sm-3 (Storybook col-md-3 + pe-sm-3) -->
      <div class="overflow-hidden rounded-t-xl pb-2 sm:col-span-4 sm:rounded-l-xl sm:rounded-tr-none sm:pb-0 sm:pr-3 md:col-span-3">
        <div
          class="relative flex min-h-[174px] w-full items-center justify-center p-[2.25rem]"
          :class="provider.imageUrl ? 'bg-white' : 'bg-slate-800/60'"
        >
          <img
            v-if="provider.imageUrl"
            :src="provider.imageUrl"
            :alt="`${provider.name} logo`"
            class="max-h-full max-w-full object-contain"
          />
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-10 w-10 text-brand"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" :d="heartPath" />
          </svg>
        </div>
      </div>

      <!-- Body — Storybook card-body p-4 py-sm-5 ps-sm-3 ps-md-4 pe-md-5 -->
      <div class="self-center sm:col-span-8 md:col-span-9">
        <div
          class="flex flex-col gap-6 p-4 sm:flex-row sm:justify-between sm:gap-4 sm:py-10 sm:pl-3 sm:pr-4 md:pl-6 md:pr-12"
        >
          <div class="relative min-w-0 pe-2 sm:pe-4">
            <div class="mb-4 flex flex-wrap gap-2">
              <span
                class="rounded border px-2 py-0.5 text-xs font-medium"
                :class="
                  provider.availability
                    ? 'border-emerald-500/70 text-emerald-300'
                    : 'border-slate-500 text-slate-400'
                "
              >
                {{ provider.availability ? 'Availability' : 'No Availability' }}
              </span>
              <span
                v-if="provider.dbtaCertified"
                class="rounded border border-sky-500/60 px-2 py-0.5 text-xs font-medium text-sky-300"
              >
                DBT-A Certified
              </span>
            </div>

            <div class="mb-1 text-xl font-semibold leading-tight text-brand sm:text-2xl">
              {{ provider.name }}
            </div>
            <p class="mb-3 text-sm leading-relaxed text-slate-300">
              {{ provider.address }} {{ provider.city }}, {{ provider.state }} {{ provider.zip }}
            </p>
            <div v-if="provider.phone" class="text-base">
              <a
                :href="`tel:${phoneDigits(provider.phone)}`"
                class="text-brand no-underline hover:underline"
              >
                {{ provider.phone }}
              </a>
            </div>
          </div>

          <div class="flex shrink-0 flex-col items-start gap-3 sm:items-end">
            <div class="text-right text-slate-500">
              <span class="text-xs">Last updated</span><br />
              <span class="text-sm font-semibold text-sky-400">{{
                formatUpdatedAt(provider.updatedAt)
              }}</span>
            </div>
            <div class="flex flex-col gap-3 sm:items-end">
              <a
                v-if="provider.website"
                :href="provider.website"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-primary/50 hover:text-white"
                :title="`Visit ${provider.website}`"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="-ml-0.5 mr-2 h-[18px] w-[18px] shrink-0"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" :d="globePath" />
                </svg>
                Website
              </a>
              <a
                v-if="provider.email"
                :href="`mailto:${provider.email}?subject=Inquiry%20from%20DBTsearch.org`"
                class="inline-flex items-center rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-primary/50 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="-ml-0.5 mr-2 h-[18px] w-[18px] shrink-0"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" :d="mailPath" />
                </svg>
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
