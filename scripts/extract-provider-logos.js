#!/usr/bin/env node
/**
 * Extract logo URLs for MN DBT certified providers from provider website links.
 * Uses data/dbt-providers.json (provider URLs + existing image filenames from original project).
 * Output: data/provider-logos.json — unique providers with website, existing image, and logo URLs.
 *
 * Existing images in source data (e.g. asc-psychological-services.webp, .png) are kept as-is;
 * any image format is fine. Serve from /images/providers/{image}.
 *
 * With --download: fetches logos for providers without an image, saves to public/images/providers/
 * (same directory as existing provider logos; domain-based slug, format from response).
 * Requests are spaced with a random 2–4s delay (or --delay=5000 for 5s) and a browser-like
 * User-Agent to reduce blocking.
 */
const fs = require('fs');
const path = require('path');

const providersPath = path.join(__dirname, '../data/dbt-providers.json');
const outPath = path.join(__dirname, '../data/provider-logos.json');
// Single directory for all provider logos (existing + downloaded). App/Storybook serve from repo public/.
const providerLogosDir = path.join(__dirname, '../public/images/providers');
const doDownload = process.argv.includes('--download');
// --delay=5000 = 5s base; default 2–4s with jitter so requests are spread out
const delayArg = process.argv.find((a) => a.startsWith('--delay='));
const baseDelayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 0;

function randomDelay() {
  if (baseDelayMs > 0) {
    const jitter = Math.floor(Math.random() * 1000);
    return baseDelayMs + jitter;
  }
  const base = 2000 + Math.floor(Math.random() * 2000); // 2–4 s
  const jitter = Math.floor(Math.random() * 1500); // 0–1.5 s extra
  return base + jitter;
}

const raw = JSON.parse(fs.readFileSync(providersPath, 'utf8'));

/** Normalize URL to origin hostname (no www, lowercase). */
function domainFromWebsite(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    let host = u.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.slice(4);
    return host || null;
  } catch {
    return null;
  }
}

/** Slug for filename from domain (e.g. acp-mn.com -> acp-mn-com). */
function slugFromDomain(domain) {
  return domain.replace(/\./g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase() || domain;
}

/** Extension from Content-Type. */
function extFromContentType(ct) {
  if (!ct) return 'png';
  const lower = ct.split(';')[0].trim().toLowerCase();
  if (lower.includes('webp')) return 'webp';
  if (lower.includes('svg')) return 'svg';
  if (lower.includes('png')) return 'png';
  if (lower.includes('jpeg') || lower.includes('jpg')) return 'jpg';
  return 'png';
}

/** Unique providers by (name, domain). Prefer entry that already has image. */
const byKey = new Map();
for (const p of raw) {
  const domain = domainFromWebsite(p.website);
  if (!domain) continue;
  const key = `${p.name}\t${domain}`;
  const existing = byKey.get(key);
  if (!existing || (p.image && !existing.image))
    byKey.set(key, { name: p.name, website: p.website, domain, image: p.image || null });
}

let entries = [...byKey.values()].map(({ name, website, domain, image }) => {
  const logoFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const logoClearbit = `https://logo.clearbit.com/${domain}`;
  // Resolved logo: use existing local image path when present, else external URLs for fallback
  const logoUrl = image ? `/images/providers/${image}` : null;
  return {
    name,
    website,
    domain,
    image, // existing filename from original data (e.g. asc-psychological-services.webp)
    logoUrl, // use in UI when image exists
    logoFavicon,
    logoClearbit,
  };
});

entries.sort((a, b) => a.name.localeCompare(b.name));

const fetchOpts = {
  redirect: 'follow',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8',
  },
};

async function run() {
  if (doDownload && typeof fetch !== 'undefined') {
    fs.mkdirSync(providerLogosDir, { recursive: true });
    const toFetch = entries.filter((e) => !e.image);
    console.log(`Downloading logos for ${toFetch.length} providers (delay between requests: ~${baseDelayMs || '2-4'}s)...`);
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.image) continue; // already have local image
      const slug = slugFromDomain(entry.domain);
      let buf = null;
      let ext = 'png';
      try {
        const res = await fetch(entry.logoClearbit, fetchOpts);
        if (res.ok) {
          buf = Buffer.from(await res.arrayBuffer());
          ext = extFromContentType(res.headers.get('content-type'));
        }
      } catch (_) {}
      if (!buf || buf.length === 0) {
        try {
          const res = await fetch(entry.logoFavicon, fetchOpts);
          if (res.ok) {
            buf = Buffer.from(await res.arrayBuffer());
            ext = extFromContentType(res.headers.get('content-type')) || 'png';
          }
        } catch (_) {}
      }
      if (buf && buf.length > 0) {
        const filename = `${slug}.${ext}`;
        fs.writeFileSync(path.join(providerLogosDir, filename), buf);
        entry.imageLocal = `providers/${filename}`;
        entry.logoUrl = `/images/providers/${filename}`;
      }
      // Spread requests with random delay so we don't look like a bot
      const ms = randomDelay();
      await new Promise((r) => setTimeout(r, ms));
    }
    fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf8');
    console.log(`Wrote ${entries.length} entries to data/provider-logos.json (with downloads)`);
    console.log(`Logos saved to public/images/providers/ (${path.resolve(providerLogosDir)})`);
  } else if (doDownload) {
    console.log('Run with Node 18+ for --download (uses fetch). Writing manifest without download.');
    fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf8');
    console.log(`Wrote ${entries.length} entries to data/provider-logos.json`);
  } else {
    fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf8');
    console.log(`Wrote ${entries.length} provider logo entries to data/provider-logos.json`);
    console.log('Existing image filenames (e.g. .webp, .png) are in logoUrl as /images/providers/{image}.');
    console.log('Run with --download to fetch and save logos for providers without an image.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
