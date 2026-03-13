#!/usr/bin/env node
/**
 * TT-14: Capture legacy page markup for Tailwind/Vue reference.
 * Run on main with client already running: VITE_CAPTURE_MARKUP=true npm run client
 * Then: node scripts/capture-markup.mjs [baseURL]
 * Default baseURL: http://localhost:5173
 */
import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "docs", "reference-markup");
const BASE = process.argv[2] || "http://localhost:5173";

const ROUTES = [
  ["/", "home.html"],
  ["/providers", "providers.html"],
  ["/about", "about.html"],
  ["/faqs", "faqs.html"],
  ["/contact", "contact.html"],
  ["/register", "register.html"],
  ["/login", "login.html"],
  ["/admin", "admin.html"],
  ["/nonexistent", "404.html"],
];

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [path, file] of ROUTES) {
  const url = BASE + path;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
    // SPA: wait for React to render main content
    await page.locator("main.content-wrapper").waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
    // Give the SPA time to paint so we don't capture shell-only markup (~2KB)
    await delay(800);
    const html = await page.evaluate(() => document.documentElement.outerHTML);
    const outPath = join(OUT_DIR, file);
    await writeFile(outPath, html, "utf8");
    console.log("Saved:", file);
  } catch (err) {
    console.error(path, "->", file, err.message);
  }
}

await browser.close();
console.log("Done. Output in", OUT_DIR);
