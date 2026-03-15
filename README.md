![DBT Search logo](public/images/dbtsearch-logo.svg)

DBTsearch&trade; is a searchable directory of certified DBT (Dialectical Behavior Therapy) providers in Minnesota. DBT Search surfaces providers with **current availability** first so clinicians and clients can find treatment without calling down the state’s long list.

---

## High-level specs

| Area | Current (legacy) | Target (restack) |
|------|------------------|------------------|
| **Frontend** | React 18, Vite 5, Bootstrap 5 (Finder theme) | Vue 3, Nuxt 3, Vite, Tailwind CSS |
| **Backend / CMS** | Express, Passport (sessions) | Craft CMS |
| **Database** | PostgreSQL 14 (DDEV) | MySQL 8 for Craft; Postgres remains for legacy on `main` |
| **Dev** | DDEV (Postgres), Node 20, npm | DDEV (Postgres + MySQL 8 on `stack-rewrite`), Craft in `cms/`, Nuxt in `frontend/` or `app/` |
| **Hosting** | — | Cloudways (managed Craft + MySQL); lightweight Craft install. See [docs/HOSTING.md](docs/HOSTING.md). |

**Data:** Providers list (name, certification, availability, contact, locations); admin users can manage providers they’re assigned to. Reference markup for all pages lives in `docs/reference-markup/` for the restack.

**Branches:** Legacy app on `main` and `legacy` (same content; use either to run the old stack). Restack (Craft + Nuxt + Tailwind) on `stack-rewrite`. **Next step:** install Craft in `./cms` per [docs/STACK-REWRITE-SETUP.md](docs/STACK-REWRITE-SETUP.md). See [docs/ROADMAP.md](docs/ROADMAP.md). For a short guide for AI/agents: [docs/NOTES-FOR-AGENTS.md](docs/NOTES-FOR-AGENTS.md).

---

## Get the app running (legacy)

**[docs/GETTING-STARTED.md](docs/GETTING-STARTED.md)** — DDEV (Postgres) or local Postgres, `.env`, `npm run server` + `npm run client`, smoke test.

Quick: `ddev start` → set `SERVER_SESSION_SECRET` and `DATABASE_URL` in `.env` → import schema → `npm run server` & `npm run client` → http://localhost:5173

---

## Layout

- `src/` — React app, Zustand store
- `server/` — Express API, Passport
- `public/` — Static assets (Bootstrap/Finder theme)
- `data/` — Schema (`database.sql`) and seed data
- `docs/` — ROADMAP, GETTING-STARTED, STACK-REWRITE-SETUP, HOSTING, reference markup

Restack and milestones are tracked in **GitHub Issues**; use issue numbers in commits (e.g. `#12`). See [docs/ROADMAP.md](docs/ROADMAP.md).

---

## About this repo

This project is developed with AI-assisted tooling. The code and docs can have mistakes, omissions, or drift from intent—same as human-written work. Review changes, run the app and tests, and adjust as needed.
