import { renderDirectoryPageFrame, sampleProviders } from './directoryKit.js';

export default {
  title: 'Pages/DirectoryPageView',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Finder/Bootstrap markup aligned with `docs/reference-markup/providers.html` (same structure and classes as the captured React app). Vue app: `app/src/views/DirectoryPageView.vue`.',
      },
      source: {
        code: [
          'Reference:',
          '- docs/reference-markup/providers.html',
          '- src/components/ProviderListItem/ProviderListItem.jsx',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    onlyAvailable: { control: 'boolean' },
  },
};

function mountDirectoryPage(args) {
  const root = document.createElement('div');
  root.innerHTML = renderDirectoryPageFrame(args);
  return root;
}

export const Default = {
  render: (args) => mountDirectoryPage(args),
  args: {
    providers: sampleProviders,
    onlyAvailable: true,
    isLoading: false,
    errorMessage: '',
  },
};

export const Loading = {
  render: (args) => mountDirectoryPage(args),
  args: {
    providers: [],
    onlyAvailable: true,
    isLoading: true,
    errorMessage: '',
  },
};

export const Error = {
  render: (args) => mountDirectoryPage(args),
  args: {
    providers: [],
    onlyAvailable: true,
    isLoading: false,
    errorMessage: 'GraphQL request failed with HTTP 500',
  },
};

export const Empty = {
  render: (args) => mountDirectoryPage(args),
  args: {
    providers: [],
    onlyAvailable: true,
    isLoading: false,
    errorMessage: '',
  },
};
