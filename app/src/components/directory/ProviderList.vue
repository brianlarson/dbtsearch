<script setup lang="ts">
import ProviderCard from '@/components/directory/ProviderCard.vue'
import type { Provider } from '@/types/provider'

defineProps<{
  providers: Provider[]
  onlyAvailable: boolean
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
  <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="provider-list-avail-filter bg-body border-bottom shadow-sm pt-1 pb-3 mb-0">
          <div class="form-check form-switch mb-0">
            <input
              :checked="onlyAvailable"
              type="checkbox"
              class="form-check-input"
              role="switch"
              id="availability-input"
              @change="handleAvailabilityChange"
            />
            <label for="availability-input" class="form-check-label ms-1">
              Only show providers with availability
            </label>
          </div>
        </div>

        <ul class="provider-directory-list vstack gap-5 px-0">
          <ProviderCard v-for="provider in providers" :key="provider.id" :provider="provider" />
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * Below main nav (z-index 1030): keep this < 1030 so the bar never paints over the navbar.
 * --directory-sticky-navbar-offset is defined in style.css; override with --directory-sticky-filter-top if needed.
 */
.provider-list-avail-filter {
  position: sticky;
  z-index: 1010;
  top: var(--directory-sticky-filter-top, var(--directory-sticky-navbar-offset));
  /* Opaque bar so content never shows through the gap under the main nav */
  background-color: var(--bs-body-bg);
  /* Space between filter bar and cards (visible when filter is stuck + in normal flow) */
  margin-bottom: var(--directory-sticky-filter-gap, 2.25rem);
}

@media (min-width: 768px) {
  .provider-list-avail-filter {
    margin-bottom: var(--directory-sticky-filter-gap, 2.75rem);
  }
}

@media (max-width: 575.98px) {
  .provider-directory-list {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0;
  }
}
</style>
