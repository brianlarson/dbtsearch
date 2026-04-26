<script setup lang="ts">
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'

defineProps<{
  pageHeading?: string
  pageSubheading?: string
}>()
</script>

<template>
  <LegacyHeader />

  <main class="content-wrapper">
    <LegacyPageHeader :page-heading="pageHeading" :page-subheading="pageSubheading" />
    <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div class="row justify-content-center">
        <div class="col-12 fs-5">
          <div class="row justify-content-start">
            <div class="col-md-8">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <LegacyFooter />
</template>
