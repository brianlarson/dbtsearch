#!/usr/bin/env node
/**
 * Extract logo URLs for MN DBT certified providers from provider website links.
 * Source: data/dbt-providers.json (aligned with MN DHS list).
 * Output: data/provider-logos.json — unique providers with website and logo URL options.
 *
 * Logo sources:
 * - Favicon (Google): reliable, small; use for fallback or list views.
 * - Clearbit: higher-quality logos when available; may 404 for small practices.
 */
const fs = require('fs');
const path = require('path');

const providersPath = path.join(__dirname, '../data/dbt-providers.json');
const outPath = path.join(__dirname, '../data/provider-logos.json');

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

const entries = [...byKey.values()].map(({ name, website, domain, image }) => {
  // Google favicon (128px for better quality)
  const logoFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  // Clearbit logo (may 404 for many small sites)
  const logoClearbit = `https://logo.clearbit.com/${domain}`;
  return {
    name,
    website,
    domain,
    image, // existing local filename if any
    logoFavicon,
    logoClearbit,
  };
});

// Sort by name
entries.sort((a, b) => a.name.localeCompare(b.name));

fs.writeFileSync(outPath, JSON.stringify(entries, null, 2), 'utf8');
console.log(`Wrote ${entries.length} provider logo entries to data/provider-logos.json`);
console.log('Use logoFavicon for reliable small logos; try logoClearbit for higher-quality when available.');
