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
| [CRAFT-DIRECTORY-SETUP.md](CRAFT-DIRECTORY-SETUP.md) | Providers + Locations fields, GraphQL checklist. |
| [PROVIDER-ALPHA-NOTES.md](PROVIDER-ALPHA-NOTES.md) | Deferred provider user-testing cohort and CP-first flow. |

## Craft CMS MCP (Cursor)

The **project-0-dbtsearch-craft-cms** MCP server talks to **one** Craft installation (whatever URL/credentials the MCP plugin uses). It is **not** the same thing as the files in this repo until that environment has received the same code + `php craft project-config/apply`.

**Good uses for MCP**

- **Introspect** live schema: `list_sections`, `list_fields`, `get_database_schema`, `get_graphql_schema`, `execute_graphql`.
- **Content**: `list_entries`, `get_entry`, `create_entry`, `update_entry` (after handles/entry types exist on **that** instance).
- **Ops/debug**: `read_logs`, `get_last_error`, `clear_caches`, `get_project_config_diff`, `tinker` (when appropriate).

**Not covered by MCP (do in repo + CLI / CP)**

- **Sections, entry types, fields, structure UIDs** — versioned under `cms/config/project/`, then `ddev exec "cd cms && php craft project-config/apply"` (or equivalent on the target server).
- **Twig templates** — `cms/templates/**` in git (e.g. `pages/_entry.twig`, `splash/index.twig`).
- **Vue app** — `app/` routes, components, env (e.g. `/providers` vs Craft routes).

**For agents**

1. After changing project config YAML, **apply** it on the environment MCP hits if you want MCP lists/queries to match git.
2. If `list_sections` / `list_fields` look “stale,” the MCP instance is probably **not** local DDEV—sync deploy or adjust MCP target; `reload_mcp` only refreshes plugin state, not another server’s database.
3. Prefer **project config + templates in git** as the source of truth for schema and markup; use MCP to **verify** and **seed/edit entries** on a live site.

## Tracking

- Work is tracked in **GitHub Issues** (no Linear). Use issue numbers in commit messages (e.g. `#12`).

## Conventions

- **Node:** Use Node 20.19+ for legacy app (see `.nvmrc`); run `nvm use` before `npm install` / `npm run client`.
- **Naming:** Prefer “DBT Search” (with space) in prose; code/URLs may still use “dbtsearch” where that’s the identifier.

This project is AI-assisted; docs and code can have mistakes. Review and test changes.
