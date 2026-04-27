<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { getHeroVibe } from '@/lib/heroVibes'
import { publicPath } from '@/lib/publicPath'

const STATIC_HERO = {
  url: publicPath('images/pexels-steve-1690351.jpg'),
  alt: "Abstract paintingPhoto by Steve Johnson on pexels.com - 'abstract-painting-1690351'",
} as const

const props = withDefaults(
  defineProps<{
    /** Use session-random Unsplash hero from `@/lib/heroVibes` instead of the default static image */
    randomHeroVibe?: boolean
  }>(),
  { randomHeroVibe: false },
)

const hero = computed(() => (props.randomHeroVibe ? getHeroVibe() : STATIC_HERO))
</script>

<template>
  <section class="position-relative bg-dark py-5">
    <div class="container position-relative z-2 py-2 py-sm-4">
      <div class="row py-md-2 py-lg-5 my-xxl-1">
        <div class="col-sm-8 col-md-5">
          <h2 class="display-6 pb-1 pb-sm-2 text-brand">
            Find certified DBT provider availibility in Minnesota
          </h2>
          <p class="fs-5">
            DBTsearch is a website that allows clinicians and prospective clients to search for certified DBT providers in
            Minnesota and more specifically, locate providers that have current availability.
          </p>
          <RouterLink to="/providers" class="btn btn-lg btn-primary mt-3">
            Find DBT Providers
            <i class="fi-arrow-right fs-base ms-2" />
          </RouterLink>
        </div>
      </div>
    </div>
    <div class="row position-absolute top-0 end-0 w-100 h-100 justify-content-end g-0">
      <div class="col-md-6 position-relative">
        <img
          :src="hero.url"
          class="position-absolute top-0 end-0 w-100 h-100 object-fit-cover"
          :alt="hero.alt"
        />
      </div>
      <div class="position-absolute top-0 start-0 w-100 h-100 bg-black z-1 opacity-50 d-md-none" />
    </div>
  </section>
</template>
