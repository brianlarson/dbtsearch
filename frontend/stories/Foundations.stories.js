/**
 * Foundations — directory (legacy) palette and type.
 * Splash page keeps its own look in Pages/Splash Page; directory UI follows
 * reference capture + themes/dbtsearch.css.
 */
export default {
  title: 'Foundations',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Core tokens for legacy directory parity. Brand `#bbcefd` matches `docs/reference-markup` (.text-brand). Primary scale is for UI chrome (buttons, focus); splash may use additional accents via its story.',
      },
    },
  },
};

const legacyTokens = [
  {
    name: 'Brand (links / attribution)',
    swatchClass: 'bg-[#bbcefd]',
    usage: 'Footer “Tiny Tree” link; legacy .text-brand',
  },
  {
    name: 'Background',
    swatchClass: 'bg-background',
    usage: 'Page surface (dark)',
  },
  {
    name: 'Foreground',
    swatchClass: 'bg-foreground',
    usage: 'Body text',
  },
  {
    name: 'Muted foreground',
    swatchClass: 'bg-muted-foreground',
    usage: 'Secondary labels (e.g. H2 under page title)',
  },
  {
    name: 'Primary',
    swatchClass: 'bg-primary',
    usage: 'CTAs, focus rings, provider name emphasis',
  },
];

const typeScale = [
  { name: 'Page title', class: 'text-3xl font-bold tracking-tight', sample: 'Providers' },
  { name: 'Subtitle', class: 'text-base font-medium text-slate-300', sample: 'DBT Providers in Minnesota' },
  { name: 'Body', class: 'text-sm text-slate-300', sample: 'Directory body copy.' },
  { name: 'Caption', class: 'text-xs text-muted-foreground', sample: 'Last updated · Mar 15, 2026' },
];

function renderFoundations() {
  return `
<div class="dark min-h-screen bg-background text-foreground" data-theme="dbtsearch">
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Foundations (directory)</h1>
    <p class="mt-1 text-muted-foreground">
      Aligned with <code class="rounded bg-layer px-1 py-0.5 text-primary">docs/reference-markup/*.html</code>
      and <code class="rounded bg-layer px-1 py-0.5 text-primary">themes/dbtsearch.css</code>.
      <span class="block mt-2 text-sm">Splash marketing page: see <strong>Pages / Splash Page</strong> — unchanged.</span>
    </p>

    <section class="mt-10">
      <h2 class="text-lg font-semibold text-foreground mb-4">Legacy-aligned tokens</h2>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        ${legacyTokens
          .map(
            (c) => `
          <div class="flex flex-col gap-1 rounded-lg border border-layer-line p-4">
            <div class="h-12 w-full rounded border border-layer-line ${c.swatchClass}"></div>
            <p class="text-sm font-medium text-foreground">${c.name}</p>
            <p class="text-xs text-muted-foreground">${c.usage}</p>
          </div>
        `,
          )
          .join('')}
      </div>
      <p class="mt-4 text-sm text-muted-foreground">
        Optional texture utilities (<code class="rounded bg-layer px-1 py-0.5 text-primary">bg-texture-grain</code>, etc.) remain in the theme for splash or marketing surfaces.
      </p>
    </section>

    <section class="mt-12">
      <h2 class="text-lg font-semibold text-foreground mb-4">Typography (directory)</h2>
      <p class="text-sm text-muted-foreground mb-4">Inter via global CSS; match reference hierarchy on listing pages.</p>
      <div class="space-y-3 max-w-xl">
        ${typeScale
          .map(
            (t) => `
        <div class="border-b border-border pb-3">
          <p class="text-xs text-muted-foreground mb-1">${t.name} — <code class="rounded bg-layer px-1 py-0.5 text-primary">${t.class}</code></p>
          <p class="${t.class} text-foreground">${t.sample}</p>
        </div>`,
          )
          .join('')}
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-lg font-semibold text-foreground mb-3">Brand link sample</h2>
      <p class="text-sm text-slate-300">
        <span class="font-semibold text-white">DBTsearch</span> is powered by
        <a href="#" class="text-brand" style="text-decoration-thickness: 1px;">Tiny Tree Counseling &amp; Consulting</a>
      </p>
    </section>
  </div>
</div>
  `.trim();
}

export const Default = {
  render: () => renderFoundations(),
};
