import tailwindcss from '@tailwindcss/vite';

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|mdx)'],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = viteConfig.plugins || [];
    viteConfig.plugins.push(tailwindcss());
    return viteConfig;
  },
};
export default config;
