# Notes for AI / agents

Short reference for anyone (human or AI) working in this repo.

## Project

- **Name:** DBT Search (with space). Searchable directory of certified DBT providers in Minnesota; surfaces availability first.
- **Repo:** Legacy app (React, Vite, Express, Passport, Postgres) on `main` and `legacy`; restack (Vue, Nuxt, Tailwind, Craft CMS, MySQL 8) on `stack-rewrite`.

## Branches

- **`main`** — Legacy stack (default branch). Run: `ddev start`, `npm run server`, `npm run client`. See [GETTING-STARTED.md](GETTING-STARTED.md).
- **`legacy`** — Snapshot of legacy app (same as `main`). Use `git checkout legacy` to run the old stack; stays unchanged when you later promote the new stack to `main`.
- **`stack-rewrite`** — New stack. Next step: **install Craft CMS in `./cms`** per [STACK-REWRITE-SETUP.md](STACK-REWRITE-SETUP.md) (docroot `cms/web`, `ddev start`, `composer create-project craftcms/craft cms`, `ddev craft install`).

## Key docs

| Doc | Purpose |
|-----|---------|
| [README.md](../README.md) | Project summary, specs, how to run legacy app. |
| [ROADMAP.md](ROADMAP.md) | Current status, chosen stack, next milestones. |
| [GETTING-STARTED.md](GETTING-STARTED.md) | Legacy app: DDEV/Postgres, env, smoke test. |
| [STACK-REWRITE-SETUP.md](STACK-REWRITE-SETUP.md) | Craft + MySQL 8 in DDEV; install into `./cms`. |
| [HOSTING.md](HOSTING.md) | Hosting plan: Cloudways, lightweight Craft. |
| [CAPTURE-MARKUP.md](CAPTURE-MARKUP.md) | How to capture legacy HTML to `docs/reference-markup/`. |

## Tracking

- Work is tracked in **GitHub Issues** (no Linear). Use issue numbers in commit messages (e.g. `#12`).

## Conventions

- **Node:** Use Node 20.19+ for legacy app (see `.nvmrc`); run `nvm use` before `npm install` / `npm run client`.
- **Naming:** Prefer “DBT Search” (with space) in prose; code/URLs may still use “dbtsearch” where that’s the identifier.

This project is AI-assisted; docs and code can have mistakes. Review and test changes.
