/**
 * Static HTML aligned with Vue `app/src/components/directory/LegacyContentLayout.vue`
 * + `LegacyHeader`, `LegacyPageHeader`, `LegacyFooter` (Tailwind classes).
 * Nav uses `href="#"` — Storybook preview only.
 */

const LOGO_IMG =
  '<img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="h-auto max-w-[170px] md:hidden" width="170" height="40" /><img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="hidden h-auto max-w-[280px] md:block" width="280" height="48" />';

/**
 * Top bar — same classes as `LegacyHeader.vue` (desktop strip; mobile toggle present, menu not wired).
 */
export function renderLegacyVueHeader() {
  return `
<header class="sticky top-0 z-[1030] border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80" data-sticky-element>
  <div class="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 sm:px-6 lg:px-8">
    <button type="button" class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800/80 md:hidden" aria-label="Toggle navigation" disabled>
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
    <a href="#" class="navbar-brand inline-flex shrink-0 items-center py-1 md:py-2 xl:py-1">
      <span class="flex shrink-0 text-slate-200">${LOGO_IMG}</span>
      <span class="sr-only">DBTsearch</span>
    </a>
    <nav class="hidden flex-1 items-center justify-center gap-1 md:flex lg:gap-2" aria-label="Primary">
      <a href="#" class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white">Providers</a>
      <a href="#" class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white">About</a>
      <a href="#" class="rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white">FAQs</a>
    </nav>
    <div class="ml-auto flex items-center gap-1 sm:gap-2">
      <a href="#" class="hidden rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800/50 hover:text-white md:inline-flex">Contact</a>
      <a href="#" class="inline-flex items-center rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-500">Login</a>
    </div>
  </div>
</header>`;
}

/**
 * Hero + title — same structure as `LegacyPageHeader.vue`.
 */
export function renderLegacyVuePageHeader({
  pageHeading = 'Providers',
  pageSubheading = 'DBT Providers in Minnesota',
  omitSubheading = false,
  heroImageUrl = '/images/pexels-hero-1440.webp',
} = {}) {
  const titleBlock = omitSubheading
    ? `<h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">${escapeHtml(pageHeading)}</h1>
      <hr class="mt-4 border-slate-700" />`
    : `<div class="grid grid-cols-1 items-end gap-2 md:grid-cols-2 md:gap-4">
        <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">${escapeHtml(pageHeading)}</h1>
        <h2 class="text-base font-medium text-slate-400 md:text-right">${escapeHtml(pageSubheading)}</h2>
      </div>
      <hr class="mt-4 border-slate-700" />`;

  return `
<section class="relative min-h-[7rem] bg-slate-900 py-5 md:min-h-[9rem]">
  <div class="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8"></div>
  <div class="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
    <div class="hidden md:block"></div>
    <div class="relative" aria-hidden="true">
      <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${escapeHtml(heroImageUrl)}')"></div>
    </div>
  </div>
  <div class="absolute inset-0 bg-black/50 md:hidden" aria-hidden="true"></div>
</section>
<section class="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
  ${titleBlock}
</section>`;
}

export function renderLegacyVueFooter(year = new Date().getFullYear()) {
  return `
<footer class="mt-14 border-t border-slate-800/80 bg-slate-950/80">
  <div class="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 lg:px-8">
    <p class="mb-3 text-sm text-slate-300">
      <span class="font-semibold text-slate-100">DBTsearch</span> is powered by
      <a href="https://www.tinytreecounseling.com/" class="ml-1 text-brand underline decoration-1 hover:opacity-90 [text-decoration-thickness:1px]" target="_blank" rel="noopener noreferrer">Tiny Tree Counseling &amp; Consulting</a>
    </p>
    <p class="text-xs text-slate-400">Copyright &copy; ${year} DBTsearch.org. All rights reserved.</p>
  </div>
</footer>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Full page shell: header + page header + main column + footer.
 * @param {{ pageHeading?: string, pageSubheading?: string, omitSubheading?: boolean, heroImageUrl?: string, mainHtml?: string }} opts
 */
export function renderLegacyVueContentLayout(opts = {}) {
  const {
    pageHeading,
    pageSubheading,
    omitSubheading,
    heroImageUrl,
    mainHtml = '<p class="text-slate-400">Content slot.</p>',
  } = opts;

  return `
<div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
  ${renderLegacyVueHeader()}
  ${renderLegacyVuePageHeader({ pageHeading, pageSubheading, omitSubheading, heroImageUrl })}
  <main class="pb-12">
    <section class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 md:pt-8 lg:px-8">
      <div class="max-w-3xl text-base leading-relaxed text-slate-300 [&_p_a]:text-brand [&_p_a]:underline [&_p_a]:decoration-1 [&_p_a:hover]:opacity-90">
        ${mainHtml}
      </div>
    </section>
  </main>
  ${renderLegacyVueFooter()}
</div>`;
}
