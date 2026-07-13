# Notes for AI / agents

Short reference for anyone (human or AI) working in this repo.

## Project

- **Name:** DBT Search (with space). Searchable directory of certified DBT providers in Minnesota; surfaces availability first.
- **Stack:** Craft CMS 5 at repo root (docroot `web/`), Twig templates, MySQL 8, frontend assets in `frontend/` built into `web/css/`.

## Branches

- **`develop`** (and feature branches) — Active Craft stack. Run: `ddev start`, open `https://dbtsearch.ddev.site`. See [STACK-REWRITE-SETUP.md](STACK-REWRITE-SETUP.md).
- **`main` / `legacy`** — Legacy React + Express + Postgres. Use `git checkout legacy` only if you need the old stack.
- **`archive/develop-vue-spa`** — Archived Vue SPA (reference only).

## Key docs

| Doc | Purpose |
|-----|---------|
| [README.md](../README.md) | Project summary and how to run Craft locally. |
| [ROADMAP.md](ROADMAP.md) | Current status and milestones. |
| [STACK-REWRITE-SETUP.md](STACK-REWRITE-SETUP.md) | Craft + MySQL 8 in DDEV; root-level Craft setup. |
| [HOSTING.md](HOSTING.md) | Hosting plan: Cloudways, lightweight Craft. |
| [deploy-cloudways.md](deploy-cloudways.md) | Cloudways staging/production deployment workflow. |
| [STAGING-dev.dbtsearch.org.md](STAGING-dev.dbtsearch.org.md) | Staging app runbook. |

## Tracking

- Work is tracked in **GitHub Issues** (no Linear). Use issue numbers in commit messages (e.g. `#12`).

## Conventions

- **Craft lives at repo root** — no `cms/` or `app/` prefix. Docroot is `web/`.
- **Env:** Use Craft-standard `CRAFT_*` vars. Templates: `.env.example.dev`, `.env.example.staging`, `.env.example.production`. Local `.env` is gitignored.
- **Naming:** Prefer “DBT Search” (with space) in prose; code/URLs may still use “dbtsearch” where that’s the identifier.
- **Migration:** `pnpm mm` (or `npm run mm`) for mighty-migration tooling under `scripts/migrate/`.
- **Post-deploy on Cloudways:** from app root run `composer install --no-dev --optimize-autoloader`, then `php craft project-config/apply --force --interactive=0`, `php craft migrate/all --interactive=0`, and `php craft clear-caches/all --interactive=0` (or `php craft up --interactive=0`).

This project is AI-assisted; docs and code can have mistakes. Review and test changes.
