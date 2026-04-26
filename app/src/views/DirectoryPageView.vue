<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ProviderList from '@/components/directory/ProviderList.vue'
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'
import { useProvidersQuery } from '@/composables/useProvidersQuery'

const { providers, totalProviders, isLoading, errorMessage, fetchProviders } = useProvidersQuery()
const onlyAvailable = ref(false)
const showBackToTop = ref(false)

const resultsLabel = computed(() => {
  if (onlyAvailable.value) {
    return `${providers.value.length} of ${totalProviders.value} Found`
  }
  return `Showing all ${totalProviders.value}`
})

function backToTopThresholdPx(): number {
  return Math.max(380, Math.floor(window.innerHeight * 0.45))
}

function onScroll() {
  showBackToTop.value = window.scrollY > backToTopThresholdPx()
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function loadProviders() {
  void fetchProviders({ onlyAvailable: onlyAvailable.value })
}

onMounted(() => {
  loadProviders()
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

watch(onlyAvailable, loadProviders)
</script>

<template>
  <LegacyHeader />

  <main class="content-wrapper">
    <LegacyPageHeader
      page-heading="Providers"
      page-subheading="DBT Providers in Minnesota"
      compact-below
    />
    <div class="directory-sticky-toolbar sticky-top bg-body shadow-sm mb-3">
      <div class="container py-3">
        <div class="d-flex align-items-center justify-content-between gap-3 mx-2">
          <div class="d-flex align-items-center min-w-0">
            <span
              class="directory-sticky-toolbar__toggler-ghost flex-shrink-0 d-lg-none me-3"
              aria-hidden="true"
            />
            <div class="form-check form-switch m-0">
              <input
                id="available-only"
                v-model="onlyAvailable"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label small text-body-secondary" for="available-only">
                Availability only
              </label>
            </div>
          </div>
          <p class="small text-body-secondary mb-0 text-end flex-shrink-0">{{ resultsLabel }}</p>
        </div>
      </div>
    </div>
    <p v-if="errorMessage" class="container text-danger small mb-0">{{ errorMessage }}</p>
    <p v-else-if="isLoading && providers.length === 0" class="container text-body-secondary small mb-0">
      Loading providers…
    </p>
    <ProviderList v-if="!errorMessage" :providers="providers" />

    <button
      type="button"
      class="directory-back-to-top btn btn-secondary fw-semibold"
      :class="{ 'directory-back-to-top--visible': showBackToTop }"
      aria-label="Back to top"
      @click="scrollToTop"
    >
      <i class="fi-arrow-up fs-base me-2 ms-n1" aria-hidden="true" />
      Top
    </button>
  </main>

  <LegacyFooter />
</template>

<style scoped>
.directory-sticky-toolbar {
  top: var(--directory-sticky-navbar-offset);
  z-index: 1020;
}

/* Same horizontal inset as DBTsearch logo: navbar toggler + me-3 below lg (toggler hidden .navbar-expand-lg). */
.directory-sticky-toolbar__toggler-ghost {
  width: 2.5rem;
  height: 2.5rem;
  visibility: hidden;
  pointer-events: none;
}

.directory-back-to-top {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right, 0px));
  bottom: max(1rem, env(safe-area-inset-bottom, 0px));
  z-index: 1040;
  opacity: 0;
  pointer-events: none;
  transform: translateY(0.5rem);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.directory-back-to-top--visible {
  opacity: 0.92;
  pointer-events: auto;
  transform: translateY(0);
}

.directory-back-to-top:hover,
.directory-back-to-top:focus-visible {
  opacity: 1;
}
</style>
