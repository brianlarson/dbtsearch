import { renderLegacyPageHeader } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/LegacyPageHeader',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Legacy-inspired internal page hero/header strip with right-side image treatment and heading/subheading row. Source parity: src/components/PageHeader/PageHeader.jsx and docs/reference-markup/admin-edit.html.',
      },
    },
  },
  argTypes: {
    pageHeading: { control: 'text' },
    pageSubheading: { control: 'text' },
  },
};

function frame(content) {
  return `
    <div class="dark min-h-screen bg-slate-950 text-white" data-theme="dbtsearch">
      ${content}
    </div>
  `;
}

export const Default = {
  render: (args) => frame(renderLegacyPageHeader(args)),
  args: {
    pageHeading: 'Providers',
    pageSubheading: 'DBT Providers in Minnesota',
  },
};
