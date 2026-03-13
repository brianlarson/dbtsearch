# Roadmap

Short-term plan and stack-rewrite options.

---

## Current status

- **TT-5:** Done — original stack running (DDEV + Postgres, server/client).
- **TT-8 (Stack rewrite):** [TT-8 — Stack rewrite — branch + first milestone](https://linear.app/tiny-tree/issue/TT-8/stack-rewrite-branch-first-milestone). Branch `stack-rewrite` created.
- **Chosen stack:** Vue 3, Nuxt 3, Tailwind CSS, **MySQL 8+** (Craft CMS–recommended). DDEV on this branch uses MySQL 8. Schema: `data/database.mysql.sql`. After `ddev start`, import with `ddev mysql < data/database.mysql.sql` (or use DDEV’s import-db).
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

Suggested order. Link commits with the issue key (e.g. **TT-9**) in the message.

| Order | Issue | What |
|-------|--------|------|
| 1 | [TT-9 — Export directory data to JSON](https://linear.app/tiny-tree/issue/TT-9/export-directory-data-to-json) | Export providers (and optionally users) to JSON for Craft / new schema. Data model will change with Craft; focus is preserving data, not schema. |
| 2 | [TT-10 — Scaffold Nuxt 3 + Tailwind](https://linear.app/tiny-tree/issue/TT-10/scaffold-nuxt-3-tailwind-on-stack-rewrite) | Add Nuxt 3 + Tailwind to `stack-rewrite`; app shell only. |
| 3 | [TT-12 — Connect Nuxt to DDEV MySQL](https://linear.app/tiny-tree/issue/TT-12/connect-nuxt-to-ddev-mysql) | Configure Nuxt → DDEV MySQL 8; verify connection. |
| 4 | [TT-11 — First directory page: providers list](https://linear.app/tiny-tree/issue/TT-11/first-directory-page-providers-list) | One read-only page listing providers (from DB or JSON); proves stack. |
| 5 | [TT-13 — Document Craft data model for directory](https://linear.app/tiny-tree/issue/TT-13/document-craft-data-model-for-directory) | Outline Craft entry types/fields and how exported data maps; prep for Craft project. |

**Note:** TT-9 (export to JSON) can be done on `main` or `stack-rewrite`; the rest are on `stack-rewrite`.

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
