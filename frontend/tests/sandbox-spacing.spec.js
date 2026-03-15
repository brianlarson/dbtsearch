// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Debug visual spacing: form controls, card, card title.
 * Measures computed padding, margin, gap and saves a report + screenshots.
 *
 * Prereq: Start Storybook (or let Playwright reuse it): npm run storybook
 *
 * Run:    npm run test:e2e
 *         or: npx playwright test tests/sandbox-spacing.spec.js
 * Debug:  npm run test:e2e:debug   (step through, inspect)
 * UI:     npm run test:e2e:ui      (interactive)
 *
 * Outputs:
 *   - test-results/sandbox-spacing-report.json  (all computed spacing)
 *   - test-results/sandbox-full.png             (full Storybook)
 *   - test-results/sandbox-form-section.png     (form controls)
 *   - test-results/sandbox-card-section.png     (card + title)
 */
const STORY_URL = '/?path=/story/sandbox--default';

test.describe('Sandbox spacing', () => {
  test('report spacing around form controls, card, and card title', async ({ page }) => {
    await page.goto(STORY_URL);
    // Wait for Storybook to render the story iframe and content
    const iframe = page.frameLocator('#storybook-preview-iframe');
    await iframe.locator('#sandbox-text').waitFor({ state: 'visible', timeout: 15000 });

    const report = await iframe.locator('body').evaluate(() => {
      const getSpacing = (el) => {
        if (!el) return null;
        const s = window.getComputedStyle(el);
        const px = (v) => (v ? parseFloat(v) : 0);
        return {
          paddingTop: px(s.paddingTop),
          paddingRight: px(s.paddingRight),
          paddingBottom: px(s.paddingBottom),
          paddingLeft: px(s.paddingLeft),
          marginTop: px(s.marginTop),
          marginRight: px(s.marginRight),
          marginBottom: px(s.marginBottom),
          marginLeft: px(s.marginLeft),
          gap: el instanceof HTMLElement && s.display === 'flex' ? px(s.gap) : undefined,
        };
      };

      const report = { formControls: [], card: null, cardTitle: null };

      // Form controls: label + input spacing
      const textInput = document.getElementById('sandbox-text');
      if (textInput) {
        const label = document.querySelector('label[for="sandbox-text"]');
        const wrap = textInput.closest('div');
        const section = textInput.closest('section');
        report.formControls.push({
          label: 'Text input',
          labelSpacing: label ? getSpacing(label) : null,
          inputSpacing: getSpacing(textInput),
          wrapperGap: wrap ? getSpacing(wrap) : null,
          sectionSpacing: section ? getSpacing(section) : null,
        });
      }

      const emailInput = document.getElementById('sandbox-email');
      if (emailInput) {
        const label = document.querySelector('label[for="sandbox-email"]');
        report.formControls.push({
          label: 'Email input',
          labelSpacing: label ? getSpacing(label) : null,
          inputSpacing: getSpacing(emailInput),
        });
      }

      // Card section and inner card + card title
      const cardHeading = Array.from(document.querySelectorAll('h2')).find((h) => h.textContent?.trim() === 'Card');
      if (cardHeading) {
        const cardSection = cardHeading.closest('section');
        const innerCard = cardSection?.querySelector('.rounded-xl.border.border-border');
        const cardTitle = innerCard?.querySelector('h3');
        report.card = {
          section: cardSection ? getSpacing(cardSection) : null,
          innerCard: innerCard ? getSpacing(innerCard) : null,
        };
        report.cardTitle = cardTitle ? getSpacing(cardTitle) : null;
      }

      return report;
    });

    // Log for debugging
    console.log('\n--- Sandbox spacing report ---\n');
    console.log(JSON.stringify(report, null, 2));
    console.log('\n--- Summary ---');
    if (report.formControls?.[0]) {
      const fc = report.formControls[0];
      console.log('Form: label marginBottom (expect 4px for mb-1):', fc.labelSpacing?.marginBottom);
      console.log('Form: input padding:', fc.inputSpacing?.paddingTop, fc.inputSpacing?.paddingBottom);
      console.log('Form: section padding:', fc.sectionSpacing?.paddingTop);
    }
    if (report.card) {
      console.log('Card section padding:', report.card.section?.paddingTop);
      console.log('Card inner padding:', report.card.innerCard?.paddingTop);
    }
    if (report.cardTitle) {
      console.log('Card title marginBottom (expect 8px for mb-2):', report.cardTitle.marginBottom);
    }

    // Save report to file for inspection
    const fs = require('fs');
    const path = require('path');
    const outDir = path.join(process.cwd(), 'test-results');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'sandbox-spacing-report.json'), JSON.stringify(report, null, 2));

    // Screenshot for visual debugging
    await page.screenshot({
      path: 'test-results/sandbox-full.png',
      fullPage: true,
    });

    // Screenshot of just the form + card column (iframe)
    const formSection = iframe.locator('section').filter({ has: iframe.locator('#sandbox-text') }).first();
    const cardSection = iframe.locator('section').filter({ has: iframe.locator('h2:has-text("Card")') }).first();
    await formSection.screenshot({ path: 'test-results/sandbox-form-section.png' });
    await cardSection.screenshot({ path: 'test-results/sandbox-card-section.png' });
  });
});
