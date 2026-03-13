# DBT Search

React, Zustand, Express, Passport, and PostgreSQL. (See `package.json` for dependencies.)

## Get the app running

**→ [docs/GETTING-STARTED.md](docs/GETTING-STARTED.md)** — step-by-step: DDEV (PostgreSQL) or local Postgres, `.env`, `npm run server` / `npm run client`, smoke test.

Quick version:

- **DDEV (recommended):** `ddev start` → copy `.env.example` to `.env`, set `SERVER_SESSION_SECRET` and `DATABASE_URL=postgresql://db:db@127.0.0.1:55432/db` → import schema (see GETTING-STARTED) → `npm run server` + `npm run client` → http://localhost:5173
- **Local Postgres:** Create DB `dbtsearch`, run `data/database.sql`, set only `SERVER_SESSION_SECRET` in `.env`, then run server and client.

## Layout

- `src/` — React app and Zustand store
- `server/` — Express API and Passport
- `public/` — Static assets
- `data/` — Schema (`database.sql`) and seed/data files

## Tracked in Linear

Commits that mention the issue key (e.g. **TT-5**) in the message are linked in Linear.
