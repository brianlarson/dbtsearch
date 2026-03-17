import { renderTextInput } from './directoryKit.js';

export default {
  title: 'Atoms/Form Controls',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Directory form atoms using Preline/Tailwind tokens: search input, select, checkbox, and availability toggle pattern.',
      },
    },
  },
};

function renderFormControls() {
  return `
    <div class="dark min-h-screen bg-background text-foreground p-8" data-theme="dbtsearch">
      <div class="mx-auto max-w-3xl space-y-6 rounded-xl border border-layer-line bg-layer p-6">
        <h2 class="text-lg font-semibold">Form controls</h2>
        ${renderTextInput({
          id: 'search',
          label: 'Search by provider name',
          type: 'search',
          placeholder: 'Start typing a provider name...',
        })}
        ${renderTextInput({
          id: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'you@example.com',
        })}
        <div>
          <label for="provider-select" class="mb-1 block text-sm font-medium text-layer-foreground">Provider select</label>
          <select
            id="provider-select"
            class="block w-full rounded-lg border border-layer-line bg-layer px-3 py-2.5 pr-10 text-layer-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none [&>option]:bg-layer [&>option]:text-layer-foreground"
          >
            <option value="">Select a provider</option>
            <option value="1">Tiny Tree Counseling &amp; Consulting</option>
            <option value="2">Associated Clinic of Psychology</option>
          </select>
        </div>
        <label class="inline-flex items-center gap-2 text-sm text-layer-foreground">
          <input type="checkbox" checked class="rounded border-layer-line bg-layer text-primary focus:ring-primary" />
          <span>Only show providers with availability</span>
        </label>
      </div>
    </div>
  `;
}

export const Default = {
  render: () => renderFormControls(),
};
