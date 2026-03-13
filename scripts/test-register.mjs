#!/usr/bin/env node
/**
 * Quick Playwright smoke test for registration + login.
 *
 * Prereqs:
 * - Server running (npm run server)
 * - Client running (npm run client, default http://localhost:5173)
 * - One-time: npx playwright install chromium
 *
 * Usage:
 *   node scripts/test-register.mjs
 *   BASE_URL=http://localhost:5175 node scripts/test-register.mjs
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const username = `playwright_user_${Date.now()}`;
const password = "test123!";

console.log(`Base URL: ${BASE_URL}`);
console.log(`Trying to register username: ${username}`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // Go to register page
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle", timeout: 20000 });

  // Fill the form
  await page.fill("#username", username);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');

  // Give the app a moment to POST /api/user/register and then /api/user/login
  await page.waitForTimeout(1500);

  // Check header for "Admin" button, which only appears when user.id is set
  const headerText = await page.textContent("header");

  if (headerText && headerText.includes("Admin")) {
    console.log("✅ Registration + login appears to have succeeded; 'Admin' is visible in header.");
    process.exitCode = 0;
  } else {
    console.log("⚠️ Registration flow ran, but 'Admin' is not visible in header.");
    console.log("   - Check server logs for /api/user/register or /api/user/login errors.");
    process.exitCode = 1;
  }
} catch (err) {
  console.error("❌ Playwright registration test failed:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}

