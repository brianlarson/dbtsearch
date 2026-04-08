<script setup lang="ts">
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'

withDefaults(
  defineProps<{
    pageHeading: string
    pageSubheading?: string
    omitSubheading?: boolean
    heroImageUrl?: string
  }>(),
  {
    omitSubheading: false,
    heroImageUrl: '/images/pexels-hero-1440.webp',
  }
)
</script>

<template>
  <div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
    <LegacyHeader />
    <LegacyPageHeader
      :page-heading="pageHeading"
      :page-subheading="pageSubheading"
      :omit-subheading="omitSubheading"
      :hero-image-url="heroImageUrl"
    />
    <main class="pb-12">
      <section class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 md:pt-8 lg:px-8">
        <div class="max-w-3xl text-base leading-relaxed text-slate-300 [&_p_a]:text-brand [&_p_a]:underline [&_p_a]:decoration-1 [&_p_a:hover]:opacity-90">
          <slot />
        </div>
      </section>
    </main>
    <LegacyFooter />
  </div>
</template>
