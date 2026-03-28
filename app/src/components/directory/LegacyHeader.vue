<template>
  <header class="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Toggle navigation"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 text-slate-300 md:hidden"
      >
        <span class="text-lg leading-none">☰</span>
      </button>

      <RouterLink to="/" class="flex shrink-0 items-center">
        <img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="h-10 w-auto md:h-14" />
      </RouterLink>

      <nav class="ml-3 hidden items-center gap-4 text-sm text-slate-300 md:flex">
        <RouterLink to="/directory" class="hover:text-white">Providers</RouterLink>
        <a href="#" class="hover:text-white">About</a>
        <a href="#" class="hover:text-white">FAQs</a>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          class="hidden rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-white sm:inline-flex"
        >
          Contact
        </button>
        <button
          type="button"
          class="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Login
        </button>
      </div>
    </div>
  </header>
</template>
