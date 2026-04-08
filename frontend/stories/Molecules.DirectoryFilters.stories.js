import { renderDirectoryFilters } from './directoryKit.js';

export default {
  title: 'Molecules/Directory/DirectoryFilters',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Extended filter bar (availability + result count + search) for app/Storybook iteration — not present on the static `providers.html` capture, which only shows the availability switch.',
      },
    },
  },
  argTypes: {
    resultCount: { control: { type: 'number', min: 0, max: 500, step: 1 } },
    onlyAvailable: { control: 'boolean' },
    search: { control: 'text' },
  },
};

function renderStory(args) {
  return `
    <div class="finder-directory min-h-screen bg-body text-body p-4" data-bs-theme="dark" data-theme="dbtsearch">
      <div class="container">
        ${renderDirectoryFilters(args)}
      </div>
    </div>
  `;
}

export const Default = {
  render: (args) => renderStory(args),
  args: {
    resultCount: 24,
    onlyAvailable: true,
    search: '',
  },
};

export const Searching = {
  render: (args) => renderStory(args),
  args: {
    resultCount: 3,
    onlyAvailable: true,
    search: 'tiny',
  },
};
