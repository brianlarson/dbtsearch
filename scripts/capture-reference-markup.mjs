#!/usr/bin/env node
/**
 * Capture legacy React app HTML to docs/reference-markup/ for parity work.
 *
 * Usage:
 *   npm run capture:markup
 *     Starts Vite (npm run client), captures public routes + login + 404 + logout, rewrites /public/ → ../../public/
 *     for offline viewing. No database required.
 *
 *   CAPTURE_MARKUP_USER=tinytree CAPTURE_MARKUP_PASSWORD=secret npm run capture:markup
 *     Same, plus admin list + admin edit if login succeeds. Requires API: run `npm run server` (port 5001) with DB
 *     before this so /api/user/login works. Vite proxies /api → 5001.
 *
 * Env:
 *   CAPTURE_BASE_URL — default http://localhost:5173 (use localhost, not 127.0.0.1: Vite can 404 the latter)
 *   CAPTURE_MARKUP_USER / CAPTURE_MARKUP_PASSWORD — optional admin capture
 */
import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'docs', 'reference-markup');
const BASE = process.env.CAPTURE_BASE_URL || 'http://localhost:5173';
const USER = process.env.CAPTURE_MARKUP_USER;
const PASSWORD = process.env.CAPTURE_MARKUP_PASSWORD;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const PUBLIC_CAPTURES = [
  { path: '/', file: 'home.html' },
  { path: '/providers', file: 'providers.html' },
  { path: '/about', file: 'about.html' },
  { path: '/faqs', file: 'faqs.html' },
  { path: '/contact', file: 'contact.html' },
  { path: '/register', file: 'register.html' },
  { path: '/login', file: 'login.html' },
  { path: '/logout', file: 'logout.html' },
  { path: '/this-route-should-not-exist-404', file: '404.html' },
];

function rewriteHtmlForDocs(html) {
  let out = html;
  out = out.replace(/<script type="module">[\s\S]*?injectIntoGlobalHook[\s\S]*?<\/script>\s*/gi, '');
  out = out.replace(/<script type="module" src="\/@vite\/client"><\/script>\s*/gi, '');
  out = out.replace(/<script type="module" src="\/src\/[^"]+"><\/script>\s*/gi, '');
  out = out.replace(/\sdata-vite-dev-id="[^"]*"/g, '');
  out = out.replace(/href="\/public\//g, 'href="../../public/');
  out = out.replace(/src="\/public\//g, 'src="../../public/');
  const t = out.trim();
  if (!/^<!DOCTYPE/i.test(t)) {
    out = `<!DOCTYPE html>\n<!-- Reference capture — see docs/CAPTURE-MARKUP.md -->\n${out}`;
  }
  return out;
}

function waitForHttpOk(urlString, attempts = 120) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlString);
    const port = u.port ? Number(u.port) : u.protocol === 'https:' ? 443 : 80;
    const tryOnce = (n) => {
      if (n >= attempts) {
        reject(new Error(`Server not reachable: ${urlString}`));
        return;
      }
      const req = http.request(
        {
          hostname: u.hostname,
          port: port || 5173,
          path: u.pathname || '/',
          method: 'GET',
          timeout: 3000,
          headers: { Host: u.host },
        },
        (res) => {
          res.resume();
          res.on('end', () => resolve());
        },
      );
      req.on('error', () => {
        setTimeout(() => tryOnce(n + 1), 400);
      });
      req.on('timeout', () => {
        req.destroy();
        setTimeout(() => tryOnce(n + 1), 400);
      });
      req.end();
    };
    tryOnce(0);
  });
}

async function capturePage(page, pathname, filename) {
  const url = `${BASE}${pathname}`;
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  // Wait for React shell (visible can fail if layout has zero height during paint).
  await page.waitForSelector('main.content-wrapper', { state: 'attached', timeout: 45000 });
  await delay(600);
  const raw = await page.evaluate(() => document.documentElement.outerHTML);
  const fixed = rewriteHtmlForDocs(raw);
  await writeFile(join(OUT_DIR, filename), fixed, 'utf8');
  console.log('Saved:', filename, '<-', pathname);
}

async function captureWithAuth(page) {
  if (!USER || !PASSWORD) return;

  console.log('Attempting admin capture (API must be up on port 5001 for login)...');
  await page.goto(`${BASE}/login`, { waitUntil: 'load', timeout: 60000 });
  await delay(400);
  await page.fill('#username', USER);
  await page.fill('#password', PASSWORD);
  await page.click('button[type="submit"]');
  await delay(2000);

  const url = page.url();
  if (!url.includes('/admin')) {
    console.warn(
      'Skipping admin.html / admin-edit.html: did not reach /admin after login (API or credentials?).',
    );
    return;
  }

  await page.locator('main.content-wrapper').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await delay(500);
  let raw = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile(join(OUT_DIR, 'admin.html'), rewriteHtmlForDocs(raw), 'utf8');
  console.log('Saved: admin.html');

  const editBtn = page.getByRole('button', { name: 'Edit' }).first();
  const hasEdit = await editBtn.isVisible().catch(() => false);
  if (!hasEdit) {
    console.warn('No Edit button; skipping admin-edit.html');
    return;
  }

  await editBtn.click();
  await page.locator('input[name="availability"], #availability').waitFor({ state: 'visible', timeout: 10000 });
  await delay(500);
  raw = await page.evaluate(() => document.documentElement.outerHTML);
  await writeFile(join(OUT_DIR, 'admin-edit.html'), rewriteHtmlForDocs(raw), 'utf8');
  console.log('Saved: admin-edit.html');
}

let viteProcess = null;

async function startVite() {
  await mkdir(OUT_DIR, { recursive: true });
  viteProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'client'], {
    cwd: ROOT,
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  viteProcess.stderr?.on('data', (d) => process.stderr.write(d));
  viteProcess.stdout?.on('data', (d) => process.stdout.write(d));
  await delay(800);
  await waitForHttpOk(BASE);
  console.log('Vite ready at', BASE);
}

function stopVite() {
  if (viteProcess && !viteProcess.killed) {
    viteProcess.kill('SIGTERM');
    viteProcess = null;
  }
}

async function main() {
  const skipSpawn = process.env.CAPTURE_SKIP_VITE === '1';
  if (!skipSpawn) {
    await startVite();
  } else {
    await mkdir(OUT_DIR, { recursive: true });
    await waitForHttpOk(BASE);
    console.log('Using existing server at', BASE);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    for (const { path: p, file } of PUBLIC_CAPTURES) {
      await capturePage(page, p, file);
    }
    await captureWithAuth(page);
  } finally {
    await browser.close();
    if (!skipSpawn) stopVite();
  }

  await writeReadmeIndex();
  console.log('Done. Output:', OUT_DIR);
}

async function writeReadmeIndex() {
  const readme = join(OUT_DIR, 'README.md');
  const lines = [
    '# Reference markup (legacy React app)',
    '',
    'Captured HTML for Bootstrap/Finder parity. Asset paths use `../../public/` so CSS and images load when you open a file from disk or serve the repo root.',
    '',
    '| File | Route |',
    '|------|--------|',
    ...PUBLIC_CAPTURES.map(({ path, file }) => `| ${file} | \`${path}\` |`),
    '| admin.html | `/admin` (requires capture with API + credentials) |',
    '| admin-edit.html | admin → Edit provider (requires API + credentials) |',
    '',
    'Generate or refresh:',
    '',
    '```bash',
    'npm run capture:markup',
    '```',
    '',
    'See `docs/CAPTURE-MARKUP.md`.',
    '',
  ];
  await writeFile(readme, lines.join('\n'), 'utf8');
}

main().catch((err) => {
  console.error(err);
  stopVite();
  process.exit(1);
});
