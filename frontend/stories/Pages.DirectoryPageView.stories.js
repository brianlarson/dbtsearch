import { renderDirectoryPageFrame, sampleProviders } from './directoryKit.js';

export default {
  title: 'Pages/DirectoryPageView',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Direct page-level mirror of app/src/views/DirectoryPageView.vue with legacy-inspired header hero, logo, and footer chrome.',
      },
    },
  },
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
    resultCount: sampleProviders.length,
    onlyAvailable: true,
    search: '',
    isLoading: false,
    errorMessage: '',
  },
};

export const Loading = {
  render: (args) => renderDirectoryPageFrame(args),
  args: {
    providers: [],
    resultCount: 0,
    onlyAvailable: true,
    search: '',
    isLoading: true,
    errorMessage: '',
  },
};

export const Error = {
  render: (args) => renderDirectoryPageFrame(args),
  args: {
    providers: [],
    resultCount: 0,
    onlyAvailable: true,
    search: '',
    isLoading: false,
    errorMessage: 'GraphQL request failed with HTTP 500',
  },
};

export const Empty = {
  render: (args) => renderDirectoryPageFrame(args),
  args: {
    providers: [],
    resultCount: 0,
    onlyAvailable: true,
    search: 'no-match',
    isLoading: false,
    errorMessage: '',
  },
};
