import { renderDirectoryFilters } from './directoryKit.js';

export default {
  title: 'Molecules/Directory Filters',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Filter bar molecule for the directory page. Includes availability toggle, result count, and provider search.',
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
    <div class="dark min-h-screen bg-background text-foreground p-8" data-theme="dbtsearch">
      <div class="mx-auto max-w-5xl">
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
