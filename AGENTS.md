# AGENTS.md

## Cursor Cloud specific instructions

### Overview

DBTsearch is a React 18 + Express + PostgreSQL provider directory app. The legacy stack on `main` is the active development target. See `docs/GETTING-STARTED.md` for full setup docs and `docs/NOTES-FOR-AGENTS.md` for agent conventions.

### Services

| Service | Command | Port |
|---------|---------|------|
| Express API | `npx nodemon --watch server server/server.js` | 5001 |
| Vite dev server | `npx vite --host 0.0.0.0` | 5173 |

Vite proxies `/api` requests to the Express server on port 5001.

### Database

- PostgreSQL 16 is installed as a system package. Start it with `sudo pg_ctlcluster 16 main start`.
- Database name: `dbtsearch`. Schema: `data/database.sql`. Import with `psql -d dbtsearch -f data/database.sql`.
- The `.env` file must set `DATABASE_URL=postgresql://ubuntu:ubuntu@127.0.0.1:5432/dbtsearch` for the Express server to connect. Also set `SERVER_SESSION_SECRET` to a random string (min 8 chars).
- The SQL file has a harmless duplicate `CREATE TABLE "users"` that errors but does not break the schema import.

### Node version

Use Node 20 (`source ~/.nvm/nvm.sh && nvm use 20`). pnpm v9 is the package manager (lockfile `pnpm-lock.yaml`), but npm scripts (`npm run server`, `npm run client`) work because pnpm is used only for install.

### Testing

- `npx vite build` — production build (outputs to `build/`).
- `npx vitest run` — unit tests (no root-level test files exist currently; the only spec is in `frontend/` which is a separate sub-project).
- No ESLint config exists at root level.
- Smoke test: register a user, log in, view Admin, edit a provider, log out. See `docs/GETTING-STARTED.md` §4.

### Gotchas

- `pool.js` falls back to localhost:5432/dbtsearch without credentials if `DATABASE_URL` is unset. In Cloud Agent VMs, always set `DATABASE_URL` in `.env` with explicit credentials since the pg library requires a password for TCP connections.
- The `data/database.sql` file contains a duplicate `CREATE TABLE "users"` statement that will error on import — this is harmless and the rest of the import completes.
- The `.cursor/environment.json` runs `npm --prefix app install` which is for the Vue 3 sub-app in `app/` (stack-rewrite branch). This is unrelated to the legacy stack on `main`.
