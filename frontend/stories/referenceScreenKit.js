/**
 * Full-page Finder layouts aligned to `docs/reference-markup/*.html` routes.
 */

import { directoryIconArrowRight } from './directoryIcons.js';
import { renderDirectoryFooter, renderDirectoryHeader, renderDirectoryPageHeader } from './directoryKit.js';

function wrapStandardContentPage({ header, title, mainHtml }) {
  return `
<div class="finder-directory min-h-screen bg-body text-body" data-bs-theme="dark" data-theme="dbtsearch">
  ${renderDirectoryHeader(header)}
  <main class="content-wrapper">
    ${renderDirectoryPageHeader(title)}
    <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div class="row justify-content-center">
        <div class="col-lg-11 col-xl-10 col-xxl-9 fs-5">
          <div class="row justify-content-start">
            <div class="col-md-8">
              ${mainHtml}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  ${renderDirectoryFooter()}
</div>`;
}

const ABOUT_BODY = `
<p>DBTsearch is a website that allows clinicians and prospective clients to search for certified DBT providers in Minnesota and more specifically, locate providers that have current availability. Dialectical Behavior Therapy (DBT) is a highly structured, empirically supported therapy that helps people learn to manage intense emotions and get behaviors under control. It is used to treat mental health conditions rooted in severe emotional and behavioral dysregulation often present in untreated Borderline Personality Disorder, Posttraumatic Stress Disorder, Bipolar Disorder, Major Depression, and more.</p>
<p>Frequently people in need of DBT are in crisis and are at high risk for suicide, and are often unable to tolerate the patience required to find available providers. Referring providers are busy and often do not have the time to call around in order to provide reliable referral information to clients. This is because the current process of finding an available provider is cumbersome and inefficient, combined with the reality of high demand and low access to certified DBT programs.</p>
<p>The Minnesota Department of Human Services offers a single page with a long list of certified DBT providers but the only way to discover availability is to go through the list and call or email each clinic. DBTsearch aims to ease the process of finding access to this treatment by offering a searchable list of DBT providers where those with current availability appear first. Clients get faster access to treatment, providers have more time, and treatment programs remain full: win-win-win!</p>
<a href="/providers" class="btn btn-lg btn-primary mt-3 d-inline-flex align-items-center">Find DBT Providers${directoryIconArrowRight()}</a>
`;

export function renderReferenceAboutPage() {
  return wrapStandardContentPage({
    header: { activeNav: 'about' },
    title: {
      pageHeading: 'About',
      pageSubheading: 'DBT provider availability in Minnesota',
    },
    mainHtml: ABOUT_BODY,
  });
}

export function renderReferenceContactPage() {
  return wrapStandardContentPage({
    header: { activeNav: null, contactActive: true },
    title: { pageHeading: 'Contact', omitSubheading: true },
    mainHtml: '<p>Coming soon…</p>',
  });
}

export function renderReferenceFaqsPage() {
  return wrapStandardContentPage({
    header: { activeNav: 'faqs' },
    title: {
      pageHeading: 'FAQs',
      pageSubheading: 'Frequently Asked DBT Questions',
    },
    mainHtml: '<p>Coming soon…</p>',
  });
}

export function renderReferenceLoginPage() {
  return wrapStandardContentPage({
    header: { activeNav: null, loginActive: true },
    title: {
      pageHeading: 'Provider Login',
      pageSubheading: 'Manage Listings',
    },
    mainHtml: `
<form class="form" onsubmit="return false">
  <div class="row gap-3">
    <div class="col-md-8">
      <label for="sb-login-user" class="form-label fs-base">Username</label>
      <input id="sb-login-user" type="text" class="form-control form-control-lg" required value="" />
    </div>
    <div class="col-md-8">
      <label for="sb-login-pass" class="form-label fs-base">Password</label>
      <input type="password" id="sb-login-pass" required class="form-control form-control-lg" value="" />
    </div>
    <div class="col-12 mt-3 mb-5">
      <button type="submit" class="btn btn-lg btn-primary px-4">Log In</button>
    </div>
  </div>
</form>`,
  });
}

export function renderReferenceRegisterPage() {
  return wrapStandardContentPage({
    header: { activeNav: null },
    title: {
      pageHeading: 'Register',
      pageSubheading: 'Add management users',
    },
    mainHtml: `
<form class="form" onsubmit="return false">
  <div class="row gap-3">
    <div class="col-md-8">
      <label for="sb-reg-user" class="form-label fs-base">Username</label>
      <input id="sb-reg-user" type="text" class="form-control form-control-lg" required value="" />
    </div>
    <div class="col-md-8">
      <label for="sb-reg-pass" class="form-label fs-base">Password</label>
      <input id="sb-reg-pass" type="password" class="form-control form-control-lg" required value="" />
    </div>
    <div class="col-12 mt-3 mb-5">
      <button type="submit" class="btn btn-lg btn-primary px-4">Register</button>
    </div>
  </div>
</form>`,
  });
}

export function renderReferenceLogoutPage() {
  return wrapStandardContentPage({
    header: { activeNav: null },
    title: { pageHeading: 'Thank you!', omitSubheading: true },
    mainHtml: `
<p class="fs-base">You are now logged out of the system.<br />
<a class="text-brand" href="/login">Click here</a> if you would like to login again.</p>`,
  });
}

export function renderReference404Page() {
  return wrapStandardContentPage({
    header: { activeNav: null },
    title: {
      pageHeading: 'Error 404',
      pageSubheading: 'Page Not Found',
    },
    mainHtml:
      '<p class="pb-5">The resource you\'re looking for doesn\'t exist, has been removed or no longer exists.</p>',
  });
}

/** Marketing home (`home.html`) — hero + CTA, distinct from inner page chrome. */
export function renderReferenceHomeMarketingPage() {
  return `
<div class="finder-directory min-h-screen bg-body text-body" data-bs-theme="dark" data-theme="dbtsearch">
  ${renderDirectoryHeader({ activeNav: null })}
  <main class="content-wrapper">
    <section class="position-relative bg-dark py-5">
      <div class="container position-relative z-2 py-2 py-sm-4">
        <div class="row py-md-2 py-lg-5 my-xxl-1">
          <div class="col-sm-8 col-md-5">
            <h2 class="display-6 pb-1 pb-sm-2" style="color: rgb(187, 206, 253)">Find certified DBT provider availibility in Minnesota</h2>
            <p class="fs-5">DBTsearch is a website that allows clinicians and prospective clients to search for certified DBT providers in Minnesota and more specifically, locate providers that have current availability.</p>
            <a href="/providers" class="btn btn-lg btn-primary mt-3 d-inline-flex align-items-center">Find DBT Providers${directoryIconArrowRight()}</a>
          </div>
        </div>
      </div>
      <div class="row position-absolute top-0 end-0 w-100 h-100 justify-content-end g-0">
        <div class="col-md-6 position-relative">
          <img src="/images/pexels-hero-1440.webp" class="position-absolute top-0 end-0 w-100 h-100 object-fit-cover" alt="" />
        </div>
        <div class="position-absolute top-0 start-0 w-100 h-100 bg-black z-1 opacity-50 d-md-none"></div>
      </div>
    </section>
  </main>
  ${renderDirectoryFooter()}
</div>`;
}

export function renderReferenceProvidersPageLink() {
  return wrapStandardContentPage({
    header: { activeNav: 'providers' },
    title: {
      pageHeading: 'Providers',
      pageSubheading: 'DBT Providers in Minnesota',
    },
    mainHtml:
      '<p class="mb-0">See <strong>Pages / DirectoryPageView</strong> for the full provider list story.</p>',
  });
}

const LOCK_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="fs-base me-2 align-text-bottom" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`;

/** `admin-edit.html` — logged-in header + Admin title + edit form shell. */
export function renderReferenceAdminEditPage() {
  return `
<div class="finder-directory min-h-screen bg-body text-body" data-bs-theme="dark" data-theme="dbtsearch">
  ${renderDirectoryHeader({ loggedIn: true })}
  <main class="content-wrapper">
    ${renderDirectoryPageHeader({
      pageHeading: 'Admin',
      pageSubheading: 'Provider Management',
    })}
    <div class="container mb-2 mb-md-3 mb-lg-4 mb-xl-5">
      <div class="row justify-content-center">
        <div class="col-lg-11 col-xl-10 col-xxl-9">
          <div class="pb-4 d-md-flex align-items-center justify-content-between w-100">
            <h1 class="h3 mb-2">Edit Provider</h1>
            <div class="mt-0 text-light-subtle mb-n1">
              <em>Logged in as tinytree</em>
              <button type="button" class="btn btn-sm btn-outline-secondary ms-3">${LOCK_ICON}Logout</button>
            </div>
          </div>
          <div class="vstack gap-5 px-0">
            <div class="list-group">
              <div class="list-group-item p-4">
                <div class="pe-4">
                  <h3 class="fs-5 mb-4 fw-semibold">Addictions and Stress Clinic dba ASC Psychological Services</h3>
                  <form class="form" onsubmit="return false">
                    <div class="row">
                      <div class="col-md-8 mb-3">
                        <label for="sb-admin-name" class="form-label">Name</label>
                        <input id="sb-admin-name" name="name" type="text" class="form-control w-full" value="Addictions and Stress Clinic dba ASC Psychological Services" />
                      </div>
                      <div class="col-md-8 mb-3">
                        <div class="form-check">
                          <input id="sb-admin-availability" name="availability" type="checkbox" class="form-check-input" />
                          <label class="form-check-label" for="sb-admin-availability">Has availability</label>
                        </div>
                      </div>
                      <div class="col-12 mb-3">
                        <div class="mt-4">
                          <button type="submit" class="btn btn-secondary d-inline me-3">Save Changes</button>
                          <button type="button" class="btn btn-outline-secondary d-inline me-3">Cancel</button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="my-5"></div>
          <div class="py-5"></div>
        </div>
      </div>
    </div>
  </main>
  ${renderDirectoryFooter()}
</div>`;
}
