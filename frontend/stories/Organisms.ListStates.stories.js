import { renderListState } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/PageStates',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Loading / error / empty affordances using Bootstrap alerts and spinner.',
      },
    },
  },
};

function frame(state) {
  return `
    <div class="finder-directory min-h-screen bg-body text-body p-4" data-bs-theme="dark" data-theme="dbtsearch">
      <div class="container">${renderListState({ state })}</div>
    </div>
  `;
}

export const Loading = {
  render: () => frame('loading'),
};

export const Error = {
  render: () => frame('error'),
};

export const Empty = {
  render: () => frame('empty'),
};
