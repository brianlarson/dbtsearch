<script setup lang="ts">
import ProviderCard from '@/components/directory/ProviderCard.vue'
import type { Provider } from '@/types/provider'

defineProps<{
  providers: Provider[]
}>()
</script>

<template>
  <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
    <div class="row justify-content-center">
      <div class="col-12">
        <ul class="provider-directory-list vstack gap-5 px-0">
          <ProviderCard v-for="provider in providers" :key="provider.id" :provider="provider" />
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 575.98px) {
  .provider-directory-list {
    list-style: none;
    padding-left: 0;
    margin-bottom: 0;
  }
}
</style>
