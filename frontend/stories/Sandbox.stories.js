/**
 * Sandbox — Preline default elements with our theme (dbtsearch).
 * Reference for how buttons, forms, cards, etc. look with dark + primary #bbcefd.
 */
export default {
  title: 'Sandbox',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Preline components with DBT Search theme (dark, primary #bbcefd). Use as a reference when building new pages.',
      },
    },
  },
};

function renderSandbox() {
  return `
<div class="dark min-h-screen bg-background text-foreground flex flex-col" data-theme="dbtsearch">
  <!-- Preline navbar -->
  <header class="sticky top-0 z-50 w-full border-b border-navbar-line bg-navbar">
    <div class="mx-auto flex max-w-7xl items-center gap-x-4 px-4 py-3 sm:px-6 lg:px-8">
      <a href="/" class="flex shrink-0 items-center">
        <img src="/images/dbtsearch-logo.svg" alt="DBT Search" class="h-10 w-auto sm:h-12" />
      </a>
      <span class="text-sm text-muted-foreground">Sandbox</span>
    </div>
  </header>

  <!-- Main: Preline container + grid -->
  <main class="flex-1">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <!-- Page header -->
      <div class="mb-8 lg:mb-10">
        <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Sandbox</h1>
        <p class="mt-1 text-muted-foreground">Preline default elements with our theme. Structure uses Preline layout (container, grid, spacing).</p>
      </div>

      <!-- Two-column grid on lg -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <!-- Column 1: Buttons + Form controls -->
        <div class="space-y-6 lg:col-span-6 lg:space-y-8">
          <section class="rounded-xl border border-layer-line bg-layer p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Buttons</h2>
            <div class="flex flex-wrap gap-3">
              <button type="button" class="rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:opacity-90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background focus:outline-none">
                Primary
              </button>
              <button type="button" class="rounded-lg border border-layer-line bg-layer px-4 py-2.5 font-semibold text-layer-foreground hover:bg-layer-hover focus:ring-2 focus:ring-primary focus:outline-none">
                Secondary
              </button>
              <button type="button" class="rounded-lg border border-primary px-4 py-2.5 font-semibold text-primary hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:outline-none">
                Outline
              </button>
            </div>
          </section>

          <section class="rounded-xl border border-layer-line bg-layer p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Form controls</h2>
            <div class="space-y-4">
              <div>
                <label for="sandbox-text" class="mb-1 block text-sm font-medium text-layer-foreground">Text input</label>
                <input type="text" id="sandbox-text" placeholder="Placeholder"
                  class="block w-full rounded-lg border border-layer-line bg-layer px-3 py-2.5 text-layer-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label for="sandbox-email" class="mb-1 block text-sm font-medium text-layer-foreground">Email</label>
                <input type="email" id="sandbox-email" placeholder="you@example.com"
                  class="block w-full rounded-lg border border-layer-line bg-layer px-3 py-2.5 text-layer-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label for="sandbox-select" class="mb-1 block text-sm font-medium text-layer-foreground">Select</label>
                <select id="sandbox-select"
                  class="block w-full rounded-lg border border-layer-line bg-layer px-3 py-2.5 pr-10 text-layer-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none [&>option]:bg-layer [&>option]:text-layer-foreground">
                  <option value="">Choose...</option>
                  <option value="a">Option A</option>
                  <option value="b">Option B</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" id="sandbox-check" class="rounded border-layer-line bg-layer text-primary focus:ring-primary focus:ring-offset-0" />
                <label for="sandbox-check" class="text-sm text-layer-foreground">Checkbox</label>
              </div>
              <div class="flex gap-4">
                <div class="flex items-center gap-2">
                  <input type="radio" id="sandbox-r1" name="sandbox-radio" class="border-layer-line bg-layer text-primary focus:ring-primary focus:ring-offset-0" />
                  <label for="sandbox-r1" class="text-sm text-layer-foreground">Option 1</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="radio" id="sandbox-r2" name="sandbox-radio" class="border-layer-line bg-layer text-primary focus:ring-primary focus:ring-offset-0" />
                  <label for="sandbox-r2" class="text-sm text-layer-foreground">Option 2</label>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Column 2: Card, Alert, Badges, Typography -->
        <div class="space-y-6 lg:col-span-6 lg:space-y-8">
          <section class="rounded-xl border border-layer-line bg-layer p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Card</h2>
            <div class="rounded-xl border border-border bg-background p-5">
              <h3 class="text-base font-semibold text-layer-foreground mb-2">Card title</h3>
              <p class="text-sm text-muted-foreground mb-4">Card body using muted-foreground. Nested inside layout section.</p>
              <button type="button" class="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus:ring-2 focus:ring-primary focus:outline-none">
                Action
              </button>
            </div>
          </section>

          <section class="rounded-xl border border-layer-line bg-layer p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Alert</h2>
            <div class="rounded-lg border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-foreground">
              <p class="font-medium">Info</p>
              <p class="mt-1 text-muted-foreground">Alert with primary tint. Use for success/error variants.</p>
            </div>
          </section>

          <section class="rounded-xl border border-layer-line bg-layer p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Badges</h2>
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">Primary tag</span>
              <span class="inline-flex items-center rounded-full border border-layer-line bg-background px-3 py-1 text-xs font-medium text-layer-foreground">Neutral</span>
            </div>
          </section>

          <section class="rounded-xl border border-layer-line bg-layer p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Typography</h2>
            <div class="space-y-2 text-sm">
              <p class="text-foreground font-semibold">Foreground (heading)</p>
              <p class="text-muted-foreground">Muted foreground (secondary)</p>
              <p class="text-primary">Primary (accent)</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-border py-6">
    <div class="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
      <p>Sandbox — Preline layout + DBT Search theme</p>
    </div>
  </footer>
</div>
  `.trim();
}

export const Default = {
  render: () => renderSandbox(),
};
