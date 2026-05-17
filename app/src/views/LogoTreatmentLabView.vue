<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { inferLogoBackdropTone } from '@/lib/logoBackdrop'
import { publicPath } from '@/lib/publicPath'

const logoPaths = [
  // providers
  'images/providers/acp-mn-com.png',
  'images/providers/artofcounselingstpaul-com.jpg',
  'images/providers/autonomycounseling-com.png',
  'images/providers/choicespsychotherapy-net.png',
  'images/providers/dbt-ptsdspecialists-com.png',
  'images/providers/dbtassociates-com.png',
  'images/providers/elevacare-org.png',
  'images/providers/familyservicerochester-org.png',
  'images/providers/healthyminds-io.png',
  'images/providers/healingconnectionsonline-com.jpg',
  'images/providers/highlandmeadowscc-com.png',
  'images/providers/hppsychological-com.png',
  'images/providers/imaginemhc-com.png',
  'images/providers/imsofmn-com.png',
  'images/providers/lifedrs-com.png',
  'images/providers/lighthousecfs-com.jpg',
  'images/providers/lmhc-org.png',
  'images/providers/mapbhc-com.png',
  'images/providers/mhs-dbt-com.png',
  'images/providers/mindfullyhealing-com.png',
  'images/providers/minnesotacenterforpsychology-com.png',
  'images/providers/natalispsychology-com.jpg',
  'images/providers/nbminnesota-com.png',
  'images/providers/npmh-org.png',
  'images/providers/nystromcounseling-com.png',
  'images/providers/nystromcounseling-com.svg',
  'images/providers/olmstedcounty-gov.png',
  'images/providers/omnimentalhealth-com.png',
  'images/providers/parkercollins-com.png',
  'images/providers/riverstonepsych-com.png',
  'images/providers/securebasecounselingcenter-com.png',
  'images/providers/solutionsinpractice-org.png',
  'images/providers/south-metro-org.png',
  'images/providers/southbridgecounseling-com.jpg',
  'images/providers/tubman-org.png',
  'images/providers/voamnwi-org.png',
  'images/providers/washburn-org.png',
  'images/providers/wholeheartedhealingllc-com.png',
  'images/providers/wmhcinc-org.png',
  // logos
  'images/logos/acp-associated-clinic.webp',
  'images/logos/advanded-behavioral-health-inc.png',
  'images/logos/align-your-soul.jpg',
  'images/logos/art-of-validation-and-change.jpg',
  'images/logos/asc-psychological-services.webp',
  'images/logos/autonomy-couseling.jpg',
  'images/logos/choices-psychotherapy.png',
  'images/logos/dbt-associates-llp.png',
  'images/logos/meridian-behavioral-health.svg',
  'images/logos/tiny-tree-counseling.png',
  'images/logos/volunteers-of-america-mn-wi.svg',
] as const

function humanizeLogoName(path: string): string {
  const file = path.split('/').at(-1) ?? path
  const stem = file.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '')
  return stem.replace(/[-_]+/g, ' ')
}

const samples = logoPaths.map((path) => ({
  label: humanizeLogoName(path),
  path,
}))

const treatments = [
  {
    id: 'raw' as const,
    title: 'Raw on surface',
    hint: 'Logo only — shows contrast problems.',
  },
  {
    id: 'containerLight' as const,
    title: 'Container: light',
    hint: 'Whole logo container forced light.',
  },
  {
    id: 'containerDark' as const,
    title: 'Container: dark',
    hint: 'Whole logo container forced dark with subtle rule.',
  },
  {
    id: 'lightPlate' as const,
    title: 'Light plate',
    hint: 'White rounded chip (current default direction).',
  },
  {
    id: 'mutedPlate' as const,
    title: 'Muted plate',
    hint: 'Off-white chip, slightly softer than pure white.',
  },
  {
    id: 'adaptive' as const,
    title: 'Adaptive chip',
    hint: 'Same heuristic as ProviderCard (light vs dark tile).',
  },
  {
    id: 'monoWhite' as const,
    title: 'Mono (white)',
    hint: 'invert + brightness — works for some marks, breaks others.',
  },
  {
    id: 'lifted' as const,
    title: 'Lift on dark',
    hint: 'Slight brightness/contrast; no chip.',
  },
] as const

/** Per-row adaptive backdrop after image samples pixels (matches ProviderCard idea). */
const adaptiveBackdrop = reactive<Record<number, 'light' | 'dark'>>({})
for (let i = 0; i < samples.length; i++) {
  adaptiveBackdrop[i] = 'light'
}

function logoSrc(path: string) {
  return publicPath(path)
}

function onAdaptiveLoad(rowIndex: number, event: Event) {
  const img = event.target
  if (!(img instanceof HTMLImageElement)) return
  const tone = inferLogoBackdropTone(img)
  if (tone === 'dark') adaptiveBackdrop[rowIndex] = 'dark'
  else adaptiveBackdrop[rowIndex] = 'light'
}
</script>

<template>
  <div class="logo-lab text-white min-vh-100">
    <div class="border-bottom border-secondary border-opacity-25 bg-black bg-opacity-25">
      <div class="container py-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <div class="text-uppercase small text-white-50 fw-semibold mb-1">Dev only</div>
          <h1 class="h4 mb-0">Logo treatment lab</h1>
        </div>
        <RouterLink to="/providers" class="btn btn-outline-light btn-sm">Back to directory</RouterLink>
      </div>
    </div>

    <div class="container py-4">
      <p class="text-white-50 small mb-4 col-lg-10">
        Same static assets as in
        <code class="text-info">public/images/</code>, on a
        <span class="text-white">#252b38</span> surface (directory card tone). Use this to pick a default
        treatment before changing production styles.
      </p>

      <div class="table-responsive logo-lab__scroll">
        <table class="table table-dark table-bordered border-secondary align-middle logo-lab__table mb-0">
          <thead>
            <tr>
              <th scope="col" class="logo-lab__th-sample text-white-50 small">Sample</th>
              <th
                v-for="t in treatments"
                :key="t.id"
                scope="col"
                class="logo-lab__th-treatment small"
              >
                <div class="fw-semibold text-white">{{ t.title }}</div>
                <div class="text-white-50 fw-normal mt-1 logo-lab__hint">{{ t.hint }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sample, rowIndex) in samples" :key="sample.path">
              <th scope="row" class="logo-lab__row-label small text-white-50">{{ sample.label }}</th>
              <td v-for="t in treatments" :key="t.id" class="p-2 logo-lab__td">
                <div
                  class="logo-lab__viewport d-flex align-items-center justify-content-center"
                  :class="{
                    'logo-lab__viewport--lifted': t.id === 'lifted',
                    'logo-lab__viewport--container-light': t.id === 'containerLight',
                    'logo-lab__viewport--container-dark': t.id === 'containerDark',
                  }"
                >
                  <!-- Raw -->
                  <template v-if="t.id === 'raw' || t.id === 'containerLight' || t.id === 'containerDark'">
                    <img
                      :src="logoSrc(sample.path)"
                      :alt="`${sample.label} logo`"
                      class="logo-lab__img"
                      loading="lazy"
                      decoding="async"
                    />
                  </template>

                  <!-- Light plate -->
                  <template v-else-if="t.id === 'lightPlate'">
                    <div class="logo-lab__plate logo-lab__plate--light w-100 h-100 d-flex align-items-center justify-content-center">
                      <img
                        :src="logoSrc(sample.path)"
                        :alt="`${sample.label} logo`"
                        class="logo-lab__img"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </template>

                  <!-- Muted plate -->
                  <template v-else-if="t.id === 'mutedPlate'">
                    <div class="logo-lab__plate logo-lab__plate--muted w-100 h-100 d-flex align-items-center justify-content-center">
                      <img
                        :src="logoSrc(sample.path)"
                        :alt="`${sample.label} logo`"
                        class="logo-lab__img"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </template>

                  <!-- Adaptive -->
                  <template v-else-if="t.id === 'adaptive'">
                    <div
                      class="logo-lab__plate w-100 h-100 d-flex align-items-center justify-content-center"
                      :class="
                        adaptiveBackdrop[rowIndex] === 'dark'
                          ? 'logo-lab__plate--adaptive-dark'
                          : 'logo-lab__plate--light'
                      "
                    >
                      <img
                        :src="logoSrc(sample.path)"
                        :alt="`${sample.label} logo`"
                        class="logo-lab__img"
                        loading="lazy"
                        decoding="async"
                        @load="onAdaptiveLoad(rowIndex, $event)"
                      />
                    </div>
                  </template>

                  <!-- Monochrome white -->
                  <template v-else-if="t.id === 'monoWhite'">
                    <img
                      :src="logoSrc(sample.path)"
                      :alt="`${sample.label} logo`"
                      class="logo-lab__img logo-lab__img--mono-white"
                      loading="lazy"
                      decoding="async"
                    />
                  </template>

                  <!-- Lifted -->
                  <template v-else-if="t.id === 'lifted'">
                    <img
                      :src="logoSrc(sample.path)"
                      :alt="`${sample.label} logo`"
                      class="logo-lab__img logo-lab__img--lifted"
                      loading="lazy"
                      decoding="async"
                    />
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo-lab {
  background: #1a1d24;
}

.logo-lab__scroll {
  margin-left: -0.75rem;
  margin-right: -0.75rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

@media (min-width: 576px) {
  .logo-lab__scroll {
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }
}

.logo-lab__table {
  --bs-table-bg: transparent;
  min-width: 720px;
}

.logo-lab__th-sample {
  width: 11rem;
  vertical-align: bottom;
}

.logo-lab__th-treatment {
  min-width: 8.5rem;
  vertical-align: bottom;
}

.logo-lab__hint {
  font-size: 0.7rem;
  line-height: 1.25;
}

.logo-lab__row-label {
  width: 11rem;
  font-weight: 600;
  white-space: normal;
  line-height: 1.25;
}

.logo-lab__td {
  vertical-align: middle;
}

.logo-lab__viewport {
  width: 100%;
  min-height: 88px;
  background-color: #252b38;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.logo-lab__viewport--lifted {
  background: linear-gradient(180deg, #2a3140 0%, #252b38 100%);
}

.logo-lab__viewport--container-light {
  background-color: #ffffff;
}

.logo-lab__viewport--container-dark {
  background-color: #252b38;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.logo-lab__plate {
  border-radius: 0.5rem;
  padding: 0.65rem;
  min-height: 76px;
}

.logo-lab__plate--light {
  background-color: #fff;
}

.logo-lab__plate--muted {
  background-color: #e8eaef;
}

.logo-lab__plate--adaptive-dark {
  background-color: #252b38;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.logo-lab__img {
  max-width: 100%;
  max-height: 56px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.logo-lab__img--mono-white {
  filter: brightness(0) invert(1);
  opacity: 0.92;
}

.logo-lab__img--lifted {
  filter: brightness(1.08) contrast(1.07) saturate(1.05);
}
</style>
