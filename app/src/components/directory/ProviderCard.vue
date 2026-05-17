<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { inferLogoBackdropTone } from '@/lib/logoBackdrop'
import type { Provider } from '@/types/provider'

const props = defineProps<{
  provider: Provider
}>()

/** Eyebrow: location display name when set, otherwise city. */
const primaryLocationEyebrow = computed(() => {
  const loc = props.provider.locations[0]
  if (!loc) return ''
  const name = loc.name?.trim()
  const city = loc.city?.trim()
  return name || city || ''
})

const logoLoadFailed = ref(false)
/** Inferred tile: dark slab for light marks, white (`bg-white`) for dark marks. Default dark until @load. */
const autoLogoBackdrop = ref<'light' | 'dark'>('dark')

const effectiveLogoBackdrop = computed<'light' | 'dark'>(() => {
  if (props.provider.logoBg === 'dark') return 'dark'
  if (props.provider.logoBg === 'light') return 'light'
  return autoLogoBackdrop.value
})

watch(
  () => [props.provider.imageUrl, props.provider.logoBg],
  () => {
    logoLoadFailed.value = false
    autoLogoBackdrop.value = 'dark'
  },
)

function onLogoError() {
  logoLoadFailed.value = true
}

function onLogoLoad(event: Event) {
  const img = event.target
  if (!(img instanceof HTMLImageElement)) return
  if (props.provider.logoBg === 'light' || props.provider.logoBg === 'dark') return
  const tone = inferLogoBackdropTone(img)
  if (tone === 'dark') autoLogoBackdrop.value = 'dark'
  else if (tone === 'light') autoLogoBackdrop.value = 'light'
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
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Unknown'

  const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  let hour12 = d.getHours() % 12
  if (hour12 === 0) hour12 = 12
  const hourStr = String(hour12).padStart(2, '0')
  const minStr = String(d.getMinutes()).padStart(2, '0')
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM'
  return `${datePart} ${hourStr}:${minStr} ${ampm}`
}
</script>

<template>
  <li class="d-md-flex align-items-center">
    <article class="card w-100">
      <div class="row g-0">
        <div class="col-12 col-md-3 rounded overflow-hidden pb-2 pb-md-0 pe-md-2">
          <div
            class="provider-card-logo-wrap position-relative d-flex h-100 p-3 p-md-5"
            :class="effectiveLogoBackdrop === 'dark' ? 'provider-card-logo-wrap--dark' : 'bg-white'"
          >
            <template v-if="provider.imageUrl && !logoLoadFailed">
              <img
                :src="provider.imageUrl"
                :alt="`${provider.name} logo`"
                class="provider-card-logo-img position-absolute object-fit-contain"
                style="max-width: 75%; max-height: 75%; width: auto; height: auto"
                loading="lazy"
                decoding="async"
                @load="onLogoLoad"
                @error="onLogoError"
              />
              <div class="ratio d-none d-md-block" style="aspect-ratio: calc(180 / 240 * 100%)" />
              <!-- Half of 16×9 height on mobile: --bs-aspect-ratio is padding-top % of width -->
              <div class="ratio d-md-none" style="--bs-aspect-ratio: 28.125%" />
            </template>
            <div
              v-else
              class="w-100 d-flex align-items-center justify-content-start justify-content-md-center mb-0"
              aria-hidden="true"
            >
              <i class="fi-heart text-brand h1" />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-9 align-self-center">
          <div
            class="card-body d-flex flex-column flex-md-row justify-content-between align-items-start p-3 py-md-4 ps-md-3 pe-md-4 mt-n1 mt-md-0 gap-3"
          >
            <div class="position-relative pe-md-3 flex-grow-1 min-w-0">
              <div class="d-flex flex-wrap align-items-center gap-2 mb-4">
                <span
                  class="badge fs-sm border"
                  :class="provider.availability ? 'text-success border-success' : 'text-secondary border-secondary'"
                >
                  {{ provider.availability ? 'Available' : 'No Availability' }}
                </span>
                <span v-if="provider.dbtaCertified" class="badge fs-sm text-info border border-info">
                  Adolescents
                </span>
              </div>
              <div
                v-if="primaryLocationEyebrow"
                class="provider-card-eyebrow fw-bold text-uppercase text-brand mb-1 pt-2"
              >
                {{ primaryLocationEyebrow }}
              </div>
              <div class="provider-card-heading h3 mb-2">{{ provider.name }}</div>
              <div class="provider-card-address d-block small text-body-secondary text-decoration-none mb-4">
                {{ formatAddress(provider) }}
              </div>
              <div class="d-flex flex-wrap align-items-center column-gap-2 row-gap-2 mt-2">
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
            <div class="text-start text-md-end flex-shrink-0 align-self-md-start ms-md-auto">
              <div class="provider-card-updated text-body-secondary font-monospace">
                <span class="provider-card-updated__label fs-xs">Last updated</span>
                <span class="provider-card-updated__date text-info fw-normal">
                  {{ formatUpdatedAt(provider.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  </li>
</template>

<style scoped>
/* Below md (768px): shorter logo strip; md+ matches previous min-height */
.provider-card-logo-wrap {
  min-height: 87px;
}
@media (min-width: 768px) {
  .provider-card-logo-wrap {
    min-height: 174px;
  }
}

.provider-card-logo-wrap--dark {
  background-color: #252b38;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.provider-card-eyebrow {
  margin-top: 40px;
  font-size: calc(0.875rem + 2px);
}

.provider-card-heading {
  color: rgba(255, 255, 255, 0.88);
}

.provider-card-logo-img {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.provider-card-updated {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.provider-card-updated__date {
  display: block;
  margin-top: 4px;
  font-size: calc(0.875rem - 1px);
  font-weight: 400;
}
</style>
