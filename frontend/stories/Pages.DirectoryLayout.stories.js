import { renderDirectoryPageFrame, sampleProviders } from './directoryKit.js';

export default {
  title: 'Pages/Directory Layout',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    resultCount: { control: { type: 'number', min: 0, max: 500, step: 1 } },
    onlyAvailable: { control: 'boolean' },
    search: { control: 'text' },
  },
};

export const Default = {
  render: (args) => renderDirectoryPageFrame(args),
  args: {
    providers: sampleProviders,
    resultCount: 24,
    onlyAvailable: true,
    search: '',
  },
};

export const SearchAndFiltered = {
  render: (args) => renderDirectoryPageFrame(args),
  args: {
    providers: [sampleProviders[0]],
    resultCount: 1,
    onlyAvailable: true,
    search: 'tiny',
  },
};
