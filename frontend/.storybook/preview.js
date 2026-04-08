import '../src/index.css';
/* Tailwind + data-theme stories (Foundations): readable foreground on dark */
import '../src/storybook-dbtsearch-tailwind.css';
/* Finder (Bootstrap) theme + icon font — matches docs/reference-markup/providers.html */
import '../../public/css/theme.min.css';
/* After Finder theme: lock dark tokens on directory wrapper (see file header). */
import '../src/finder-directory-scope.css';

/** @type { import('@storybook/html').Preview } */
const preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {},
    },
  },
};
export default preview;
