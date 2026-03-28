import { renderLegacyHeader } from './directoryKit.js';

export default {
  title: 'Organisms/Legacy Header',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Legacy-inspired global header chrome: logo, nav links, mobile toggle, and contact/login action buttons.',
      },
    },
  },
};

function frame(content) {
  return `
    <div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
      ${content}
      <main class="mx-auto max-w-6xl px-4 py-8 text-slate-300 sm:px-6 lg:px-8">
        Header preview canvas
      </main>
    </div>
  `;
}

export const Default = {
  render: () => frame(renderLegacyHeader()),
};
