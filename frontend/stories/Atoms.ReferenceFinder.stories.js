import {
  renderFinderBadgesSample,
  renderFinderButtonsSample,
  renderFinderFormsSample,
  renderFinderLinksSample,
  renderFinderTypographySample,
} from './referenceAtomsKit.js';

export default {
  title: 'Atoms/Reference/Finder',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Bootstrap/Finder atoms aligned with `docs/reference-markup/*.html` (typography, buttons, forms, badges). Renders inside `.finder-directory` with theme CSS from Storybook preview.',
      },
    },
  },
};

function frame(innerHtml) {
  return `
<div class="finder-directory min-h-screen bg-body text-body" data-bs-theme="dark" data-theme="dbtsearch">
  ${innerHtml}
</div>`;
}

export const Typography = {
  render: () => frame(renderFinderTypographySample()),
};

export const Buttons = {
  render: () => frame(renderFinderButtonsSample()),
};

export const Forms = {
  render: () => frame(renderFinderFormsSample()),
};

export const Badges = {
  render: () => frame(renderFinderBadgesSample()),
};

export const Links = {
  render: () => frame(renderFinderLinksSample()),
};
