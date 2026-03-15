/**
 * Splash page data and render functions (logic / view).
 * Used by SplashPage.stories.js; can be reused for static export or tests.
 */
export const defaultArgs = {
  heading: 'Find Available DBT Progams in Minnesota',
  tagline: 'Coming Soon!',
  copy: "Our single mission is to increase access for those in need of DBT. We're building a directory for anyone to find certified DBT providers in Minnesota and see who has current openings.",
  formHeading: '✨ Get notified when we launch…',
  submitLabel: 'Notify Me',
  showSuccess: false,
  successMessage: "You're on the list! We'll notify you when we launch.",
};

// Icons for the splash page
export const icons = {
  check: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
  mail: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
  mapPin: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  search: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
  bell: '<svg class="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
  lightning: '<svg class="size-5 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>',
  checkCircle: '<svg class="size-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
};

// CSS classes for the form fields and radio options
const inputClass = 'block w-full rounded-lg border-2 border-line-4 bg-layer px-3 py-2.5 text-layer-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none';
const checkboxClass = 'h-4 w-4 rounded border-2 border-line-4 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none';
const labelClass = 'mb-2 block text-sm font-medium text-muted-foreground';

// Form inputs
export const formInputs = [
  { id: 'name', name: 'name', label: 'Name', type: 'text', required: true },
  { id: 'organization', name: 'organization', label: 'Organization <small class="ml-px"><i>(optional)</i></small>', type: 'text', required: false },
  { id: 'email', name: 'email', label: 'Email', type: 'email', required: true },
];

// Single checkbox: provider interested in being listed
export const formProviderCheckbox = {
  id: 'provider_listing',
  name: 'provider_listing',
  label: "I'm a certified provider interested in being listed",
};

//
function renderInput(field) {
  const req = field.required ? ' required' : '';
  const placeholder = field.placeholder ? ` placeholder="${field.placeholder}"` : '';
  return `<input type="${field.type}" id="${field.id}" name="${field.name}"${req}${placeholder} class="${inputClass}" />`;
}

// Render an input row for the form
function renderInputRow(field) {
  return `
        <div>
          <label for="${field.id}" class="${labelClass}">${field.label}</label>
          ${renderInput(field)}
        </div>`;
}

// Render the provider checkbox
function renderProviderCheckbox() {
  const { id, name, label } = formProviderCheckbox;
  return `
        <label class="flex cursor-pointer items-center gap-3 pt-2 mt-3">
          <input type="checkbox" id="${id}" name="${name}" value="1" class="${checkboxClass}" />
          <span class="text-sm text-muted-foreground">${label}</span>
        </label>`;
}

// Green subtle success alert (replaces form after sign up)
export function renderSuccessAlert(args = {}) {
  const message = args?.successMessage ?? defaultArgs.successMessage;
  return `
    <section class="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6" role="alert" aria-live="polite">
      <div class="flex items-start gap-3">
        ${icons.checkCircle}
        <p class="text-sm font-medium text-emerald-200">${message}</p>
      </div>
    </section>
  `;
}

// Render the form fields and radio options (or success alert when showSuccess)
export function formFields(args) {
  if (args?.showSuccess) {
    return renderSuccessAlert(args);
  }
  const formHeading = args?.formHeading ?? defaultArgs.formHeading;
  const submitLabel = args?.submitLabel ?? defaultArgs.submitLabel;
  const [nameField, orgField, emailField] = formInputs;
  const nameOrgRow = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${renderInputRow(nameField)}
          ${renderInputRow(orgField)}
        </div>`;
  return `
    <section class="mt-5 relative overflow-hidden rounded-xl border border-layer-line bg-layer bg-blend-darken p-6">
      <h2 class="text-2xl font-semibold text-uppercase text-accent-300 mb-7">${formHeading}</h2>
      <form action="#" method="post" class="relative text-foreground-muted">
        ${nameOrgRow}
        <div class="mt-4">${renderInputRow(emailField)}</div>
        ${renderProviderCheckbox()}
        <div class="pt-7">
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

// Render the header
export function header() {
  return `
  <header class="sticky top-0 z-50 w-full border-b border-navbar-line bg-navbar">
    <div class="mx-auto flex max-w-8xl items-center gap-x-4 px-4 py-3 sm:px-6 lg:px-8">
      <a href="/" class="flex shrink-0 items-center">
        <img src="/images/dbtsearch-logo.svg" alt="DBT Search" class="h-10 w-auto sm:h-16" />
      </a>
    </div>
  </header>
  `;
}

// Render the footer
export function footer() {
  const year = new Date().getFullYear();
  return `
  <footer class="border-t border-border py-6">
    <div class="mx-auto max-w-7xl px-4 pt-5 text-center sm:px-6 lg:px-8">
      <p class="mb-3 text-sm text-muted-foreground">
        <span class="font-semibold text-foreground">DBTsearch</span> is powered by
        <a href="https://www.tinytreecounseling.com/" target="_blank" rel="noopener noreferrer" class="text-primary underline decoration-1 hover:opacity-90">
          Tiny Tree Counseling &amp; Consulting
        </a>
      </p>
      <p class="mb-0 text-xs text-muted-foreground">
        Copyright &copy; ${year} DBTsearch.org. All rights reserved.
      </p>
    </div>
  </footer>
  `;
}

// Render the splash page with the given arguments
function withArgs(args) {
  return { ...defaultArgs, ...args };
}

const heroImageSrc = '/images/pexels-steve-1690351.jpg';

/** Default splash layout: image flush left (viewport edge), form + copy right. */
export function renderImageFlushLeft(args = {}) {
  const { heading, tagline, copy } = withArgs(args);
  return `
<div class="dark min-h-screen bg-background bg-texture-mesh text-foreground flex flex-col font-sans antialiased" data-theme="dbtsearch">
  ${header()}
  <div class="relative h-20 w-full shrink-0 md:hidden">
    <img src="${heroImageSrc}" alt="" class="h-full w-full object-cover object-center" />
    <div class="absolute inset-0 bg-background/50" aria-hidden="true"></div>
  </div>
  <main class="flex flex-1 flex-col md:flex-row min-h-0">
    <div class="relative hidden md:block w-1/2 min-w-0 shrink-0 order-2 md:order-1">
      <img src="${heroImageSrc}" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-background/40" aria-hidden="true"></div>
    </div>
    <div class="flex flex-1 items-center justify-center px-4 py-6 lg:py-10 sm:px-6 lg:px-8 order-1 md:order-2">
      <div class="w-full max-w-lg space-y-6">
        <div>
        <p class="my-3"><span class="mt-3 inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs border border-primary font-medium text-primary">${tagline}</span></p>
          <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-white my-5">${heading}</h1>
          <p class="lg:text-lg text-muted-foreground my-5">${copy}</p>
        </div>
        <ul class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-8">
          <li class="flex items-center gap-2">${icons.check}<span>DBT Certified only</span></li>
          <li class="flex items-center gap-2">${icons.mapPin}<span>Minnesota</span></li>
          <li class="flex items-center gap-2">${icons.lightning}<span>Updated regularly</span></li>
        </ul>
        ${formFields(args)}
      </div>
    </div>
  </main>
  ${footer()}
</div>
  `.trim();
}
