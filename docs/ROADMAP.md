# Roadmap

Short-term plan and stack-rewrite options.

---

## At a glance

| What | Status / one-liner |
|------|--------------------|
| **Legacy app** | `main` and `legacy` branch: React + Express + Postgres. Running. |
| **New stack** | `stack-rewrite`: Vue, Nuxt, Tailwind, MySQL 8+. Branch ready; Craft now lives at repo root. |
| **Markup** | Capture legacy HTML (main, client-only) → `docs/reference-markup/`. [Details](CAPTURE-MARKUP.md) |
| **Milestones** | Craft + DDEV → Nuxt + Tailwind shell → first directory page. Track in **GitHub Issues**; use issue # in commits. |

**Branch:** Legacy on `main`; restack on `stack-rewrite`. See [NOTES-FOR-AGENTS.md](NOTES-FOR-AGENTS.md) for a short guide for AI/agents.

---

## Current status

- **Original stack:** Done — running on `main` (DDEV + Postgres, server/client).
- **Stack rewrite:** Branch `stack-rewrite` created. Craft structure is now root-level (no `cms/` split).
- **Chosen stack:** Craft CMS 5, Twig templates, Tailwind/Vite assets in `frontend/`, **MySQL 8+**. DDEV uses MySQL 8 as the primary `db` service; database credentials live in project `.env`. **First-run:** [docs/STACK-REWRITE-SETUP.md](STACK-REWRITE-SETUP.md) — copy `.env.example.dev` to `.env`, `ddev start`, run Craft from repo root.
- **Hosting:** Craft Cloud is out (no small plans). Plan: **Cloudways** (managed Craft + MySQL), lightweight Craft install with staging-first promotion. See [docs/HOSTING.md](HOSTING.md) and [deploy-cloudways.md](deploy-cloudways.md).
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

## Next milestones

1. **Craft at repo root** — [STACK-REWRITE-SETUP.md](STACK-REWRITE-SETUP.md): docroot `web`, `ddev start`, `ddev craft install`.
2. **Nuxt + Tailwind** — App shell on `stack-rewrite`; then first directory page from `docs/reference-markup/`.
3. **Craft data model** — Document entry types and fields for the directory.

Track in **GitHub Issues**; mention issue # in commit messages (e.g. `#12`).

---

*Last updated: docs onceover; Linear removed; Craft flattened to repo root.*
