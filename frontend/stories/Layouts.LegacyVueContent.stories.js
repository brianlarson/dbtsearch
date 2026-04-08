import {
  renderLegacyVueContentLayout,
  renderLegacyVueFooter,
  renderLegacyVueHeader,
  renderLegacyVuePageHeader,
} from './legacyVueLayoutKit.js';

export default {
  title: 'Layouts/Vue/LegacyContent',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tailwind shell matching `app/src/components/directory/LegacyContentLayout.vue`: `LegacyHeader` + `LegacyPageHeader` + `max-w-3xl` main column + `LegacyFooter`. Parity surface for the Vue app; reference Bootstrap/Finder pages live under **Pages/Reference Screens**.',
      },
    },
  },
};

function mount(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

export const About = {
  render: () =>
    mount(
      renderLegacyVueContentLayout({
        pageHeading: 'About',
        pageSubheading: 'DBT provider availability in Minnesota',
        mainHtml: `
<p class="mb-4">DBTsearch is a website that allows clinicians and prospective clients to search for certified DBT providers in Minnesota…</p>
<p class="mb-4 text-slate-400">(Full copy matches <code class="rounded bg-slate-800 px-1 py-0.5 text-xs text-sky-300">AboutPageView.vue</code>.)</p>
<a href="#" class="mt-2 inline-flex items-center rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:opacity-90">Find DBT Providers →</a>`,
      }),
    ),
};

export const Contact = {
  render: () =>
    mount(
      renderLegacyVueContentLayout({
        pageHeading: 'Contact',
        omitSubheading: true,
        mainHtml: '<p class="text-slate-400">Coming soon…</p>',
      }),
    ),
};

export const Login = {
  render: () =>
    mount(
      renderLegacyVueContentLayout({
        pageHeading: 'Provider Login',
        pageSubheading: 'Manage Listings',
        mainHtml: `
<form class="max-w-xl space-y-4" onsubmit="return false">
  <div>
    <label for="sb-vue-login-user" class="mb-2 block text-sm font-medium text-slate-200">Username</label>
    <input id="sb-vue-login-user" type="text" class="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-base text-white" autocomplete="off" />
  </div>
  <div>
    <label for="sb-vue-login-pass" class="mb-2 block text-sm font-medium text-slate-200">Password</label>
    <input id="sb-vue-login-pass" type="password" class="w-full rounded-lg border border-slate-600 bg-slate-900/80 px-4 py-3 text-base text-white" autocomplete="off" />
  </div>
  <div class="pt-2">
    <button type="button" class="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:opacity-90">Log In</button>
  </div>
</form>`,
      }),
    ),
};

/** Optional: compose pieces for Chromatic / visual diffs without full page */
export const ChromeOnlyHeaderAndPageHeader = {
  render: () =>
    mount(
      `<div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
        ${renderLegacyVueHeader()}
        ${renderLegacyVuePageHeader({ pageHeading: 'Providers', pageSubheading: 'DBT Providers in Minnesota' })}
        ${renderLegacyVueFooter()}
      </div>`,
    ),
};
