import { renderProviderCard, sampleProviders } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/ProviderCard',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Single provider row — Bootstrap `card` + grid per `docs/reference-markup/providers.html` and `ProviderListItem.jsx`.',
      },
    },
  },
};

function wrap(content) {
  return `
    <div class="finder-directory min-h-screen bg-body text-body py-4" data-bs-theme="dark" data-theme="dbtsearch">
      <div class="container">
        <ul class="provider-card-stack px-0">
          ${content}
        </ul>
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
