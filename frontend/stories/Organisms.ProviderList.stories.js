import { renderProviderList, sampleProviders } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/ProviderList',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Provider list (`ul.vstack`) — matches `docs/reference-markup/providers.html` list wrapper.',
      },
    },
  },
};

function frame(content) {
  return `
    <div class="finder-directory min-h-screen bg-body text-body p-4" data-bs-theme="dark" data-theme="dbtsearch">
      <div class="container">
        ${content}
      </div>
    </div>
  `;
}

export const Populated = {
  render: () => frame(renderProviderList({ providers: sampleProviders })),
};

export const Empty = {
  render: () => frame(renderProviderList({ providers: [], empty: true })),
};
