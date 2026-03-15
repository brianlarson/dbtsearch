// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright config for frontend (Storybook) visual/spacing debugging.
 * Run Storybook first: npm run storybook
 * Then: npx playwright test [--debug] [--ui]
 */
module.exports = defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: {
    command: 'npm run storybook',
    url: 'http://localhost:6006',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
