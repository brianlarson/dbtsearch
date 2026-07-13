![DBT Search logo](public/images/dbtsearch-logo.svg)

DBTsearch&trade; is a searchable directory of certified DBT (Dialectical Behavior Therapy) providers in Minnesota. DBT Search surfaces providers with **current availability** first so clinicians and clients can find treatment without calling down the state’s long list.

---

## Stack

| Area | Current |
|------|---------|
| **CMS / backend** | Craft CMS 5 at repo root (docroot `web/`) |
| **Templates** | Twig (`templates/`) |
| **Frontend assets** | Vite + Tailwind in `frontend/` → built into `web/css/` |
| **Database** | MySQL 8 (DDEV primary `db` service, database `craft`) |
| **Dev** | DDEV (`https://dbtsearch.ddev.site`) |
| **Hosting** | Cloudways. See [docs/HOSTING.md](docs/HOSTING.md) and [docs/deploy-cloudways.md](docs/deploy-cloudways.md). |

**Branches:** Active Craft stack on `develop` (and related feature branches). Legacy React/Express app on `main` / `legacy`. Archived Vue SPA on `archive/develop-vue-spa`. See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/NOTES-FOR-AGENTS.md](docs/NOTES-FOR-AGENTS.md).

---

## Get started (Craft + DDEV)

**[docs/STACK-REWRITE-SETUP.md](docs/STACK-REWRITE-SETUP.md)** — first-run setup.

Quick:

```bash
cp .env.example.dev .env   # then set CRAFT_SECURITY_KEY
ddev start
ddev composer install
ddev craft install         # first time only
# Front: https://dbtsearch.ddev.site  ·  Admin: https://dbtsearch.ddev.site/admin
```

Frontend assets (from `frontend/`):

```bash
cd frontend && npm install && npm run build:directory
```

Migration tooling: `pnpm mm` (or `npm run mm`) — see `scripts/migrate/`.

---

## Layout

- `config/`, `templates/`, `modules/`, `craft` — Craft CMS (repo root)
- `web/` — public docroot (built CSS/JS, uploads, `index.php`)
- `frontend/` — Storybook + Vite asset builds
- `public/` — static assets for reference markup in `docs/reference-markup/`
- `scripts/migrate/` — mighty-migration (`pnpm mm`)
- `docs/` — setup, deploy, roadmap, reference markup

Restack and milestones are tracked in **GitHub Issues**; use issue numbers in commits (e.g. `#12`).

---

## About this repo

This project is developed with AI-assisted tooling. The code and docs can have mistakes, omissions, or drift from intent—same as human-written work. Review changes, run the app and tests, and adjust as needed.
