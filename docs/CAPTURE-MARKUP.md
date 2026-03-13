# Capture legacy page markup

**Linear:** [TT-14 — Capture legacy page markup for Tailwind/Vue reference](https://linear.app/tiny-tree/issue/TT-14/capture-legacy-page-markup-for-tailwindvue-reference)

Use this as reference when rebuilding pages in Vue/Nuxt + Tailwind. Goal: **Bootstrap → Tailwind**, same look and functionality as close as possible; **Vue** for interactive elements.

---

## When to do this

- **Branch:** `main` (legacy app uses Bootstrap 5 + Finder theme).
- **Before or in parallel with:** Nuxt scaffold (TT-10) and first directory page (TT-11). Having the markup helps match structure and copy when converting to Tailwind.

---

## Steps

1. **Switch to main and run the app**
   ```bash
   git checkout main
   npm run server   # terminal 1
   npm run client   # terminal 2
   ```
   Open http://localhost:5173 (and ensure DDEV + Postgres are running if the app needs the DB).

2. **Routes to capture**
   - `/` — Home
   - `/providers` — Provider list
   - `/about` — About
   - `/faqs` — FAQs
   - `/contact` — Contact
   - `/register` — Register (logged-out state)
   - `/login` — Login
   - `/admin` — Admin (log in first; may have list + edit views)
   - `/logout` — Redirect; optional
   - Any 404 page (e.g. `/nonexistent`)

3. **How to capture**
   - **Option A (manual):** For each URL, open in browser → right‑click → “Save as” → “Webpage, Complete” or “Webpage, HTML only”. Save into `docs/reference-markup/` (e.g. `home.html`, `providers.html`, …).
   - **Option B (script):** Use a small Node script with `fetch()` of each route and write the response HTML to files. (SPA: you may get the shell only; for full DOM use a headless browser like Puppeteer/Playwright to visit each URL and export `document.documentElement.outerHTML`.)

4. **Where to save**
   - `docs/reference-markup/` — one `.html` per route (e.g. `home.html`, `providers.html`, `about.html`, `faqs.html`, `contact.html`, `register.html`, `login.html`, `admin.html`, `404.html`). Add to `.gitignore` if the files are large or you prefer not to commit them; otherwise commit for reference.

5. **Notes**
   - Current stack: React, Bootstrap 5, Finder theme (`public/css/theme.min.css`), dark theme (`data-bs-theme="dark"`).
   - When rebuilding: replace Bootstrap classes with Tailwind equivalents; keep structure and content; use Vue for forms, toggles, and other interactivity.
