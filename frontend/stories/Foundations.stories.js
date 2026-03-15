/**
 * Foundations — brand colors and typography.
 * Documents design tokens for DBT Search. Use as the single source for palette and type scale.
 */
export default {
  title: 'Foundations',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Brand colors and typography. Defined in themes/dbtsearch.css and Preline theme.',
      },
    },
  },
};

const brandColors = [
  { name: 'Primary', token: 'primary', hex: '#6b8ef9', usage: 'Buttons, links, focus (blue)' },
  { name: 'Primary foreground', token: 'primary-foreground', hex: '#0f172a', usage: 'Text on primary' },
  { name: 'Accent', token: 'accent', hex: '#b8860b', usage: 'Highlights, badges (brown mustard)' },
  { name: 'Accent foreground', token: 'accent-foreground', hex: '#0f172a', usage: 'Text on accent' },
  { name: 'Background', token: 'background', usage: 'Page background' },
  { name: 'Foreground', token: 'foreground', usage: 'Body and headings' },
  { name: 'Muted foreground', token: 'muted-foreground', usage: 'Secondary text' },
  { name: 'Layer', token: 'layer', usage: 'Cards, inputs' },
  { name: 'Layer line', token: 'layer-line', usage: 'Borders' },
  { name: 'Tertiary', token: 'tertiary', hex: '#9a4a42', usage: 'Alerts, tags, secondary emphasis (rust)' },
  { name: 'Tertiary foreground', token: 'tertiary-foreground', hex: '#fff', usage: 'Text on tertiary' },
];

const bluePalette = [
  { name: 'primary-50', class: 'bg-primary-50' },
  { name: 'primary-300', class: 'bg-primary-300' },
  { name: 'primary-500', class: 'bg-primary-500' },
  { name: 'primary-700', class: 'bg-primary-700' },
];
const goldPalette = [
  { name: 'accent-50', class: 'bg-accent-50' },
  { name: 'accent-300', class: 'bg-accent-300' },
  { name: 'accent-500', class: 'bg-accent-500' },
  { name: 'accent-700', class: 'bg-accent-700' },
];
const tertiaryPalette = [
  { name: 'tertiary-300', class: 'bg-tertiary-300' },
  { name: 'tertiary-500', class: 'bg-tertiary-500' },
  { name: 'tertiary-700', class: 'bg-tertiary-700' },
];
const textureOptions = [
  { name: 'None', class: '' },
  { name: 'Grain', class: 'bg-texture-grain' },
  { name: 'Mesh', class: 'bg-texture-mesh' },
  { name: 'Subtle', class: 'bg-texture-subtle' },
];

const typeScale = [
  { name: 'Page title', class: 'text-2xl font-bold sm:text-3xl', sample: 'Find DBT Providers' },
  { name: 'Tagline', class: 'text-base font-semibold text-accent', sample: 'Search for certified providers.' },
  { name: 'Form / section heading', class: 'text-xl font-semibold', sample: 'Get notified' },
  { name: 'Section heading', class: 'text-lg font-semibold', sample: 'Form controls' },
  { name: 'Card title', class: 'text-base font-semibold', sample: 'Card title' },
  { name: 'Body', class: 'text-sm', sample: 'Body text using muted-foreground.' },
  { name: 'Small / caption', class: 'text-xs text-muted-foreground', sample: 'Caption or hint' },
];

function renderFoundations() {
  return `
<div class="dark min-h-screen bg-background text-foreground" data-theme="dbtsearch">
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Foundations</h1>
    <p class="mt-1 text-muted-foreground">Blues, golds, texture, typography (Inter). Edit <code class="rounded bg-layer px-1 py-0.5 text-primary">themes/dbtsearch.css</code>.</p>

    <section class="mt-10">
      <h2 class="text-lg font-semibold text-foreground mb-2">Primary vs accent</h2>
      <p class="text-sm text-muted-foreground mb-4">Blue (primary) and brown mustard (accent) are distinct.</p>
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex flex-col gap-1">
          <div class="h-12 w-24 rounded-lg bg-primary" title="Primary"></div>
          <span class="text-xs text-muted-foreground">Primary (blue)</span>
        </div>
        <div class="flex flex-col gap-1">
          <div class="h-12 w-24 rounded-lg bg-accent" title="Accent"></div>
          <span class="text-xs text-muted-foreground">Accent (mustard)</span>
        </div>
      </div>
    </section>

    <section class="mt-8">
      <h2 class="text-lg font-semibold text-foreground mb-4">Blue & gold palettes</h2>
      <div class="flex gap-6 flex-wrap">
        <div>
          <p class="text-xs text-muted-foreground mb-2">Blues</p>
          <div class="flex gap-2">
            ${bluePalette.map((c) => `<div class="h-10 w-14 rounded border border-layer-line ${c.class}" title="${c.name}"></div>`).join('')}
          </div>
        </div>
        <div>
          <p class="text-xs text-muted-foreground mb-2">Golds</p>
          <div class="flex gap-2">
            ${goldPalette.map((c) => `<div class="h-10 w-14 rounded border border-layer-line ${c.class}" title="${c.name}"></div>`).join('')}
          </div>
        </div>
        <div>
          <p class="text-xs text-muted-foreground mb-2">Tertiary (rust)</p>
          <div class="flex gap-2">
            ${tertiaryPalette.map((c) => `<div class="h-10 w-14 rounded border border-layer-line ${c.class}" title="${c.name}"></div>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-lg font-semibold text-foreground mb-4">Background texture</h2>
      <p class="text-sm text-muted-foreground mb-4">Apply <code class="rounded bg-layer px-1 py-0.5 text-primary">bg-texture-grain</code>, <code class="rounded bg-layer px-1 py-0.5 text-primary">bg-texture-mesh</code>, or <code class="rounded bg-layer px-1 py-0.5 text-primary">bg-texture-subtle</code> to a wrapper.</p>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        ${textureOptions
          .map(
            (t) => `
          <div class="relative h-20 rounded-lg overflow-hidden border border-layer-line bg-background ${t.class}">
            <span class="relative z-10 text-xs font-medium text-foreground p-2 block">${t.name}</span>
          </div>`
          )
          .join('')}
      </div>
    </section>

    <section class="mt-10">
      <h2 class="text-lg font-semibold text-foreground mb-4">Brand colors</h2>
      <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        ${brandColors
          .map(
            (c) => `
          <div class="flex flex-col gap-1">
            <div
              class="h-14 w-full rounded-lg border border-layer-line"
              style="background-color: ${c.hex || 'var(--color-' + c.token + ')'};"
              title="${c.hex || c.token}"
            ></div>
            <p class="text-xs font-medium text-foreground">${c.name}</p>
            ${c.hex ? `<p class="text-xs text-muted-foreground font-mono">${c.hex}</p>` : `<p class="text-xs text-muted-foreground font-mono">var(--${c.token})</p>`}
            <p class="text-xs text-muted-foreground">${c.usage}</p>
          </div>
        `
          )
          .join('')}
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-lg font-semibold text-foreground mb-4">Typography</h2>
      <p class="text-sm text-muted-foreground mb-4">Inter (modern sans serif). Use <code class="rounded bg-layer px-1 py-0.5 text-primary">text-foreground</code>, <code class="rounded bg-layer px-1 py-0.5 text-primary">text-muted-foreground</code>.</p>
      <div class="space-y-3 max-w-xl">
        ${typeScale
          .map(
            (t) => `
        <div class="border-b border-border pb-3">
          <p class="text-xs text-muted-foreground mb-1">${t.name} — <code class="rounded bg-layer px-1 py-0.5 text-primary">${t.class}</code></p>
          <p class="${t.class} text-foreground">${t.sample}</p>
        </div>`
          )
          .join('')}
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-lg font-semibold text-foreground mb-4">Accent sample</h2>
      <div class="flex flex-wrap gap-3">
        <span class="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">Accent badge</span>
        <button type="button" class="rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-accent focus:outline-none">Accent outline</button>
        <span class="inline-flex items-center rounded-full bg-tertiary-500 px-3 py-1 text-xs font-medium text-white">Tertiary (rust)</span>
      </div>
    </section>
  </div>
</div>
  `.trim();
}

export const Default = {
  render: () => renderFoundations(),
};
