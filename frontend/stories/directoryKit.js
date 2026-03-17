/**
 * Directory UI kit for Storybook (layout-first).
 * Preline/Tailwind token usage mirrors the upcoming Vue directory MVP.
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
    updatedAtLabel: 'Mar 15, 2026',
    image: null,
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
    updatedAtLabel: 'Mar 10, 2026',
    image: null,
  },
];

export function renderDirectoryHeader() {
  return `
    <header class="sticky top-0 z-40 w-full border-b border-navbar-line bg-navbar">
      <div class="mx-auto flex max-w-7xl items-center gap-x-4 px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" class="flex shrink-0 items-center">
          <img src="/images/dbtsearch-logo.svg" alt="DBT Search" class="h-10 w-auto sm:h-12" />
        </a>
      </div>
    </header>
  `;
}

export function renderBadge({ label, tone = 'neutral' }) {
  const tones = {
    success: 'border-emerald-500/50 text-emerald-300',
    info: 'border-cyan-500/50 text-cyan-300',
    neutral: 'border-layer-line text-layer-foreground',
  };
  return `<span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone] || tones.neutral}">${label}</span>`;
}

export function renderButton({ label = 'Button', variant = 'primary', icon = '' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none';
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'border border-layer-line bg-layer text-layer-foreground hover:bg-layer-hover',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    subtle: 'border border-layer-line text-muted-foreground hover:text-foreground hover:border-border',
  };
  return `<button type="button" class="${base} ${variants[variant] || variants.primary}">${icon ? `<span aria-hidden="true">${icon}</span>` : ''}<span>${label}</span></button>`;
}

export function renderTextInput({
  id = 'text',
  label = 'Label',
  placeholder = '',
  type = 'text',
  value = '',
}) {
  return `
    <div>
      <label for="${id}" class="mb-1 block text-sm font-medium text-layer-foreground">${label}</label>
      <input
        id="${id}"
        type="${type}"
        value="${value}"
        placeholder="${placeholder}"
        class="block w-full rounded-lg border border-layer-line bg-layer px-3 py-2.5 text-layer-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
      />
    </div>
  `;
}

export function renderDirectoryFilters({ resultCount = 24, onlyAvailable = true, search = '' } = {}) {
  return `
    <section class="rounded-xl border border-layer-line bg-layer p-4 md:p-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label class="inline-flex items-center gap-2 text-sm text-layer-foreground">
          <input type="checkbox" class="rounded border-layer-line bg-layer text-primary focus:ring-primary" ${onlyAvailable ? 'checked' : ''} />
          <span>Only show providers with availability</span>
        </label>
        <div class="text-sm text-muted-foreground">Results: ${resultCount}</div>
      </div>
      <div class="mt-4">
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
  const address = `${provider.address} ${provider.city}, ${provider.state} ${provider.zip}`;
  return `
    <article class="overflow-hidden rounded-xl border border-layer-line bg-layer">
      <div class="grid grid-cols-1 gap-0 sm:grid-cols-[12rem_1fr]">
        <div class="border-b border-layer-line bg-background/40 p-5 sm:border-r sm:border-b-0">
          <div class="flex h-full min-h-[7rem] items-center justify-center rounded-lg border border-layer-line bg-background/60 p-4">
            ${
              provider.image
                ? `<img src="${provider.image}" alt="${provider.name} logo" class="max-h-20 w-auto object-contain" />`
                : '<span class="text-3xl text-primary" aria-hidden="true">❤</span>'
            }
          </div>
        </div>
        <div class="p-5">
          <div class="mb-3 flex flex-wrap gap-2">
            ${renderBadge({ label: provider.availability ? 'Availability' : 'No Availability', tone: provider.availability ? 'success' : 'neutral' })}
            ${provider.dbtaCertified ? renderBadge({ label: 'DBT-A Certified', tone: 'info' }) : ''}
          </div>
          <h3 class="mb-1 text-lg font-semibold text-primary">${provider.name}</h3>
          <p class="mb-3 text-sm text-muted-foreground">${address}</p>
          <div class="mb-4 text-sm">
            <a href="tel:${provider.phone}" class="text-primary underline decoration-primary/40 underline-offset-2 hover:opacity-90">${provider.phone}</a>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex flex-wrap gap-2">
              ${provider.website ? renderButton({ label: 'Website', variant: 'subtle' }) : ''}
              ${provider.email ? renderButton({ label: 'Email', variant: 'subtle' }) : ''}
            </div>
            <div class="text-sm text-muted-foreground">
              Last updated:
              <span class="font-medium text-foreground">${provider.updatedAtLabel || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

export function renderListState({ state = 'loading' } = {}) {
  if (state === 'loading') {
    return '<div class="rounded-xl border border-layer-line bg-layer p-6 text-muted-foreground">Loading providers...</div>';
  }
  if (state === 'error') {
    return `
      <div class="rounded-xl border border-tertiary-400/40 bg-tertiary-500/10 p-6 text-sm text-foreground">
        <p class="mb-4">We couldn’t load providers right now.</p>
        ${renderButton({ label: 'Retry', variant: 'outline' })}
      </div>
    `;
  }
  return `
    <div class="rounded-xl border border-layer-line bg-layer p-6 text-center">
      <p class="mb-4 text-muted-foreground">No providers match your current filters.</p>
      ${renderButton({ label: 'Reset filters', variant: 'primary' })}
    </div>
  `;
}

export function renderDirectoryPageFrame({ providers = sampleProviders, resultCount = 24, onlyAvailable = true, search = '' } = {}) {
  return `
    <div class="dark min-h-screen bg-background text-foreground" data-theme="dbtsearch">
      ${renderDirectoryHeader()}
      <main class="pb-10">
        <section class="border-b border-layer-line bg-background/40">
          <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <p class="mb-2 text-sm uppercase tracking-wide text-muted-foreground">Directory</p>
            <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Providers</h1>
            <p class="mt-2 text-muted-foreground">DBT Providers in Minnesota</p>
          </div>
        </section>
        <section class="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          ${renderDirectoryFilters({ resultCount, onlyAvailable, search })}
          <ul class="mt-6 space-y-4">
            ${providers.map((provider) => `<li>${renderProviderCard(provider)}</li>`).join('')}
          </ul>
        </section>
      </main>
    </div>
  `;
}
