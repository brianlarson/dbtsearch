/**
 * Directory UI kit for Storybook — DOM aligned to `docs/reference-markup/providers.html`
 * (Finder / Bootstrap markup + classes).
 */

import {
  directoryIconGlobe,
  directoryIconHeartPlaceholder,
  directoryIconMail,
} from './directoryIcons.js';

export const sampleProviders = [
  {
    id: '1',
    name: 'Meridian Behavioral Health',
    availability: true,
    dbtaCertified: true,
    address: '123 Example St',
    city: 'Minneapolis',
    state: 'MN',
    zip: '55401',
    phone: '612-555-0100',
    website: 'https://example.org',
    email: 'hello@example.org',
    updatedAt: '2026-03-15T00:00:00.000Z',
    image: 'meridian-behavioral-health.svg',
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
    image: '',
  },
];

/**
 * Global header — same structure as reference capture (navbar + offcanvas).
 * @param {{ loggedIn?: boolean, activeNav?: 'providers'|'about'|'faqs'|null, contactActive?: boolean, loginActive?: boolean }} [opts]
 */
export function renderDirectoryHeader({
  loggedIn = false,
  activeNav = 'providers',
  contactActive = false,
  loginActive = false,
} = {}) {
  const nav = (key, href, label) => {
    const on = activeNav === key;
    return `<li class="nav-item py-lg-2 me-lg-n2 me-xl-0">
      <a class="nav-link${on ? ' active' : ''}" href="${href}"${on ? ' aria-current="page"' : ''}>${label}</a>
    </li>`;
  };

  const loginOrAdmin = loggedIn
    ? `<a class="btn btn-secondary fw-semibold d-inline-flex align-items-center gap-2" href="/admin">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0v4m-5 9h6a2 2 0 002-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2z" />
        </svg>
        Admin
      </a>`
    : `<a class="btn btn-secondary fw-semibold${loginActive ? ' active' : ''}" href="/login"${loginActive ? ' aria-current="page"' : ''}>Login</a>`;

  return `
<header class="navbar navbar-expand-lg bg-body navbar-sticky sticky-top z-fixed px-0" data-sticky-element="true">
  <div class="container">
    <button type="button" class="navbar-toggler me-3 me-lg-0" data-bs-toggle="offcanvas" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <a class="navbar-brand py-1 py-md-2 py-xl-1 me-2 me-sm-n4 me-md-n5 me-lg-0" href="/">
      <span class="d-flex flex-shrink-0 text-secondary rtl-flip me-2">
        <img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="d-md-none" style="max-width: 170px" width="170" height="40" />
        <img src="/images/dbtsearch-logo.svg" alt="DBTsearch" class="d-none d-md-block" style="max-width: 280px" width="280" height="48" />
      </span>
      <div class="visually-hidden">DBTsearch</div>
    </a>
    <nav class="offcanvas offcanvas-start" id="navbarNav" tabindex="-1" aria-labelledby="navbarNavLabel">
      <div class="offcanvas-header py-3">
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body pt-2 pb-4 py-lg-0 mx-lg-auto">
        <ul class="navbar-nav position-relative">
          ${nav('providers', '/providers', 'Providers')}
          ${nav('about', '/about', 'About')}
          ${nav('faqs', '/faqs', 'FAQs')}
        </ul>
      </div>
    </nav>
    <div class="d-flex gap-sm-1">
      <a class="btn btn-outline-secondary me-2 d-none d-md-inline${contactActive ? ' active' : ''}" href="/contact"${contactActive ? ' aria-current="page"' : ''}>Contact</a>
      ${loginOrAdmin}
    </div>
  </div>
</header>`;
}

/**
 * @param {{ pageHeading?: string, pageSubheading?: string | null, omitSubheading?: boolean }} [opts]
 * Set `omitSubheading: true` for captures that only show H1 (e.g. Contact, Logout).
 */
export function renderDirectoryPageHeader({
  pageHeading = 'Providers',
  pageSubheading = 'DBT Providers in Minnesota',
  omitSubheading = false,
} = {}) {
  const showSub = !omitSubheading && pageSubheading != null && String(pageSubheading).trim() !== '';
  const subBlock = showSub
    ? `<div class="col-md-6 row mx-0 pb-1 align-items-end justify-content-end px-0">
        <h2 class="h5 text-secondary fw-medium m-0 text-md-end">${escapeHtml(pageSubheading)}</h2>
      </div>`
    : '';
  const titleCol = showSub ? 'col-md-6' : 'col-12';

  return `
<div class="position-relative bg-dark py-5" aria-hidden="true">
  <div class="container position-relative z-2 py-2 py-sm-1"></div>
  <div class="row position-absolute top-0 end-0 w-100 h-100 justify-content-end g-0">
    <div class="col-md-6 position-relative">
      <img src="/images/pexels-hero-1440.webp" class="position-absolute top-0 end-0 w-100 h-100 object-fit-cover" alt="" />
    </div>
    <div class="position-absolute top-0 start-0 w-100 h-100 bg-black z-1 opacity-50 d-md-none"></div>
  </div>
</div>
<div class="container my-4 my-md-5">
  <div class="row justify-content-center">
    <div class="col-lg-11 col-xl-10 col-xxl-9">
      <div class="row">
        <div class="${titleCol} pb-1">
          <h1 class="h1 m-0">${escapeHtml(pageHeading)}</h1>
        </div>
        ${subBlock}
      </div>
      <hr class="mt-0" />
    </div>
  </div>
</div>`;
}

export function renderDirectoryFooter() {
  const year = new Date().getFullYear();
  return `
<footer class="footer bg-body border-top my-5">
  <div class="container pt-5">
    <p class="text-center fw-thin fs-6 mb-3">
      <span class="fw-bold">DBTsearch</span> is powered by
      <a href="https://www.tinytreecounseling.com/" class="text-brand" target="_blank" rel="noopener noreferrer" style="text-decoration-thickness: 1px">Tiny Tree Counseling &amp; Consulting</a>
    </p>
    <p class="text-body-secondary fs-sm text-center mb-0">Copyright &copy; ${year} DBTsearch.org. All rights reserved.</p>
  </div>
</footer>`;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

/** Reference: Bootstrap form-switch only (`providers.html`). */
export function renderAvailabilitySwitch({ checked = true, id = 'availability-input' } = {}) {
  return `
<div class="form-check form-switch pb-2 mb-lg-4">
  <input type="checkbox" class="form-check-input" role="switch" id="${id}" ${checked ? 'checked' : ''} />
  <label for="${id}" class="form-check-label ms-1">Only show providers with availability</label>
</div>`;
}

/**
 * Extended filters (search + count) for molecule stories — not in static `providers.html` capture.
 */
export function renderDirectoryFilters({ resultCount = 24, onlyAvailable = true, search = '' } = {}) {
  const safeSearch = escapeHtml(search);
  return `
<div class="pb-2 mb-lg-4">
  ${renderAvailabilitySwitch({ checked: onlyAvailable })}
  <div class="row g-3 align-items-end">
    <div class="col-auto ms-auto">
      <span class="text-body-secondary fs-sm">Results: <strong>${resultCount}</strong></span>
    </div>
    <div class="col-12">
      <label for="provider-search" class="form-label">Search by provider name</label>
      <input id="provider-search" type="search" class="form-control" placeholder="Start typing a provider name..." value="${safeSearch}" autocomplete="off" />
    </div>
  </div>
</div>`;
}

/** Empty list + load error — same bordered panel as reference empty state. */
function renderProviderListNoticePanel({
  title,
  detail = '',
  buttonLabel,
  role = '',
} = {}) {
  const roleAttr = role ? ` role="${escapeHtml(role)}"` : '';
  const titleClass = detail ? 'mb-2 text-body-secondary' : 'mb-4 text-body-secondary';
  const detailBlock = detail
    ? `<p class="mb-4 small text-body-secondary text-break">${escapeHtml(detail)}</p>`
    : '';
  return `
<div class="text-center py-5 px-4 border rounded-3 bg-body-tertiary"${roleAttr}>
  <p class="${titleClass}">${escapeHtml(title)}</p>
  ${detailBlock}
  <button type="button" class="btn btn-primary">${escapeHtml(buttonLabel)}</button>
</div>`;
}

function renderProviderListItem(provider) {
  const addr = `${provider.address} ${provider.city}, ${provider.state} ${provider.zip}`;
  const availabilityBadge = provider.availability
    ? '<div class="mr-4"><span class="badge fs-sm text-success border border-success">Availability</span></div>'
    : '<div class="mr-4"><span class="badge fs-sm text-secondary border border-secondary">No Availability</span></div>';
  const dbtaBadge = provider.dbtaCertified
    ? '<div class="mr-4"><span class="badge fs-sm text-info border border-info">DBT-A Certified</span></div>'
    : '';

  const logoCol = provider.image
    ? `<div class="position-relative d-flex h-100 provider-card-logo-well bg-white" style="min-height:174px">
        <img src="/images/logos/${escapeHtml(provider.image)}" class="position-absolute top-0 start-0 w-100 h-100 object-fit-contain px-4 py-4" alt="${escapeHtml(provider.name)} logo" />
        <div class="ratio d-none d-sm-block" style="--bs-aspect-ratio:75%"></div>
        <div class="ratio ratio-16x9 d-sm-none"></div>
      </div>`
    : `<div class="position-relative d-flex h-100 provider-card-logo-well bg-dark-subtle" style="min-height:174px">
        <div class="w-100 d-flex align-items-center justify-content-center mb-0" aria-hidden="true">
          ${directoryIconHeartPlaceholder()}
        </div>
      </div>`;

  const websiteBtn = provider.website
    ? `<a href="${escapeHtml(provider.website)}" class="btn btn-outline-secondary d-inline-flex align-items-center" target="_blank" rel="noopener" title="Visit ${escapeHtml(provider.website)}">
        ${directoryIconGlobe()}Website
      </a>`
    : '';

  const mailQuery = 'subject=Inquiry%20from%20DBTsearch.org';
  const emailBtn = provider.email
    ? `<a href="mailto:${encodeURIComponent(provider.email)}?${mailQuery}" class="btn btn-outline-secondary d-inline-flex align-items-center">
        ${directoryIconMail()}Email
      </a>`
    : '';

  const phoneDigits = String(provider.phone || '').replace(/\D/g, '');
  const phoneLink = provider.phone
    ? `<a href="tel:${phoneDigits}" class="text-primary fs-base text-light border-bottom-0">${escapeHtml(provider.phone)}</a>`
    : '';

  return `
<li class="d-sm-flex align-items-center">
  <article class="card w-100">
    <div class="row g-0">
      <div class="col-sm-4 col-md-3 rounded overflow-hidden pb-2 pb-sm-0 pe-sm-3">
        ${logoCol}
      </div>
      <div class="col-sm-8 col-md-9 align-self-center">
        <div class="card-body d-flex justify-content-between p-4 py-sm-5 ps-sm-3 ps-md-4 pe-md-5 mt-n1 mt-sm-0">
          <div class="position-relative pe-4">
            <div class="d-flex gap-2 align-items-center mb-4">
              ${availabilityBadge}
              ${dbtaBadge}
            </div>
            <div class="h3 mb-1 text-brand">${escapeHtml(provider.name)}</div>
            <div class="d-block fs-md text-body text-decoration-none mb-3">${escapeHtml(addr)}</div>
            <div class="mb-0">${phoneLink}</div>
          </div>
          <div class="text-end">
            <div class="text-body-secondary mb-3 --font-monospace">
              <span class="fs-xs">Last updated</span><br />
              <span class="fs-sm text-info fw-semibold">${formatUpdatedAt(provider.updatedAt)}</span>
            </div>
            <div class="d-flex flex-column justify-content-end gap-3 mb-3">
              ${websiteBtn}
              ${emailBtn}
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</li>`;
}

export function renderProviderList({ providers = sampleProviders, empty = false } = {}) {
  if (empty || providers.length === 0) {
    return renderProviderListNoticePanel({
      title: 'No providers match your current filters.',
      buttonLabel: 'Reset filters',
    });
  }

  return `
<ul class="provider-card-stack px-0">
  ${providers.map((p) => renderProviderListItem(p)).join('')}
</ul>`;
}

/** Single list item (`<li>…</li>`) — use inside `<ul class="provider-card-stack px-0">` for organism stories. */
export function renderProviderCard(provider = sampleProviders[0]) {
  return renderProviderListItem(provider);
}

export function renderButton({ label = 'Button', variant = 'primary' }) {
  if (variant === 'retry') {
    return `<button type="button" class="btn btn-outline-danger">${escapeHtml(label)}</button>`;
  }
  return `<button type="button" class="btn btn-primary">${escapeHtml(label)}</button>`;
}

export function renderBadge({ label, tone = 'neutral' }) {
  const cls =
    tone === 'success'
      ? 'text-success border-success'
      : tone === 'info'
        ? 'text-info border-info'
        : 'text-secondary border-secondary';
  return `<span class="badge fs-sm border ${cls}">${escapeHtml(label)}</span>`;
}

export function renderActionLink({ label, href = '#' }) {
  return `<a class="btn btn-outline-secondary" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

export function renderTextInput({ id = 'text', label = 'Label', placeholder = '', type = 'text', value = '' } = {}) {
  return `
<div class="mb-3">
  <label for="${id}" class="form-label">${escapeHtml(label)}</label>
  <input id="${id}" type="${type}" class="form-control" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" />
</div>`;
}

export function renderListState({ state = 'loading' } = {}) {
  if (state === 'loading') {
    return `
<div class="d-flex align-items-center gap-3 py-5 text-body-secondary">
  <div class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
  <span>Loading providers…</span>
</div>`;
  }
  if (state === 'error') {
    return renderProviderListNoticePanel({
      title: 'Failed to load providers.',
      detail: 'Please try again in a moment.',
      buttonLabel: 'Retry',
      role: 'alert',
    });
  }
  return renderProviderList({ providers: [], empty: true });
}

export function renderDirectoryPageFrame({
  providers = sampleProviders,
  onlyAvailable = true,
  isLoading = false,
  errorMessage = '',
} = {}) {
  const mainInner = isLoading
    ? renderListState({ state: 'loading' })
    : errorMessage
      ? renderProviderListNoticePanel({
          title: 'Failed to load providers.',
          detail: errorMessage,
          buttonLabel: 'Retry',
          role: 'alert',
        })
      : renderProviderList({ providers });

  const filtersBlock = renderAvailabilitySwitch({ checked: onlyAvailable });

  return `
<div class="finder-directory min-h-screen bg-body text-body" data-bs-theme="dark" data-theme="dbtsearch">
  ${renderDirectoryHeader()}
  <main class="content-wrapper">
    ${renderDirectoryPageHeader({
      pageHeading: 'Providers',
      pageSubheading: 'DBT Providers in Minnesota',
    })}
    <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div class="row justify-content-center">
        <div class="col-lg-11 col-xl-10 col-xxl-9">
          ${filtersBlock}
          ${mainInner}
        </div>
      </div>
    </div>
  </main>
  ${renderDirectoryFooter()}
</div>`;
}

/** @deprecated Use {@link renderDirectoryHeader} */
export const renderLegacyHeader = renderDirectoryHeader;
/** @deprecated Use {@link renderDirectoryPageHeader} */
export const renderLegacyPageHeader = renderDirectoryPageHeader;
/** @deprecated Use {@link renderDirectoryFooter} */
export const renderLegacyFooter = renderDirectoryFooter;
