<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'
import { applyDraftToProvider, draftFromProvider, type ProviderSelfEditDraft } from '@/lib/providerPortalAllowlist'
import { providerSelfEditMock } from '@/mocks/providerSelfEditMock'
import type { Provider } from '@/types/provider'

const username = 'asc-clinic'

function formatLocationAddress(loc: {
  address?: string
  city?: string
  state?: string
  zip?: string
}): string {
  const line1 = loc.address?.trim() ?? ''
  const cityStateZip = [loc.city, loc.state, loc.zip].filter(Boolean).join(' ').trim()
  return [line1, cityStateZip].filter(Boolean).join(', ')
}

const provider = ref<Provider>(structuredClone(providerSelfEditMock))
const draft = reactive<ProviderSelfEditDraft>(draftFromProvider(provider.value))
const savedFlash = ref(false)
const saveAlertRef = ref<HTMLElement | null>(null)
const autoSavedAt = ref<number | null>(null)
/** When the user landed on this preview (or last Reset); used before first save in session. */
const sessionOpenedAt = ref(Date.now())
const hasUnsavedChanges = ref(false)

/** Rarely edited: practice phone / email / website */
const practiceDetailsOpen = ref(false)
let suppressDirtyWatch = 0
const lastSavedDraftSignature = ref('')

const sessionStatusLine = computed(() => {
  const fmt = (ms: number) =>
    new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (autoSavedAt.value) {
    return `Last saved locally · ${fmt(autoSavedAt.value)}`
  }
  return `No session save yet · preview opened ${fmt(sessionOpenedAt.value)}`
})

const listingPageHeading = computed(() => {
  const name = draft.name.trim()
  return name || 'My listing'
})

function serializeDraft(): string {
  return JSON.stringify(draft)
}

function togglePracticeDetails() {
  practiceDetailsOpen.value = !practiceDetailsOpen.value
}

function persistToSession() {
  suppressDirtyWatch++
  try {
    provider.value = applyDraftToProvider(provider.value, draft)
    provider.value = {
      ...provider.value,
      updatedAt: new Date().toISOString(),
    }
    Object.assign(draft, draftFromProvider(provider.value))
    autoSavedAt.value = Date.now()
    lastSavedDraftSignature.value = serializeDraft()
    hasUnsavedChanges.value = false
  } finally {
    nextTick(() => {
      suppressDirtyWatch--
    })
  }
}

watch(
  draft,
  () => {
    if (suppressDirtyWatch > 0) return
    hasUnsavedChanges.value = serializeDraft() !== lastSavedDraftSignature.value
  },
  { deep: true },
)

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasUnsavedChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  lastSavedDraftSignature.value = serializeDraft()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

function resetDraft() {
  suppressDirtyWatch++
  Object.assign(draft, draftFromProvider(provider.value))
  nextTick(() => {
    suppressDirtyWatch--
  })
  lastSavedDraftSignature.value = serializeDraft()
  hasUnsavedChanges.value = false
  savedFlash.value = false
  sessionOpenedAt.value = Date.now()
  practiceDetailsOpen.value = false
}

function dismissSaveBanner() {
  savedFlash.value = false
}

function handleSave() {
  if (!hasUnsavedChanges.value) return
  persistToSession()
  savedFlash.value = true
  nextTick(() => {
    saveAlertRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

onBeforeRouteLeave(() => {
  if (!hasUnsavedChanges.value) return true
  return window.confirm('You have unsaved changes. Leave this page without saving?')
})
</script>

<template>
  <LegacyHeader show-logout />

  <main class="content-wrapper">
    <LegacyPageHeader
      :page-heading="listingPageHeading"
      page-subheading="Listing Management"
      compact-below
    />

    <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div class="row justify-content-center">
        <div class="col-12">
          <div
            class="sticky-top bg-body border-bottom shadow-sm py-3 mb-4 mx-n2 mx-sm-0 px-2 px-sm-0"
            style="top: var(--portal-sticky-toolbar-top); z-index: 1020"
          >
            <div class="d-md-flex align-items-start justify-content-between w-100 gap-3">
              <div class="flex-grow-1 min-w-0">
                <h1 class="h3 mb-2">Edit your listing</h1>
                <p class="portal-session-status small text-body-secondary mb-0 mt-1">{{ sessionStatusLine }}</p>
                <span
                  class="portal-pending-chip badge border fs-sm fw-normal d-inline-block"
                  :class="
                    hasUnsavedChanges
                      ? 'border-warning-subtle text-warning-emphasis bg-warning-subtle'
                      : 'border-secondary-subtle text-body-secondary bg-body-secondary bg-opacity-25'
                  "
                  role="status"
                  aria-live="polite"
                >
                  {{ hasUnsavedChanges ? 'Pending changes' : 'No changes pending' }}
                </span>
              </div>
              <div class="text-light-subtle mb-n1 flex-shrink-0 text-md-end">
                <div>
                  <em>Logged in as {{ username }}</em>
                </div>
                <div
                  class="d-flex flex-wrap gap-2 justify-content-md-end align-items-center portal-toolbar-actions"
                >
                  <button
                    type="submit"
                    form="provider-portal-form"
                    class="btn fw-semibold"
                    :class="hasUnsavedChanges ? 'btn-portal-save-active' : 'btn-secondary'"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    form="provider-portal-form"
                    class="btn btn-outline-secondary"
                    @click="resetDraft"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="savedFlash"
              ref="saveAlertRef"
              class="alert alert-success border border-success rounded shadow-sm mt-3 mb-0 py-3 px-3 px-md-4"
              style="scroll-margin-top: 6rem"
              role="status"
              aria-live="polite"
            >
              <div class="d-flex gap-3 align-items-start">
                <div class="flex-grow-1">
                  <strong class="d-block fs-5 mb-1">Saved</strong>
                  <span class="d-block small text-body-secondary">Stored in this browser session only (not synced yet).</span>
                </div>
                <button type="button" class="btn-close flex-shrink-0" aria-label="Dismiss" @click="dismissSaveBanner" />
              </div>
            </div>
          </div>

          <div class="vstack gap-5 px-0">
            <div class="list-group">
              <div class="list-group-item p-4 p-md-5">
                <div>
                  <form id="provider-portal-form" class="form" @submit.prevent="handleSave">
                    <div class="row">
                      <div class="col-12 mb-3">
                        <label for="portal-name" class="form-label">Practice / listing name</label>
                        <input id="portal-name" v-model="draft.name" type="text" class="form-control w-100" required />
                      </div>

                      <div class="col-12 mb-2">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-secondary"
                          :aria-expanded="practiceDetailsOpen"
                          aria-controls="portal-practice-details"
                          @click="togglePracticeDetails"
                        >
                          {{ practiceDetailsOpen ? 'Hide details' : 'Edit details' }}
                        </button>
                      </div>
                      <div
                        v-show="practiceDetailsOpen"
                        id="portal-practice-details"
                        class="col-12 pt-4"
                      >
                        <div class="row g-3">
                          <div class="col-12 col-md-6">
                            <label for="portal-phone" class="form-label">Phone</label>
                            <input id="portal-phone" v-model="draft.phone" type="text" class="form-control w-full" />
                          </div>
                          <div class="col-12 col-md-6">
                            <label for="portal-email" class="form-label">Email</label>
                            <input id="portal-email" v-model="draft.email" type="email" class="form-control w-full" />
                          </div>
                          <div class="col-12">
                            <label for="portal-website" class="form-label">Website</label>
                            <input id="portal-website" v-model="draft.website" type="url" class="form-control w-full" />
                          </div>
                        </div>
                      </div>

                      <div class="col-12 mt-5 pt-2 mb-3">
                        <h2 class="h4 fw-semibold mb-0">Locations</h2>
                      </div>

                      <div class="col-12">
                        <div class="row g-4">
                          <div
                            v-for="loc in draft.locations"
                            :key="loc.id"
                            class="col-12 col-lg-6"
                          >
                            <div class="border rounded p-3 p-md-4 h-100">
                              <div class="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                                <div class="h3 mb-0 text-brand min-w-0">{{ loc.name }}</div>
                              </div>
                              <div class="d-block fs-md text-body mb-3">
                                {{ formatLocationAddress(loc) }}
                              </div>

                              <div class="form-check form-switch pb-2 mb-lg-3">
                                <input
                                  :id="`portal-availability-${loc.id}`"
                                  v-model="loc.availability"
                                  type="checkbox"
                                  class="form-check-input"
                                  role="switch"
                                />
                                <label :for="`portal-availability-${loc.id}`" class="form-check-label ms-1">
                                  Has availability
                                </label>
                              </div>

                              <div class="row g-3 pt-2 mt-1">
                                <div class="col-12">
                                  <label class="form-label" :for="`portal-loc-name-${loc.id}`">Location name</label>
                                  <input
                                    :id="`portal-loc-name-${loc.id}`"
                                    v-model="loc.name"
                                    type="text"
                                    class="form-control w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div class="my-5" />
          <div class="py-5" />
        </div>
      </div>
    </div>
  </main>

  <LegacyFooter />
</template>

<style scoped>
.portal-session-status {
  padding-top: 7px;
  padding-bottom: 16px;
}

/* Width hugs label text; not full column */
.portal-pending-chip {
  width: fit-content;
  max-width: 100%;
  margin-bottom: 8px;
}

.portal-toolbar-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.btn-portal-save-active {
  --portal-save-fg: #0b2239;
  background-color: #2ba471;
  border-color: #258a5f;
  color: var(--portal-save-fg);
}

.btn-portal-save-active:hover:not(:disabled) {
  background-color: #248f62;
  border-color: #1e7a54;
  color: var(--portal-save-fg);
}

.btn-portal-save-active:focus-visible {
  box-shadow: 0 0 0 0.25rem rgba(43, 164, 113, 0.45);
  color: var(--portal-save-fg);
}
</style>
