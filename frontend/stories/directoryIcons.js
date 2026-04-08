/**
 * Inline SVGs for directory Storybook HTML (provider cards).
 * Replaces Finder icon font (`fi-*`) so icons work without `finder-icons.woff2`
 * (Vite/Storybook often break relative `url(...)` font paths in bundled CSS).
 *
 * Paths: Heroicons 24×24 outline (MIT).
 */

const svgAttrs =
  'xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"';

/** Website button — Heroicons outline GlobeAlt (full path; prior copy was truncated at `h-2.05`). */
export function directoryIconGlobe() {
  const d =
    'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418';
  return `<svg ${svgAttrs} width="18" height="18" class="me-2 ms-n1 shrink-0 align-text-bottom" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="${d}" /></svg>`;
}

/** Email button — matches prior `fi-mail` */
export function directoryIconMail() {
  return `<svg ${svgAttrs} width="18" height="18" class="me-2 ms-n1 shrink-0 align-text-bottom" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`;
}

/** Placeholder when no logo — matches prior `fi-heart` hero size */
export function directoryIconHeartPlaceholder() {
  return `<svg ${svgAttrs} width="2.5rem" height="2.5rem" class="text-brand" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>`;
}

/** CTA “Find DBT Providers” — replaces `fi-arrow-right` */
export function directoryIconArrowRight() {
  return `<svg ${svgAttrs} width="1rem" height="1rem" class="ms-2 shrink-0 align-text-bottom" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>`;
}
