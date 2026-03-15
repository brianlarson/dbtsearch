/**
 * Splash page stories — thin layer: meta + story exports only.
 * Data and render functions live in splashPage.js (reusable, testable).
 */
import { defaultArgs, renderImageFlushLeft } from './splashPage.js';

export default {
  title: 'Pages/Splash Page',
  parameters: { layout: 'fullscreen' },
  argTypes: {
    heading: { control: 'text' },
    tagline: { control: 'text' },
    copy: { control: 'text' },
    formHeading: { control: 'text' },
    submitLabel: { control: 'text' },
  },
};

export const Default = {
  render: (args) => renderImageFlushLeft(args),
  args: defaultArgs,
};
