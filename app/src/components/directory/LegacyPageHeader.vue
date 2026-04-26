<script setup lang="ts">
import { computed } from 'vue'
import { publicPath } from '@/lib/publicPath'

const props = withDefaults(
  defineProps<{
    pageHeading?: string
    pageSubheading?: string
    /** Path under `public/` (e.g. `images/foo.jpg` or `/images/foo.jpg`) or absolute http(s) URL */
    heroImageUrl?: string
    /** Less margin below the heading block (e.g. directory filter sits close under the rule) */
    compactBelow?: boolean
  }>(),
  {
    compactBelow: false,
  },
)

const resolvedHeroImageUrl = computed(() => {
  const url = props.heroImageUrl
  if (url) {
    if (/^https?:\/\//i.test(url)) return url
    const path = url.startsWith('/') ? url.slice(1) : url
    return publicPath(path)
  }
  return publicPath('images/pexels-steve-1690351.jpg')
})
</script>

<template>
  <div class="position-relative bg-dark py-5" aria-hidden="true">
    <div class="container position-relative z-2 py-2 py-sm-1" />
    <div class="row position-absolute top-0 end-0 w-100 h-100 justify-content-end g-0">
      <div class="col-md-6 position-relative">
        <img
          :src="resolvedHeroImageUrl"
          class="position-absolute top-0 end-0 w-100 h-100 object-fit-cover"
          alt="Abstract paintingPhoto by Steve Johnson on pexels.com - 'abstract-painting-1690351'"
        />
      </div>
      <div class="position-absolute top-0 start-0 w-100 h-100 bg-black z-1 opacity-50 d-md-none" />
    </div>
  </div>

  <div class="container" :class="compactBelow ? 'mt-4 mt-md-5 mb-2 mb-md-3' : 'my-4 my-md-5'">
    <div class="row justify-content-center">
      <div class="col-12">
        <div class="row">
          <div v-if="pageHeading" class="col-md-6 pb-1">
            <h1 class="h1 m-0">{{ pageHeading }}</h1>
          </div>
          <div
            v-if="pageSubheading"
            class="col-md-6 row mx-0 pb-1 align-items-end justify-content-end px-0"
          >
            <h2 class="h5 text-secondary fw-medium m-0 text-md-end">{{ pageSubheading }}</h2>
          </div>
        </div>
        <hr class="mt-0" />
      </div>
    </div>
  </div>
</template>
