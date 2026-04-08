import { renderDirectoryPageHeader } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/PageHeader',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Hero strip + title row — same structure as `docs/reference-markup/providers.html` (image column, H1 / H2, `hr`).',
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
    <div class="finder-directory min-h-screen bg-body text-body" data-bs-theme="dark" data-theme="dbtsearch">
      ${content}
    </div>
  `;
}

export const Default = {
  render: (args) => frame(renderDirectoryPageHeader(args)),
  args: {
    pageHeading: 'Providers',
    pageSubheading: 'DBT Providers in Minnesota',
  },
};
