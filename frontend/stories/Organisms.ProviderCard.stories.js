import { renderProviderCard, sampleProviders } from './directoryKit.js';

export default {
  title: 'Organisms/Provider Card',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Primary directory organism. Replicates legacy provider row structure with badges, contact CTAs, and last updated.',
      },
    },
  },
};

function wrap(content) {
  return `
    <div class="dark min-h-screen bg-background text-foreground p-8" data-theme="dbtsearch">
      <div class="mx-auto max-w-5xl">
        ${content}
      </div>
    </div>
  `;
}

export const Available = {
  render: () => wrap(renderProviderCard(sampleProviders[0])),
};

export const NoAvailability = {
  render: () => wrap(renderProviderCard(sampleProviders[1])),
};
