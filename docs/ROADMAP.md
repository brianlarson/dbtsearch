# Roadmap

Short-term plan and stack-rewrite options.

---

## At a glance

| What | Status / one-liner |
|------|--------------------|
| **Legacy app** | `main`: React + Express + Postgres. Running. |
| **New stack** | `stack-rewrite`: Vue, Nuxt, Tailwind, MySQL 8+. Branch + schema ready. |
| **TT-9** | Export providers/users → JSON (for Craft; no DB on capture). |
| **TT-14** | Capture legacy HTML (main, client-only, no auth). → `docs/reference-markup/`. |
| **TT-10** | Nuxt 3 + Tailwind app shell on `stack-rewrite`. |
| **TT-12** | Nuxt ↔ DDEV MySQL; verify. |
| **TT-11** | One providers list page (read-only). |
| **TT-13** | Craft entry types + field map (doc). |

**Branch:** TT-9 & TT-14 on `main`; rest on `stack-rewrite`. Commit with issue key (e.g. TT-9) in message.

---

## Current status

- **TT-5:** Done — original stack running (DDEV + Postgres, server/client).
- **TT-8 (Stack rewrite):** [TT-8 — Stack rewrite — branch + first milestone](https://linear.app/tiny-tree/issue/TT-8/stack-rewrite-branch-first-milestone). Branch `stack-rewrite` created.
- **Chosen stack:** Vue 3, Nuxt 3, Tailwind CSS, **MySQL 8+** (Craft CMS–recommended). DDEV on this branch gets **MySQL 8** via `.ddev/docker-compose.mysql.yaml` (Craft uses it); Postgres remains for legacy. **First-run:** [docs/STACK-REWRITE-SETUP.md](STACK-REWRITE-SETUP.md) — set docroot to `cms/web`, `ddev start`, install Craft into `cms/`.
- **Hosting:** Craft Cloud is out (no small plans). Plan: **Cloudways** (managed Craft + MySQL), lightweight Craft install. See [docs/HOSTING.md](HOSTING.md).
- **Legacy (main):** React (Vite), Express, Passport, PostgreSQL; schema `data/database.sql`.

---

## Stack-rewrite: things to decide

You said you're converting to a "totally different stack." Here are common directions and tradeoffs so you can choose when you're back.

### Frontend

| Option | Pros | Cons | Good for |
|--------|------|------|----------|
| **Keep Vite + React** | Already working, fast dev, simple | Separate client/server | Same as now, minimal change |
| **Next.js** | One repo, SSR/SSG, API routes, strong ecosystem | Heavier, Vercel-optimized | SEO, full-stack in one place |
| **Remix** | Web standards, forms, deploy anywhere | Smaller ecosystem | Form-heavy apps, non-Vercel deploy |
| **Vite + different UI** | Same build, swap to Svelte/Vue/etc. | New patterns to learn | If you want a different UI stack |

### Backend

| Option | Pros | Cons |
|--------|------|------|
| **Keep Express + Passport** | Already done, well understood | Separate server, you own auth |
| **Next.js API routes / Remix loaders** | Single app, less moving parts | Tied to that framework |
| **Other runtime (e.g. Go, Rust)** | Performance, different ecosystem | Full rewrite of API and auth |

### Database (chosen for stack-rewrite)

- **MySQL 8+ (Craft CMS–recommended):** DDEV on `stack-rewrite` is configured for MySQL 8.0. Schema: `data/database.mysql.sql`. Aligns with Craft CMS and your usual stack.
- **Legacy (main):** Postgres remains for the existing React/Express app.

### Recommendation (for a search-style app)

- **If the goal is "new stack" but still JS/TS:** Next.js or Remix + Postgres keeps one app, good DX, and you can reuse `data/database.sql` and DDEV.
- **If the goal is "minimal change":** Stay on Vite + React + Express, add an ORM and clean up auth, then iterate.

---

## Next decisions

1. When the new stack is ready, promote `stack-rewrite` to `main` (see GETTING-STARTED §5).

---

## This week / Next atomic tasks

Suggested order. Full detail in Linear; one-liners above.

| # | Issue | Summary |
|---|--------|--------|
| 1 | [TT-9](https://linear.app/tiny-tree/issue/TT-9/export-directory-data-to-json) | Export data → JSON for Craft. |
| 2 | [TT-14](https://linear.app/tiny-tree/issue/TT-14/capture-legacy-page-markup-for-tailwindvue-reference) | Capture legacy HTML (main, no DB). [Details](CAPTURE-MARKUP.md) |
| 3 | [TT-10](https://linear.app/tiny-tree/issue/TT-10/scaffold-nuxt-3-tailwind-on-stack-rewrite) | Nuxt 3 + Tailwind shell. |
| 4 | [TT-12](https://linear.app/tiny-tree/issue/TT-12/connect-nuxt-to-ddev-mysql) | Nuxt ↔ MySQL. |
| 5 | [TT-11](https://linear.app/tiny-tree/issue/TT-11/first-directory-page-providers-list) | Providers list page. |
| 6 | [TT-13](https://linear.app/tiny-tree/issue/TT-13/document-craft-data-model-for-directory) | Craft data model doc. |

---

## Linear from the repo

With `LINEAR_API_KEY` in `.env`, you can close or create issues from the terminal:

```bash
node scripts/linear.js close TT-5
node scripts/linear.js create "Title" "Optional description"
```

Or: `pnpm run linear:close -- TT-5` and `pnpm run linear:create -- "Title" "Description"`.

---

*Last updated: when you went to bed. Adjust this doc as you make decisions.*
