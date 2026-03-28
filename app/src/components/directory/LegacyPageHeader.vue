<script setup lang="ts">
withDefaults(
  defineProps<{
    pageHeading?: string
    pageSubheading?: string
    heroImageUrl?: string
  }>(),
  {
    pageHeading: 'Providers',
    pageSubheading: 'DBT Providers in Minnesota',
    heroImageUrl: '/images/pexels-steve-1690351.jpg',
  }
)
</script>

<template>
  <section class="relative bg-slate-900 py-5" aria-hidden="true">
    <div class="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8" />
    <div class="pointer-events-none absolute inset-0 grid grid-cols-1 md:grid-cols-2">
      <div class="hidden md:block" />
      <div class="relative">
        <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url('${heroImageUrl}')` }" />
      </div>
    </div>
    <div class="pointer-events-none absolute inset-0 bg-black/50 md:hidden" />
  </section>

  <section class="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-7 lg:px-8">
    <div class="grid grid-cols-1 items-end gap-2 md:grid-cols-2">
      <h1 class="text-3xl font-bold tracking-tight text-white">{{ pageHeading }}</h1>
      <h2 class="text-base font-medium text-slate-300 md:text-right">{{ pageSubheading }}</h2>
    </div>
    <hr class="mt-4 border-slate-700" />
  </section>
</template>
