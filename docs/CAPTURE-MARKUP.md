# Capture legacy page markup

**Linear:** [TT-14](https://linear.app/tiny-tree/issue/TT-14/capture-legacy-page-markup-for-tailwindvue-reference)

**Summary:** On `main`, set `VITE_CAPTURE_MARKUP=true`, run client only (no server/DB). Visit each route and save HTML to `docs/reference-markup/`. Use as reference for Bootstrap → Tailwind + Vue rebuild.

---

## When to do this

- **Branch:** `main` (legacy app uses Bootstrap 5 + Finder theme).
- **Before or in parallel with:** Nuxt scaffold (TT-10) and first directory page (TT-11). Having the markup helps match structure and copy when converting to Tailwind.

---

## No database required: auth bypass for capture

The app can run with **auth disabled** so you can capture every page (including `/login` and `/admin`) without logging in or running the database.

1. **Set in `.env` (repo root):**
   ```env
   VITE_CAPTURE_MARKUP=true
   ```
2. **Run only the client** (no server/DB needed):
   ```bash
   git checkout main
   npm run client
   ```
3. Open http://localhost:5173 and visit each route. `/admin` and `/login` render without a real user. Admin may show an empty list (no API); you’re capturing layout and structure.
4. **When you’re done capturing,** remove `VITE_CAPTURE_MARKUP` from `.env` or set it to `false`, so the app uses normal auth again.

---

## Steps (with auth bypass)

1. **Switch to main, set env, run client**
   ```bash
   git checkout main
   echo "VITE_CAPTURE_MARKUP=true" >> .env
   npm run client
   ```
   Open http://localhost:5173. No server or database required.

2. **Routes to capture**
   - `/` — Home
   - `/providers` — Provider list (may be empty without API)
   - `/about` — About
   - `/faqs` — FAQs
   - `/contact` — Contact
   - `/register` — Register
   - `/login` — Login (renders directly)
   - `/admin` — Admin (renders directly; list may be empty)
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
