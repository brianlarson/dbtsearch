<script setup lang="ts">
withDefaults(
  defineProps<{
    pageHeading?: string
    pageSubheading?: string
    /** Single-column title row (e.g. Contact) — matches reference captures without H2. */
    omitSubheading?: boolean
    heroImageUrl?: string
  }>(),
  {
    pageHeading: 'Providers',
    pageSubheading: 'DBT Providers in Minnesota',
    omitSubheading: false,
    heroImageUrl: '/images/pexels-hero-1440.webp',
  },
)
</script>

<template>
  <!-- Hero band — min-height matches Storybook `Layouts/Vue` kit (readable strip on all breakpoints) -->
  <section class="relative min-h-[7rem] bg-slate-900 py-5 md:min-h-[9rem]">
    <div class="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8" />
    <div class="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
      <div class="hidden md:block" />
      <div class="relative" aria-hidden="true">
        <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url('${heroImageUrl}')` }" />
      </div>
    </div>
    <div class="absolute inset-0 bg-black/50 md:hidden" aria-hidden="true" />
  </section>

  <section class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
    <template v-if="omitSubheading">
      <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{{ pageHeading }}</h1>
      <hr class="mt-4 border-slate-700" />
    </template>
    <template v-else>
      <div class="grid grid-cols-1 items-end gap-2 md:grid-cols-2 md:gap-4">
        <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">{{ pageHeading }}</h1>
        <h2 class="text-base font-medium text-slate-400 md:text-right">{{ pageSubheading }}</h2>
      </div>
      <hr class="mt-4 border-slate-700" />
    </template>
  </section>
</template>
