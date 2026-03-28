import { renderLegacyFooter } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/LegacyFooter',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          [
            'Legacy-style footer organism used in directory page frame: Tiny Tree attribution and copyright.',
            '',
            'Legacy source references:',
            '- src/components/Footer/Footer.jsx',
            '- docs/reference-markup/admin-edit.html (footer block)',
          ].join('\n'),
      },
    },
  },
};

function frame(content) {
  return `
    <div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
      <main class="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
          Footer preview anchor region
        </div>
      </main>
      ${content}
    </div>
  `;
}

export const Default = {
  render: () => frame(renderLegacyFooter()),
};
