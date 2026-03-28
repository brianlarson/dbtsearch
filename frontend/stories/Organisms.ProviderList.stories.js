import { renderProviderList, sampleProviders } from './directoryKit.js';

export default {
  title: 'Organisms/Provider List',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Direct Storybook mirror of app/src/components/directory/ProviderList.vue including populated and empty states.',
      },
    },
  },
};

function frame(content) {
  return `
    <div class="dark min-h-screen bg-slate-950 text-white p-8" data-theme="dbtsearch">
      <div class="mx-auto max-w-6xl">
        <section class="mt-6">
          ${content}
        </section>
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
