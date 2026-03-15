/**
 * Splash page data and render functions (logic / view).
 * Used by SplashPage.stories.js; can be reused for static export or tests.
 */
export const defaultArgs = {
  heading: 'Find DBT Providers in Minnesota',
  tagline: 'Search for certified providers and see who has availability.',
  copy: "We're building a simple directory so you can find certified DBT providers in Minnesota and see who has openings. Sign up below and we'll notify you when availability changes—no clutter, just the information you need.",
  formHeading: 'Get notified',
  submitLabel: 'Notify me',
};

export const icons = {
  check: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
  mail: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  mapPin: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  search: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
  bell: '<svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
};

export function formFields(args) {
  const formHeading = args?.formHeading ?? defaultArgs.formHeading;
  const submitLabel = args?.submitLabel ?? defaultArgs.submitLabel;
  return `
    <section class="relative overflow-hidden rounded-xl border border-layer-line bg-layer bg-blend-darken p-6">
      <h2 class="text-xl font-semibold text-layer-foreground mb-4">${formHeading}</h2>
      <form action="#" method="post" class="relative space-y-4">
        <div>
          <label for="name" class="mb-1 block text-sm font-medium text-layer-foreground">Name</label>
          <input type="text" id="name" name="name" required placeholder="Your name"
            class="block w-full rounded-lg border-2 border-line-4 bg-layer px-3 py-2.5 text-layer-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-layer-foreground">Email</label>
          <input type="email" id="email" name="email" required placeholder="you@example.com"
            class="block w-full rounded-lg border-2 border-line-4 bg-layer px-3 py-2.5 text-layer-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>
        <div class="pt-5">
          <button type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-4 font-semibold text-primary-foreground hover:opacity-90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none">
            ${icons.bell}
            <span>${submitLabel}</span>
          </button>
        </div>
      </form>
    </section>
  `;
}

export function header() {
  return `
  <header class="sticky top-0 z-50 w-full border-b border-navbar-line bg-navbar">
    <div class="mx-auto flex max-w-7xl items-center gap-x-4 px-4 py-3 sm:px-6 lg:px-8">
      <a href="/" class="flex shrink-0 items-center">
        <img src="/images/dbtsearch-logo.svg" alt="DBT Search" class="h-10 w-auto sm:h-12" />
      </a>
    </div>
  </header>
  `;
}

export function footer() {
  const year = new Date().getFullYear();
  return `
  <footer class="border-t border-border py-6">
    <div class="mx-auto max-w-7xl px-4 pt-5 text-center sm:px-6 lg:px-8">
      <p class="mb-3 text-sm text-muted-foreground">
        <span class="font-semibold text-foreground">DBTsearch</span> is powered by
        <a href="https://www.tinytreecounseling.com/" target="_blank" rel="noopener noreferrer" class="text-primary underline decoration-1 hover:opacity-90">Tiny Tree Counseling &amp; Consulting</a>
      </p>
      <p class="mb-0 text-xs text-muted-foreground">
        Copyright &copy; ${year} DBTsearch.org. All rights reserved.
      </p>
    </div>
  </footer>
  `;
}

function withArgs(args) {
  return { ...defaultArgs, ...args };
}

/** Default splash layout: image flush left (viewport edge), form + copy right. */
export function renderImageFlushLeft(args = {}) {
  const { heading, tagline, copy } = withArgs(args);
  return `
<div class="dark min-h-screen bg-background bg-texture-mesh text-foreground flex flex-col font-sans antialiased" data-theme="dbtsearch">
  ${header()}
  <div class="relative h-20 w-full flex-shrink-0 md:hidden">
    <img src="/images/pexels-steve-1690351.jpg" alt="" class="h-full w-full object-cover object-center" />
    <div class="absolute inset-0 bg-background/50" aria-hidden="true"></div>
  </div>
  <main class="flex flex-1 flex-col md:flex-row min-h-0">
    <div class="relative hidden md:block w-1/2 min-w-0 flex-shrink-0 order-2 md:order-1">
      <img src="/images/pexels-steve-1690351.jpg" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-background/40" aria-hidden="true"></div>
    </div>
    <div class="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8 order-1 md:order-2">
      <div class="w-full max-w-md space-y-6">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">${heading}</h1>
          <p class="mt-2 text-base font-bold text-accent mb-5">${tagline}</p>
          <p class="text-sm text-muted-foreground">${copy}</p>
        </div>
        <ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <li class="flex items-center gap-2">${icons.check}<span>Certified only</span></li>
          <li class="flex items-center gap-2">${icons.mapPin}<span>Minnesota</span></li>
          <li class="flex items-center gap-2 text-accent">${icons.mail}<span class="font-medium text-foreground">Get notified</span></li>
        </ul>
        ${formFields(args)}
      </div>
    </div>
  </main>
  ${footer()}
</div>
  `.trim();
}
