# Roadmap

Short-term plan and stack-rewrite options for when you're ready.

---

## Current status

- **TT-5 (Spin up original project):** Server and client run; DDEV provides Postgres. Finish by doing the smoke test (register → log out → log in → log out) and marking TT-5 Done in Linear.
- **Baseline:** React (Vite), Zustand, Express, Passport, PostgreSQL. Schema in `data/database.sql` (users + providers).

---

## Right after TT-5

1. Mark TT-5 Done in Linear.
2. Optional: Tidy code comments / README to sound like this project, not the Prime starter.
3. When ready to change stacks: `git checkout -b stack-rewrite` and do all new-stack work there. Promote to `main` when you're happy (see GETTING-STARTED §5).

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

### Database

- **Keep Postgres (DDEV or hosted):** No change; you already have schema and DDEV.
- **ORM:** If you add one (e.g. Prisma, Drizzle), it can live with Express or with Next/Remix.

### Recommendation (for a search-style app)

- **If the goal is "new stack" but still JS/TS:** Next.js or Remix + Postgres keeps one app, good DX, and you can reuse `data/database.sql` and DDEV.
- **If the goal is "minimal change":** Stay on Vite + React + Express, add an ORM and clean up auth, then iterate.

---

## Decisions when you're back

1. **Smoke test done?** If yes, close TT-5.
2. **What stack do you want?** (e.g. "Next.js + Postgres" or "Remix + DDEV")
3. **Create `stack-rewrite` branch** and add a Linear issue for the rewrite so commits link.
4. **First milestone on new stack:** e.g. "Auth + one read-only page" or "Same providers list, new stack."

---

---

## Linear from the repo

With `LINEAR_API_KEY` in `.env`, you can close or create issues from the terminal:

```bash
node scripts/linear.js close TT-5
node scripts/linear.js create "Stack rewrite — branch + first milestone" "Optional description"
```

Or: `pnpm run linear:close -- TT-5` and `pnpm run linear:create -- "Title" "Description"`.

---

*Last updated: when you went to bed. Adjust this doc as you make decisions.*
