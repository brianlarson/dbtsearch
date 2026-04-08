# Capture legacy page markup

**Summary:** Save rendered HTML from the legacy React app (`npm run client`) into `docs/reference-markup/` for Bootstrap → Tailwind + Vue parity. Asset paths in saved files are rewritten to `../../public/` so CSS and images work when you open a file from disk (see each file’s comment).

---

## Automated capture (recommended)

From the **repo root**:

```bash
npm install   # once; includes Playwright
npx playwright install chromium   # once; downloads browser
npm run capture:markup
```

This starts Vite, uses Playwright to visit each route, saves one `.html` file per screen, and strips Vite dev injections. **No database** is required. The API on port 5001 does not need to be running; `/providers` may show an empty list.

**Output:** `docs/reference-markup/home.html`, `providers.html`, `about.html`, `faqs.html`, `contact.html`, `register.html`, `login.html`, `logout.html`, `404.html`, plus `README.md`. Use **`http://localhost:5173`** only (not `127.0.0.1`) when testing manually—Vite can return 404 for the latter.

**Admin list + admin edit** are *not* included unless login works. To capture them:

1. Start the API: `npm run server` (port **5001**, with Postgres as usual).
2. Run:

   ```bash
   CAPTURE_MARKUP_USER=youruser CAPTURE_MARKUP_PASSWORD=yourpass npm run capture:markup
   ```

   Or use the older focused script (admin only): `node scripts/capture-markup-auth.mjs` with the same env vars while client + server are running.

**Env:**

| Variable | Meaning |
|----------|---------|
| `CAPTURE_BASE_URL` | Default `http://localhost:5173` |
| `CAPTURE_MARKUP_USER` / `CAPTURE_MARKUP_PASSWORD` | Optional; enables `admin.html` + `admin-edit.html` after login |
| `CAPTURE_SKIP_VITE=1` | Do not spawn Vite; use an already-running dev server at `CAPTURE_BASE_URL` |

---

## Manual capture (optional)

1. `npm run client` → open **http://localhost:5173** (not `127.0.0.1:5173`).
2. Visit each route and save HTML into `docs/reference-markup/`, or use a headless browser to dump `document.documentElement.outerHTML` (plain `fetch()` returns the SPA shell only).

**Routes:**

- `/` — Home  
- `/providers` — Provider list  
- `/about`, `/faqs`, `/contact`, `/register`, `/login`, `/logout`  
- `/admin` — requires auth + API  
- Any unknown path — 404  

---

## Notes

- Stack: React, Bootstrap 5, Finder theme (`public/css/theme.min.css`), dark theme (`data-bs-theme="dark"`).
- **`VITE_CAPTURE_MARKUP`** in older notes was planned as an auth bypass; it is **not implemented** in the app. Use the automated script or manual capture instead.
- When rebuilding: replace Bootstrap classes with Tailwind equivalents; keep structure and copy; use Vue for interactivity.
