#!/usr/bin/env node
/**
 * TT-14: Capture admin screens with real login (list + edit form).
 * Requires server AND client running (no VITE_CAPTURE_MARKUP). Uses real auth and API.
 *
 * Usage:
 *   CAPTURE_MARKUP_USER=tinytree CAPTURE_MARKUP_PASSWORD=yourpassword node scripts/capture-markup-auth.mjs [baseURL]
 *   Default baseURL: http://localhost:5173
 */
import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "docs", "reference-markup");
const BASE = process.argv[2] || "http://localhost:5173";
const USER = process.env.CAPTURE_MARKUP_USER;
const PASSWORD = process.env.CAPTURE_MARKUP_PASSWORD;

if (!USER || !PASSWORD) {
  console.error("Set CAPTURE_MARKUP_USER and CAPTURE_MARKUP_PASSWORD (e.g. tinytree / 0821)");
  process.exit(1);
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // 1. Login
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 15000 });
  await page.locator("main.content-wrapper").waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await delay(500);
  await page.fill("#username", USER);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  // Wait for admin: URL or "My Providers" / first Edit button
  await page.waitForURL(/\/admin/, { timeout: 10000 }).catch(() => {});
  await delay(1500);
  const listLoaded = await page.getByRole("button", { name: "Edit" }).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => null);
  if (!listLoaded) {
    console.warn("Admin list may be empty or slow; capturing anyway.");
  }
  await delay(500);

  // 2. Capture admin list (My Providers)
  const adminListHtml = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile(join(OUT_DIR, "admin.html"), adminListHtml, "utf8");
  console.log("Saved: admin.html (list with providers)");

  // 3. Open edit for first provider
  await page.getByRole("button", { name: "Edit" }).first().click();
  await page.locator('input[name="availability"]').waitFor({ state: "visible", timeout: 8000 });
  await delay(600);
  // Check "Has availability" if not already checked
  const checkbox = page.locator("#availability");
  const checked = await checkbox.isChecked();
  if (!checked) {
    await checkbox.check();
    await delay(300);
  }

  // 4. Capture admin edit form
  const adminEditHtml = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile(join(OUT_DIR, "admin-edit.html"), adminEditHtml, "utf8");
  console.log("Saved: admin-edit.html (edit form, availability checked)");

  // 5. Save and wait for list
  await page.getByRole("button", { name: "Save Changes" }).click();
  await page.getByRole("button", { name: "Edit" }).first().waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  await delay(400);

  // 6. Logout
  await page.getByRole("button", { name: "Logout" }).click();
  await page.waitForURL(/\/logout|\/login/, { timeout: 8000 }).catch(() => {});
  await delay(500);
  const loginHtml = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile(join(OUT_DIR, "login.html"), loginHtml, "utf8");
  console.log("Saved: login.html (after logout)");
} catch (err) {
  console.error("Capture failed:", err.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}

console.log("Done. Output in", OUT_DIR);
