<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** When true, show Admin instead of Login (legacy Header.jsx parity). */
    loggedIn?: boolean
  }>(),
  { loggedIn: false },
)

const mobileNavOpen = ref(false)
const mobileNavId = 'legacy-header-mobile-nav'

function closeMobileNav() {
  mobileNavOpen.value = false
}

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value
}

watch(mobileNavOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeMobileNav()
}

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="sticky top-0 z-[1030] border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80"
    data-sticky-element
  >
    <div class="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
      <button
        type="button"
        class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800/80 md:hidden"
        :aria-controls="mobileNavId"
        :aria-expanded="mobileNavOpen"
        aria-label="Toggle navigation"
        @click="toggleMobileNav"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <RouterLink
        to="/"
        class="navbar-brand inline-flex shrink-0 items-center py-1 md:py-2 xl:py-1"
        @click="closeMobileNav"
      >
        <span class="flex shrink-0 text-slate-200">
          <img
            src="/images/dbtsearch-logo.svg"
            alt="DBTsearch"
            class="h-auto max-w-[170px] md:hidden"
            width="170"
            height="40"
          />
          <img
            src="/images/dbtsearch-logo.svg"
            alt="DBTsearch"
            class="hidden h-auto max-w-[280px] md:block"
            width="280"
            height="48"
          />
        </span>
        <span class="sr-only">DBTsearch</span>
      </RouterLink>

      <nav
        class="hidden flex-1 items-center justify-center gap-1 md:flex lg:gap-2"
        aria-label="Primary"
      >
        <RouterLink
          to="/directory"
          class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white"
          active-class="bg-slate-800/80 text-white"
        >
          Providers
        </RouterLink>
        <RouterLink
          to="/about"
          class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white"
          active-class="bg-slate-800/80 text-white"
        >
          About
        </RouterLink>
        <RouterLink
          to="/faqs"
          class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white"
          active-class="bg-slate-800/80 text-white"
        >
          FAQs
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-1 sm:gap-2">
        <RouterLink
          to="/contact"
          class="hidden rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800/50 hover:text-white md:inline-flex"
          active-class="!border-brand/50 !bg-slate-800/90 !text-white"
        >
          Contact
        </RouterLink>

        <RouterLink
          v-if="props.loggedIn"
          to="/admin"
          class="inline-flex items-center gap-2 rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500"
          active-class="!bg-slate-500 !ring-2 !ring-white/20"
        >
          <svg class="h-4 w-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 11V7a4 4 0 118 0v4m-5 9h6a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2z"
            />
          </svg>
          Admin
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="inline-flex items-center rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500"
          active-class="!bg-slate-500 !ring-2 !ring-white/20"
        >
          Login
        </RouterLink>
      </div>
    </div>

    <!-- Mobile offcanvas (Providers / About / FAQs) -->
    <Teleport to="body">
      <div
        v-if="mobileNavOpen"
        class="fixed inset-0 z-[1040] md:hidden"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`${mobileNavId}-label`"
        @keydown="onKeydown"
      >
        <button
          type="button"
          class="absolute inset-0 bg-black/60"
          aria-label="Close menu"
          @click="closeMobileNav"
        />
        <div
          :id="mobileNavId"
          class="absolute inset-y-0 left-0 z-[1041] flex w-[min(100%,20rem)] flex-col border-r border-slate-800 bg-slate-900 shadow-xl"
        >
          <div class="flex items-center justify-end border-b border-slate-800 px-3 py-3">
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close navigation"
              @click="closeMobileNav"
            >
              <span class="text-xl leading-none" aria-hidden="true">×</span>
            </button>
          </div>
          <p :id="`${mobileNavId}-label`" class="sr-only">Main navigation</p>
          <nav class="flex flex-col gap-1 px-3 py-4" aria-label="Primary mobile">
            <RouterLink
              to="/directory"
              class="rounded-md px-3 py-3 text-base font-medium text-slate-200 hover:bg-slate-800"
              active-class="bg-slate-800 text-white"
              @click="closeMobileNav"
            >
              Providers
            </RouterLink>
            <RouterLink
              to="/about"
              class="rounded-md px-3 py-3 text-base font-medium text-slate-200 hover:bg-slate-800"
              active-class="bg-slate-800 text-white"
              @click="closeMobileNav"
            >
              About
            </RouterLink>
            <RouterLink
              to="/faqs"
              class="rounded-md px-3 py-3 text-base font-medium text-slate-200 hover:bg-slate-800"
              active-class="bg-slate-800 text-white"
              @click="closeMobileNav"
            >
              FAQs
            </RouterLink>
          </nav>
        </div>
      </div>
    </Teleport>
  </header>
</template>
