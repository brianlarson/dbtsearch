<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { inferLogoBackdropTone } from '@/lib/logoBackdrop'
import type { Provider } from '@/types/provider'

const props = defineProps<{
  provider: Provider
}>()

const primaryCity = computed(() => {
  const city = props.provider.locations[0]?.city?.trim()
  return city ?? ''
})

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
            :class="logoBackdrop === 'dark' ? 'provider-card-logo-wrap--dark' : 'bg-white'"
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
                  {{ provider.availability ? 'Availability' : 'No Availability' }}
                </span>
                <span v-if="provider.dbtaCertified" class="badge fs-sm text-info border border-info">
                  DBT-A Certified
                </span>
              </div>
              <div
                v-if="primaryCity"
                class="provider-card-eyebrow fs-sm fw-bold text-uppercase text-brand mb-1 pt-2 d-inline-flex align-items-center gap-1"
              >
                <svg
                  class="provider-card-mn-icon flex-shrink-0"
                  viewBox="0 0 1000 773"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="currentColor"
                    d="M684.9,351.8L674.8,346.0L648.2,356.8L648.2,434.5L640.3,442.4L602.9,453.2L572.7,481.3L570.5,500.0L585.6,501.4L602.2,518.0L587.1,538.1L589.9,560.4L580.6,608.6L615.1,632.4L642.4,634.5L656.1,648.9L696.4,663.3L702.9,680.6L740.3,702.9L761.2,707.9L786.3,736.7L782.7,757.6L789.9,772.7L769.8,772.7L102.2,772.7L102.2,536.7L71.9,521.6L48.9,496.4L84.9,468.3L87.8,453.2L82.7,400.7L66.9,387.1L56.1,358.3L58.3,323.0L53.2,317.3L48.9,233.1L23.0,188.5L12.9,163.3L8.6,110.1L17.3,92.1L0.0,50.4L272.7,50.4L272.7,0.0L298.6,1.4L315.8,11.5L333.1,79.9L346.8,87.8L389.9,89.9L395.0,96.4L445.3,99.3L451.1,113.7L494.2,110.1L494.2,104.3L528.1,97.1L557.6,100.0L591.4,110.8L600.7,124.5L620.1,123.0L638.1,152.5L646.8,140.3L679.9,134.5L685.6,146.8L724.5,155.4L724.5,166.9L743.9,176.3L783.5,171.2L807.2,158.3L839.6,150.4L851.1,169.8L873.4,165.5L900.0,169.8L930.9,166.9L966.2,183.5L1000.0,180.6L997.1,187.8L953.2,204.3L892.1,217.3L852.5,230.9L795.7,264.7L771.2,285.6L733.8,309.4L674.8,341.0L684.9,351.8Z"
                  />
                </svg>
                {{ primaryCity }}
              </div>
              <div class="provider-card-heading h3 mb-2">{{ provider.name }}</div>
              <div class="provider-card-address d-block fs-md text-body-secondary text-decoration-none mb-4">
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
}

.provider-card-eyebrow {
  margin-top: 0;
}

.provider-card-heading {
  color: rgba(255, 255, 255, 0.88);
}

.provider-card-address {
  opacity: 0.72;
}

.provider-card-logo-img {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.provider-card-mn-icon {
  height: 0.72em;
  width: auto;
  aspect-ratio: 1000 / 773;
}

.provider-card-updated {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.provider-card-updated__date {
  display: block;
  margin-top: 2px;
  font-size: calc(0.875rem - 1px);
  font-weight: 400;
}
</style>
