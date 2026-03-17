import { renderListState } from './directoryKit.js';

export default {
  title: 'Organisms/List States',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'List-level states for directory MVP: loading, error, and empty. Keeps UX consistent before data wiring is finalized.',
      },
    },
  },
};

function frame(state) {
  return `
    <div class="dark min-h-screen bg-background text-foreground p-8" data-theme="dbtsearch">
      <div class="mx-auto max-w-4xl">
        ${renderListState({ state })}
      </div>
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
