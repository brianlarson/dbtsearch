<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink } from 'vue-router'
import LegacyFooter from '@/components/directory/LegacyFooter.vue'
import LegacyHeader from '@/components/directory/LegacyHeader.vue'
import LegacyPageHeader from '@/components/directory/LegacyPageHeader.vue'
import { applyDraftToProvider, draftFromProvider, type ProviderSelfEditDraft } from '@/lib/providerPortalAllowlist'
import { getProviderPortalUsername } from '@/lib/providerSession'
import { providerSelfEditMock } from '@/mocks/providerSelfEditMock'
import type { Provider } from '@/types/provider'

const username = getProviderPortalUsername() ?? 'Provider'

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
/** When the user landed on this preview (or last Reset); used before first local save. */
const previewOpenedAt = ref(Date.now())
const hasUnsavedChanges = ref(false)
const showPendingActions = ref(false)
let pendingActionsTimer: number | null = null

/** Rarely edited: practice phone / email / website */
const practiceDetailsOpen = ref(false)
const locationDetailsOpen = reactive<Record<string, boolean>>({})
let suppressDirtyWatch = 0
const lastSavedDraftSignature = ref('')

const portalToolbarRef = ref<HTMLElement | null>(null)
const portalEditRegionRef = ref<HTMLElement | null>(null)
/** Bottom border / shadow on sticky toolbar only while listing form scrolls under it. */
const portalToolbarOverlapsEdits = ref(false)
let portalToolbarResizeObserver: ResizeObserver | null = null

function updatePortalToolbarOverlap(): void {
  const toolbar = portalToolbarRef.value
  const edits = portalEditRegionRef.value
  if (!toolbar || !edits) {
    portalToolbarOverlapsEdits.value = false
    return
  }
  const tb = toolbar.getBoundingClientRect()
  const ed = edits.getBoundingClientRect()
  portalToolbarOverlapsEdits.value = ed.top < tb.bottom - 0.5
}

const localSaveStatusLine = computed(() => {
  const fmt = (ms: number) =>
    new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (autoSavedAt.value) {
    return `Last saved locally · ${fmt(autoSavedAt.value)}`
  }
  return `No local save yet · preview opened ${fmt(previewOpenedAt.value)}`
})

const listingPageHeading = computed(() => {
  const name = draft.name.trim()
  return name || 'My listing'
})

const locationsSectionHeading = computed(() =>
  draft.locations.length === 1 ? 'Location' : 'Locations',
)

/** Phone, email, website — same scale as location addresses; rendered with spaced bullets. */
const practiceContactParts = computed(() => {
  const phone = draft.phone?.trim() ?? ''
  const email = draft.email?.trim() ?? ''
  const website = draft.website?.trim() ?? ''
  return [phone, email, website].filter(Boolean)
})

function serializeDraft(): string {
  return JSON.stringify(draft)
}

function togglePracticeDetails() {
  practiceDetailsOpen.value = !practiceDetailsOpen.value
}

function isLocationDetailsOpen(id: string): boolean {
  return Boolean(locationDetailsOpen[id])
}

function toggleLocationDetails(id: string) {
  locationDetailsOpen[id] = !isLocationDetailsOpen(id)
}

function commitLocalSave() {
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

watch(hasUnsavedChanges, (pending) => {
  if (pendingActionsTimer != null) {
    window.clearTimeout(pendingActionsTimer)
    pendingActionsTimer = null
  }

  if (!pending) {
    showPendingActions.value = false
    return
  }

  // Avoid button flicker while users are actively typing; reveal after a short pause.
  pendingActionsTimer = window.setTimeout(() => {
    showPendingActions.value = true
    pendingActionsTimer = null
  }, 500)
})

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasUnsavedChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  lastSavedDraftSignature.value = serializeDraft()
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('scroll', updatePortalToolbarOverlap, { passive: true })
  window.addEventListener('resize', updatePortalToolbarOverlap, { passive: true })
  void nextTick(() => {
    updatePortalToolbarOverlap()
    if (typeof ResizeObserver === 'undefined') return
    portalToolbarResizeObserver = new ResizeObserver(() => updatePortalToolbarOverlap())
    portalToolbarRef.value && portalToolbarResizeObserver.observe(portalToolbarRef.value)
    portalEditRegionRef.value && portalToolbarResizeObserver.observe(portalEditRegionRef.value)
  })
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('scroll', updatePortalToolbarOverlap)
  window.removeEventListener('resize', updatePortalToolbarOverlap)
  portalToolbarResizeObserver?.disconnect()
  portalToolbarResizeObserver = null
  if (pendingActionsTimer != null) {
    window.clearTimeout(pendingActionsTimer)
    pendingActionsTimer = null
  }
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
  previewOpenedAt.value = Date.now()
  practiceDetailsOpen.value = false
  Object.keys(locationDetailsOpen).forEach((id) => {
    locationDetailsOpen[id] = false
  })
}

function dismissSaveBanner() {
  savedFlash.value = false
}

function handleSave() {
  if (!hasUnsavedChanges.value) return
  commitLocalSave()
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
  <LegacyHeader provider-portal-nav />

  <main class="content-wrapper">
    <LegacyPageHeader
      :page-heading="listingPageHeading"
      page-subheading="Listing Management"
      compact-below
      brand-page-heading
    />

    <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div class="row justify-content-center">
        <div class="col-12">
          <div
            ref="portalToolbarRef"
            class="sticky-top bg-body py-3 mb-4 mx-n2 mx-sm-0 px-2 px-sm-0"
            :class="{ 'border-bottom shadow-sm': portalToolbarOverlapsEdits }"
            style="top: var(--portal-sticky-toolbar-top); z-index: 1020"
          >
            <div class="d-md-flex align-items-start justify-content-between w-100 gap-3 mt-2">
              <div class="flex-grow-1 min-w-0">
                <h1 class="h3 mb-2 text-brand">Edit your listing</h1>
                <p class="portal-local-save-status small text-body-secondary mb-0 mt-1">{{ localSaveStatusLine }}</p>
                <Transition name="portal-pending-chip-fade" mode="out-in">
                  <span
                    v-if="!showPendingActions"
                    key="none"
                    class="portal-pending-chip badge border fs-sm fw-normal d-inline-block border-secondary-subtle text-body-secondary bg-body-secondary bg-opacity-25"
                    role="status"
                    aria-live="polite"
                  >
                    No changes pending
                  </span>
                  <span
                    v-else
                    key="pending"
                    class="portal-pending-chip badge border fs-sm fw-normal d-inline-block border-warning-subtle text-warning-emphasis bg-warning-subtle"
                    role="status"
                    aria-live="polite"
                  >
                    Pending changes
                  </span>
                </Transition>
              </div>
              <div class="text-light-subtle mb-n1 flex-shrink-0 text-md-end ms-3">
                <div class="d-flex flex-wrap align-items-center gap-2 justify-content-md-end">
                  <span class="portal-login-status">
                    <i class="fi-lock fs-xs me-1" aria-hidden="true" />
                    Logged in as
                    <strong class="portal-login-status__username">{{ username }}</strong>
                  </span>
                  <RouterLink to="/logout" class="btn btn-sm btn-outline-secondary">Logout</RouterLink>
                </div>
                <div
                  class="d-flex flex-wrap gap-2 justify-content-md-end align-items-center portal-toolbar-actions"
                  :class="{ 'portal-toolbar-actions--visible': showPendingActions }"
                >
                  <button
                    type="submit"
                    form="provider-portal-form"
                    class="btn fw-semibold"
                    :class="hasUnsavedChanges ? 'btn-portal-save-active' : 'btn-secondary'"
                    :disabled="!showPendingActions || !hasUnsavedChanges"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    form="provider-portal-form"
                    class="btn btn-outline-secondary"
                    :disabled="!showPendingActions"
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
                  <span class="d-block small text-body-secondary">Saved in this browser only (not synced yet).</span>
                </div>
                <button type="button" class="btn-close flex-shrink-0" aria-label="Dismiss" @click="dismissSaveBanner" />
              </div>
            </div>
          </div>

          <div ref="portalEditRegionRef" class="vstack gap-5 px-0">
            <div class="list-group">
              <div class="list-group-item p-4 p-md-5">
                <div>
                  <form id="provider-portal-form" class="form" @submit.prevent="handleSave">
                    <div class="row">
                      <div class="col-12 mb-3">
                        <label for="portal-name" class="form-label">Provider Name</label>
                        <input id="portal-name" v-model="draft.name" type="text" class="form-control w-100" required />
                      </div>

                      <div v-if="practiceContactParts.length" class="d-block fs-md mb-3">
                        <div class="portal-practice-contact">
                          <template v-for="(part, i) in practiceContactParts" :key="i">
                            <span v-if="i > 0" class="portal-practice-contact__sep" aria-hidden="true">•</span>
                            {{ part }}
                          </template>
                        </div>
                      </div>

                      <div class="col-12 mb-2">
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-secondary"
                          :aria-expanded="practiceDetailsOpen"
                          aria-controls="portal-practice-details"
                          @click="togglePracticeDetails"
                        >
                          <i class="fi-edit fs-xs me-1" aria-hidden="true" />
                          {{ practiceDetailsOpen ? 'Hide' : 'Edit' }}
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
                        <h2 class="h4 fw-semibold mb-0">{{ locationsSectionHeading }}</h2>
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
                                <button
                                  type="button"
                                  class="btn btn-sm btn-outline-secondary"
                                  :aria-expanded="isLocationDetailsOpen(loc.id)"
                                  :aria-controls="`portal-location-details-${loc.id}`"
                                  @click="toggleLocationDetails(loc.id)"
                                >
                                  <i class="fi-edit fs-xs me-1" aria-hidden="true" />
                                  {{ isLocationDetailsOpen(loc.id) ? 'Hide' : 'Edit' }}
                                </button>
                              </div>
                              <div
                                v-show="isLocationDetailsOpen(loc.id)"
                                :id="`portal-location-details-${loc.id}`"
                                class="pb-1"
                              >
                                <label class="form-label" :for="`portal-loc-name-${loc.id}`">Location name</label>
                                <input
                                  :id="`portal-loc-name-${loc.id}`"
                                  v-model="loc.name"
                                  type="text"
                                  class="form-control w-full mb-3"
                                />
                              </div>
                              <div class="d-block fs-md text-body mb-3">
                                {{ formatLocationAddress(loc) }}
                              </div>

                              <div class="form-check form-switch pb-1 mb-2">
                                <input
                                  :id="`portal-availability-${loc.id}`"
                                  v-model="loc.availability"
                                  type="checkbox"
                                  class="form-check-input"
                                  role="switch"
                                />
                                <label :for="`portal-availability-${loc.id}`" class="form-check-label ms-1">
                                  Accepting new clients
                                </label>
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
#portal-name {
  font-weight: 600;
  font-size: 18px;
  padding: 12px 18px;
}

.portal-local-save-status {
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
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.portal-toolbar-actions--visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.portal-login-status {
  font-style: normal;
}

.portal-login-status__username {
  color: var(--fi-primary);
  font-weight: 700;
}

.portal-practice-contact {
  display: block;
  word-break: break-word;
  color: rgba(187, 206, 253, 1);
  font-family: "SF Compact Text", sans-serif;
  font-size: calc(1em + 1px);
  font-weight: 600;
  line-height: 1.45;
}

.portal-practice-contact__sep {
  display: inline-block;
  padding: 0 0.45em;
  color: rgba(var(--bs-body-color-rgb), 0.45);
  font-weight: 300;
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

.portal-pending-chip {
  transition: opacity 220ms ease;
}

.portal-pending-chip-fade-enter-active,
.portal-pending-chip-fade-leave-active {
  transition: opacity 220ms ease;
}

.portal-pending-chip-fade-enter-from,
.portal-pending-chip-fade-leave-to {
  opacity: 0;
}
</style>
