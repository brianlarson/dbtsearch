<script setup lang="ts">
import { computed } from 'vue'

interface Provider {
  id: number
  name: string
}

const props = withDefaults(
  defineProps<{
    heading?: string
    tagline?: string
    formHeading?: string
    submitLabel?: string
    providers?: Provider[]
  }>(),
  {
    heading: 'Find DBT Providers in Minnesota',
    tagline: 'Search for certified providers and see who has availability.',
    formHeading: 'Get notified',
    submitLabel: 'Submit',
    providers: () => [],
  }
)

const sortedProviders = computed(() =>
  [...props.providers].sort((a, b) => a.name.localeCompare(b.name))
)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white flex flex-col">
    <header class="border-b border-slate-800 flex-shrink-0">
      <div class="max-w-md px-4 py-4 flex justify-start">
        <RouterLink to="/" class="inline-block flex-shrink-0">
          <img
            src="/images/dbtsearch-logo.svg"
            alt="DBT Search"
            class="h-[3rem] w-auto md:h-[3.3rem]"
          />
        </RouterLink>
      </div>
    </header>

    <div class="md:hidden h-20 w-full overflow-hidden flex-shrink-0 p-0 m-0">
      <img
        src="/images/pexels-steve-1690351.jpg"
        alt=""
        class="w-full h-full object-cover object-center block"
      />
    </div>

    <main class="flex-1 flex items-center relative">
      <section class="w-full flex flex-col md:flex-row min-h-0">
        <div class="flex-1 flex items-center px-4 py-12 relative z-10">
          <div class="w-full max-w-md">
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              {{ heading }}
            </h1>
            <p class="text-slate-400 mb-10">
              {{ tagline }}
            </p>

            <section
              class="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-sm"
            >
              <h2 class="text-lg font-semibold mb-4">{{ formHeading }}</h2>
              <form action="#" method="post" class="space-y-4">
                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium text-slate-300 mb-1"
                    >Name</label
                  >
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    class="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    for="email"
                    class="block text-sm font-medium text-slate-300 mb-1"
                    >Email</label
                  >
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    class="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label
                    for="providerId"
                    class="block text-sm font-medium text-slate-300 mb-1"
                    >Provider</label
                  >
                  <select
                    id="providerId"
                    name="providerId"
                    class="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 pr-10 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none [&>option]:text-slate-900"
                  >
                    <option value="">Select a provider</option>
                    <option
                      v-for="p in sortedProviders"
                      :key="p.id"
                      :value="p.id"
                    >
                      {{ p.name }}
                    </option>
                  </select>
                </div>
                <button
                  type="submit"
                  class="w-full mt-2 rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 px-4 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  {{ submitLabel }}
                </button>
              </form>
            </section>
          </div>
        </div>
        <div
          class="hidden md:block md:w-1/2 relative flex-shrink-0"
          aria-hidden="true"
        >
          <img
            src="/images/pexels-steve-1690351.jpg"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-slate-950/40"
            aria-hidden="true"
          />
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-800 py-6 relative z-10">
      <div class="container max-w-4xl mx-auto px-4 text-center text-slate-500 text-sm">
        <p>
          <span class="font-semibold text-slate-400">DBT Search</span>
          — certified DBT providers in Minnesota
        </p>
      </div>
    </footer>
  </div>
</template>
