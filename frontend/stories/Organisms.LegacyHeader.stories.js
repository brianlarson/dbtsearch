import { renderDirectoryHeader } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/Header',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Finder/Bootstrap navbar + offcanvas — same markup as `docs/reference-markup/providers.html`. Mobile menu uses `theme.min.js` (see `.storybook/preview-head.html`).',
      },
    },
  },
};

function frame(content) {
  return `
    <div class="finder-directory min-h-screen bg-body text-body" data-bs-theme="dark" data-theme="dbtsearch">
      ${content}
      <main class="container py-5">
        <p class="text-body-secondary small">Narrow the viewport to open the offcanvas menu (Bootstrap).</p>
      </main>
    </div>
  `;
}

export const Default = {
  render: () => frame(renderDirectoryHeader()),
};

export const LoggedIn = {
  render: () => frame(renderDirectoryHeader({ loggedIn: true })),
};
