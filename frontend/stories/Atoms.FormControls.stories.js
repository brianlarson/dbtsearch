import { renderTextInput } from './directoryKit.js';

export default {
  title: 'Atoms/Directory/FormControls',
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
    <div class="dark min-h-screen bg-slate-950 text-white p-8" data-theme="dbtsearch">
      <div class="mx-auto max-w-3xl space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
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
          <label for="provider-select" class="mb-1 block text-sm font-medium text-slate-300">Provider select</label>
          <select
            id="provider-select"
            class="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none [&>option]:text-slate-900"
          >
            <option value="">Select a provider</option>
            <option value="1">Tiny Tree Counseling &amp; Consulting</option>
            <option value="2">Associated Clinic of Psychology</option>
          </select>
        </div>
        <label class="inline-flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked class="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary" />
          <span>Only show providers with availability</span>
        </label>
      </div>
    </div>
  `;
}

export const Default = {
  render: () => renderFormControls(),
};
