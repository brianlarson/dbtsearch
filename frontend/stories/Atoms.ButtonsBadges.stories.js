import { renderActionLink, renderBadge, renderButton } from './directoryKit.js';

export default {
  title: 'Atoms/Directory/ButtonsBadges',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Core interactive atoms for directory MVP: button variants and status badges (availability/certification).',
      },
    },
  },
};

function renderAtoms() {
  return `
    <div class="dark min-h-screen bg-slate-950 text-white p-8" data-theme="dbtsearch">
      <div class="mx-auto max-w-5xl space-y-8">
        <section class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 class="mb-4 text-lg font-semibold">Buttons</h2>
          <div class="flex flex-wrap gap-3">
            ${renderButton({ label: 'Primary', variant: 'primary' })}
            ${renderButton({ label: 'Retry', variant: 'retry' })}
            ${renderActionLink({ label: 'Website' })}
          </div>
        </section>

        <section class="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 class="mb-4 text-lg font-semibold">Badges</h2>
          <div class="flex flex-wrap gap-2">
            ${renderBadge({ label: 'Availability', tone: 'success' })}
            ${renderBadge({ label: 'No Availability', tone: 'neutral' })}
            ${renderBadge({ label: 'DBT-A Certified', tone: 'info' })}
          </div>
        </section>
      </div>
    </div>
  `;
}

export const Default = {
  render: () => renderAtoms(),
};
