/**
 * Directory UI kit for Storybook.
 * Intentionally mirrors class names and structure in app/src/components/directory/*.vue.
 */

export const sampleProviders = [
  {
    id: '1',
    name: 'Tiny Tree Counseling & Consulting',
    availability: true,
    dbtaCertified: true,
    address: '3950 Lyndale Ave S Suite 2',
    city: 'Minneapolis',
    state: 'MN',
    zip: '55409',
    phone: '833-482-5546',
    website: 'https://www.tinytreecounseling.com/',
    email: 'support@tinytreecounseling.com',
    updatedAt: '2026-03-15T00:00:00.000Z',
    imageUrl: '',
  },
  {
    id: '2',
    name: 'Associated Clinic of Psychology',
    availability: false,
    dbtaCertified: true,
    address: '4027 County Road 25',
    city: 'Minneapolis',
    state: 'MN',
    zip: '55416',
    phone: '612-925-6033',
    website: 'http://acp-mn.com/',
    email: '',
    updatedAt: '2026-03-10T00:00:00.000Z',
    imageUrl: '',
  },
];

export function renderLegacyHeader() {
  return `
    <header class="border-b border-slate-800 bg-slate-950">
      <div class="mx-auto flex max-w-md justify-start px-4 py-4">
        <a href="/" class="inline-block shrink-0">
          <img src="/images/dbtsearch-logo.svg" alt="DBT Search" class="h-[3rem] w-auto md:h-[3.3rem]" />
        </a>
      </div>
    </header>
  `;
}

export function renderDirectoryTopNav() {
  return `
    <header class="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Toggle navigation"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-700 text-slate-300 md:hidden"
        >
          <span class="text-lg leading-none">☰</span>
        </button>
        <a href="/" class="flex shrink-0 items-center">
          <img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="h-10 w-auto md:h-14" />
        </a>

        <nav class="ml-3 hidden items-center gap-4 text-sm text-slate-300 md:flex">
          <a href="#" class="hover:text-white">Providers</a>
          <a href="#" class="hover:text-white">About</a>
          <a href="#" class="hover:text-white">FAQs</a>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <button type="button" class="hidden rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-white sm:inline-flex">
            Contact
          </button>
          <button type="button" class="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Login
          </button>
        </div>
      </div>
    </header>
  `;
}

export function renderLegacyPageHeader({ pageHeading = 'Providers', pageSubheading = 'DBT Providers in Minnesota' } = {}) {
  return `
    <section class="relative bg-slate-900 py-5" aria-hidden="true">
      <div class="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8"></div>
      <div class="pointer-events-none absolute inset-0 grid grid-cols-1 md:grid-cols-2">
        <div class="hidden md:block"></div>
        <div class="relative">
          <div
            class="absolute inset-0 bg-cover bg-center"
            style="background-image: url('/images/pexels-steve-1690351.jpg');"
          ></div>
        </div>
      </div>
      <div class="pointer-events-none absolute inset-0 bg-black/50 md:hidden"></div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:py-7 lg:px-8">
      <div class="grid grid-cols-1 items-end gap-2 md:grid-cols-2">
        <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">${pageHeading}</h1>
        <h2 class="text-base font-medium text-slate-300 md:text-right">${pageSubheading}</h2>
      </div>
      <hr class="mt-4 border-slate-700" />
    </section>
  `;
}

export function renderLegacyFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="mt-14 border-t border-slate-800 py-6">
      <div class="mx-auto max-w-4xl px-4 text-center text-sm text-slate-500">
        <p>
          <span class="font-semibold text-slate-400">DBT Search</span>
          — certified DBT providers in Minnesota
        </p>
        <p class="mt-3 text-sm text-slate-300">
          <span class="font-semibold text-white">DBTsearch</span> is powered by
          <a
            href="https://www.tinytreecounseling.com/"
            class="ml-1 text-primary underline decoration-1 hover:opacity-90"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tiny Tree Counseling &amp; Consulting
          </a>
        </p>
        <p class="mt-2 text-xs text-slate-400">Copyright &copy; ${year} DBTsearch.org. All rights reserved.</p>
      </div>
    </footer>
  `;
}

export function formatUpdatedAt(value) {
  if (!value) return 'Unknown';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function renderBadge({ label, tone = 'neutral' }) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/50 text-emerald-300'
      : tone === 'info'
        ? 'border-cyan-500/50 text-cyan-300'
        : 'border-slate-600 text-slate-300';
  return `<span class="rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass}">${label}</span>`;
}

export function renderButton({ label = 'Button', variant = 'primary' }) {
  const variants = {
    primary: 'rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90',
    retry:
      'rounded-lg border border-red-400/50 px-3 py-2 text-sm hover:bg-red-500/20 text-red-200',
  };
  return `<button type="button" class="${variants[variant] || variants.primary}">${label}</button>`;
}

export function renderActionLink({ label, href = '#' }) {
  return `
    <a
      href="${href}"
      class="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-primary hover:text-white"
    >
      ${label}
    </a>
  `;
}

export function renderTextInput({ id = 'text', label = 'Label', placeholder = '', type = 'text', value = '' }) {
  return `
    <div>
      <label for="${id}" class="mb-1 block text-sm font-medium text-slate-300">${label}</label>
      <input
        id="${id}"
        type="${type}"
        value="${value}"
        placeholder="${placeholder}"
        class="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
    </div>
  `;
}

export function renderDirectoryFilters({ resultCount = 24, onlyAvailable = true, search = '' } = {}) {
  return `
    <section class="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:p-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label class="inline-flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" class="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary" ${onlyAvailable ? 'checked' : ''} />
          <span>Only show providers with availability</span>
        </label>
        <div class="text-sm text-slate-400">Results: ${resultCount}</div>
      </div>
      <div>
        ${renderTextInput({
          id: 'provider-search',
          label: 'Search by provider name',
          placeholder: 'Start typing a provider name...',
          type: 'search',
          value: search,
        })}
      </div>
    </section>
  `;
}

export function renderProviderCard(provider = sampleProviders[0]) {
  return `
    <article class="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div class="grid grid-cols-1 gap-0 sm:grid-cols-[12rem_1fr]">
        <div class="rounded overflow-hidden border-b border-slate-800 p-4 sm:border-r sm:border-b-0 sm:p-5">
          <div class="relative flex h-full min-h-[10.875rem] items-center justify-center bg-slate-800/50 p-5">
            ${
              provider.imageUrl
                ? `<img src="${provider.imageUrl}" alt="${provider.name} logo" class="max-h-20 w-auto object-contain px-3 py-3" />`
                : '<span class="text-3xl text-primary" aria-hidden="true">❤</span>'
            }
          </div>
        </div>
        <div class="self-center">
          <div class="p-3 pt-4 sm:p-4 md:p-5">
          <div class="mb-4 flex flex-wrap items-center gap-2">
            ${renderBadge({
              label: provider.availability ? 'Availability' : 'No Availability',
              tone: provider.availability ? 'success' : 'neutral',
            })}
            ${provider.dbtaCertified ? renderBadge({ label: 'DBT-A Certified', tone: 'info' }) : ''}
          </div>
          <h3 class="mb-1 text-xl font-semibold text-primary">${provider.name}</h3>
          <p class="mb-3 text-sm text-slate-300">${provider.address} ${provider.city}, ${provider.state} ${provider.zip}</p>
          <div class="mb-4 text-sm">
            ${
              provider.phone
                ? `<a href="tel:${provider.phone}" class="text-primary underline decoration-primary/40 underline-offset-2 hover:opacity-90">${provider.phone}</a>`
                : ''
            }
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex flex-wrap gap-2">
              ${provider.website ? renderActionLink({ label: 'Website', href: provider.website }) : ''}
              ${
                provider.email
                  ? renderActionLink({
                      label: 'Email',
                      href: `mailto:${provider.email}?subject=Inquiry%20from%20DBT%20Search`,
                    })
                  : ''
              }
            </div>
            <div class="text-sm text-slate-400">
              Last updated:
              <span class="font-medium text-slate-200">${formatUpdatedAt(provider.updatedAt)}</span>
            </div>
          </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

export function renderProviderList({ providers = sampleProviders, empty = false } = {}) {
  if (empty || providers.length === 0) {
    return `
      <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-center">
        <p class="mb-4 text-slate-300">No providers match your current filters.</p>
        ${renderButton({ label: 'Reset filters', variant: 'primary' })}
      </div>
    `;
  }

  return `
    <ul class="space-y-5 px-0">
      ${providers.map((provider) => `<li>${renderProviderCard(provider)}</li>`).join('')}
    </ul>
  `;
}

export function renderListState({ state = 'loading' } = {}) {
  if (state === 'loading') {
    return '<div class="rounded-xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">Loading providers...</div>';
  }
  if (state === 'error') {
    return `
      <div class="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-200" role="alert">
        <p class="mb-4">Failed to load providers.</p>
        ${renderButton({ label: 'Retry', variant: 'retry' })}
      </div>
    `;
  }
  return renderProviderList({ providers: [], empty: true });
}

export function renderDirectoryPageFrame({
  providers = sampleProviders,
  resultCount = providers.length,
  onlyAvailable = true,
  search = '',
  isLoading = false,
  errorMessage = '',
} = {}) {
  return `
    <div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
      ${renderLegacyHeader()}
      ${renderDirectoryTopNav()}
      ${renderLegacyPageHeader({
        pageHeading: 'Providers',
        pageSubheading: 'DBT Providers in Minnesota',
      })}

      <main class="pb-12">
        <section class="mx-auto max-w-6xl px-4 pt-2 sm:px-6 lg:px-8">
          ${renderDirectoryFilters({ resultCount, onlyAvailable, search })}
          <section class="mt-6">
            ${
              isLoading
                ? renderListState({ state: 'loading' })
                : errorMessage
                  ? `<div class="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-red-200" role="alert"><p class="mb-4">${errorMessage}</p>${renderButton({ label: 'Retry', variant: 'retry' })}</div>`
                  : renderProviderList({ providers })
            }
          </section>
        </section>
      </main>

      ${renderLegacyFooter()}
    </div>
  `;
}
