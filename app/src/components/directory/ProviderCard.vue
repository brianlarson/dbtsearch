<script setup lang="ts">
import { ref, watch } from 'vue'
import { inferLogoBackdropTone } from '@/lib/logoBackdrop'
import type { Provider } from '@/types/provider'

const props = defineProps<{
  provider: Provider
}>()

const logoLoadFailed = ref(false)
/** Tile behind logo: light (default) or dark when the mark reads mostly light. */
const logoBackdrop = ref<'light' | 'dark'>('light')

watch(
  () => props.provider.imageUrl,
  () => {
    logoLoadFailed.value = false
    logoBackdrop.value = 'light'
  },
)

function onLogoError() {
  logoLoadFailed.value = true
}

function onLogoLoad(event: Event) {
  const img = event.target
  if (!(img instanceof HTMLImageElement)) return
  const tone = inferLogoBackdropTone(img)
  if (tone === 'dark') logoBackdrop.value = 'dark'
  else if (tone === 'light') logoBackdrop.value = 'light'
}

function formatAddress(provider: Provider): string {
  const location = provider.locations[0]
  if (!location) return ''

  const line1 = location.address?.trim() ?? ''
  const cityStateZip = [location.city, location.state, location.zip].filter(Boolean).join(' ').trim()
  return [line1, cityStateZip].filter(Boolean).join(', ')
}

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
  <li class="d-sm-flex align-items-center">
    <article class="card w-100">
      <div class="row g-0">
        <div class="col-sm-4 col-md-3 rounded overflow-hidden pb-2 pb-sm-0 pe-sm-2">
          <div
            class="provider-card-logo-wrap position-relative d-flex h-100 p-3 p-sm-5"
            :class="logoBackdrop === 'dark' ? 'provider-card-logo-wrap--dark' : 'bg-white'"
          >
            <template v-if="provider.imageUrl && !logoLoadFailed">
              <img
                :src="provider.imageUrl"
                :alt="`${provider.name} logo`"
                class="position-absolute top-50 start-50 translate-middle object-fit-contain"
                style="max-width: 75%; max-height: 75%; width: auto; height: auto"
                loading="lazy"
                decoding="async"
                @load="onLogoLoad"
                @error="onLogoError"
              />
              <div class="ratio d-none d-sm-block" style="aspect-ratio: calc(180 / 240 * 100%)" />
              <!-- Half of 16×9 height on mobile: --bs-aspect-ratio is padding-top % of width -->
              <div class="ratio d-sm-none" style="--bs-aspect-ratio: 28.125%" />
            </template>
            <div
              v-else
              class="w-100 d-flex align-items-center justify-content-center mb-0"
              aria-hidden="true"
            >
              <i class="fi-heart text-brand h1" />
            </div>
          </div>
        </div>
        <div class="col-sm-8 col-md-9 align-self-center">
          <div
            class="card-body d-flex flex-column flex-sm-row justify-content-between align-items-start p-3 py-sm-4 ps-sm-2 ps-md-3 pe-md-4 mt-n1 mt-sm-0 gap-3"
          >
            <div class="position-relative pe-sm-3 flex-grow-1 min-w-0">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-4">
                <span
                  class="badge fs-sm border"
                  :class="provider.availability ? 'text-success border-success' : 'text-secondary border-secondary'"
                >
                  {{ provider.availability ? 'Availability' : 'No Availability' }}
                </span>
                <span v-if="provider.dbtaCertified" class="badge fs-sm text-info border border-info">
                  DBT-A Certified
                </span>
              </div>
              <div class="h3 mb-2 text-brand">{{ provider.name }}</div>
              <div class="d-block fs-md text-body text-decoration-none mb-4">{{ formatAddress(provider) }}</div>
              <div class="d-flex flex-wrap align-items-center column-gap-2 row-gap-2">
                <a
                  v-if="provider.phone"
                  :href="`tel:${provider.phone}`"
                  class="btn btn-outline-secondary"
                >
                  <i class="fi-phone fs-base me-2 ms-n1" />
                  {{ provider.phone }}
                </a>
                <a
                  v-if="provider.website"
                  :href="provider.website"
                  class="btn btn-outline-secondary"
                  target="_blank"
                  rel="noopener"
                >
                  <i class="fi-globe fs-base me-2 ms-n1" />
                  Website
                </a>
                <a
                  v-if="provider.email"
                  :href="`mailto:${provider.email}?subject=Inquiry%20from%20DBTsearch.org`"
                  class="btn btn-outline-secondary"
                >
                  <i class="fi-mail fs-base me-2 ms-n1" />
                  Email
                </a>
              </div>
            </div>
            <div class="text-start text-sm-end flex-shrink-0 align-self-sm-start ms-sm-auto">
              <div class="text-body-secondary font-monospace">
                <span class="fs-xs">Last updated</span>
                <br />
                <span class="fs-sm text-info fw-semibold">{{ formatUpdatedAt(provider.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  </li>
</template>

<style scoped>
/* Mobile: shorter logo strip; sm+ matches previous min-height */
.provider-card-logo-wrap {
  min-height: 87px;
}
@media (min-width: 576px) {
  .provider-card-logo-wrap {
    min-height: 174px;
  }
}

.provider-card-logo-wrap--dark {
  background-color: #252b38;
}
</style>
