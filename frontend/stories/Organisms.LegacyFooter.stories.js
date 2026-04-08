import { renderDirectoryFooter } from './directoryKit.js';

export default {
  title: 'Organisms/Directory/Footer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Directory footer — same markup as `docs/reference-markup/providers.html` (`footer.bg-body`, attribution, copyright).',
      },
    },
  },
};

function frame(content) {
  return `
    <div class="finder-directory min-h-screen bg-body text-body d-flex flex-column" data-bs-theme="dark" data-theme="dbtsearch">
      <main class="container flex-grow-1 py-5">
        <p class="text-body-secondary small">Content above the footer…</p>
      </main>
      ${content}
    </div>
  `;
}

export const Default = {
  render: () => frame(renderDirectoryFooter()),
};
