# Get original stack running

**Tracked in Linear:** [TT-5 — Spin up original Prime Academy project](https://linear.app/tiny-tree/issue/TT-5/spin-up-original-prime-academy-project)

Use this checklist to get the current app (React, Vite, Express, Passport, PostgreSQL) running before forking to the new stack.

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node)
- **DDEV** (recommended for DB) or **PostgreSQL** installed and running on your host

---

## 1. Database

### Option A: DDEV (recommended)

DDEV provides PostgreSQL only; you run the Node app (Express + Vite) on your host, same as other `~/Sites` projects.

1. From the repo root, start DDEV:
   ```bash
   ddev start
   ```
2. Copy `.env.example` to `.env`, set `SERVER_SESSION_SECRET`, and **uncomment and use** the DDEV line so the app connects to DDEV’s Postgres:
   ```env
   DATABASE_URL=postgresql://db:db@127.0.0.1:55432/db
   ```
3. Import the schema (requires `psql` on your host, e.g. `brew install libpq && brew link --force libpq`):
   ```bash
   ddev import-schema
   ```
   If you don’t have `psql`, connect to `127.0.0.1:55432` (user `db`, password `db`, database `db`) in TablePlus/DBeaver/etc. and run `data/database.sql` there.

### Option B: Local PostgreSQL (no DDEV)

1. Start PostgreSQL (e.g. start the service or run `pg_ctl start`).
2. Create a database named `dbtsearch` (this is set in `server/modules/pool.js`; change it there if you use a different name).
3. Run the schema:
   ```bash
   psql -d dbtsearch -f data/database.sql
   ```
   (Or open `data/database.sql` in your SQL client and run it against `dbtsearch`.)
   Leave `DATABASE_URL` unset in `.env` so `pool.js` uses localhost and `dbtsearch`.

---

## 2. Repo and env

1. In the repo root:
   ```bash
   npm install
   ```
2. Create a `.env` in the **repo root** (copy from `.env.example`):
   - Set `SERVER_SESSION_SECRET` to a long random string (e.g. [Password Generator Plus](https://passwordsgenerator.net)). Avoid short strings or the default `superDuperSecret` or you'll get a warning at server start.
   - **If using DDEV:** uncomment the `DATABASE_URL=postgresql://db:db@127.0.0.1:55432/db` line in `.env`.
   - **If using local Postgres:** leave `DATABASE_URL` unset.

---

## 3. Run the app

1. Start the server:
   ```bash
   npm run server
   ```
   Leave it running (nodemon will restart on server file changes).

2. In another terminal, start the client:
   ```bash
   npm run client
   ```

3. Open **http://localhost:5173** in a browser.

---

## 4. Smoke test

- Register a new user
- Log out
- Log back in
- Log out

If all of that works, the original stack is running and you have a good baseline.

---

## 5. Fork to new stack (Option A)

When you're ready to build the new stack:

1. Ensure everything is committed on `main` (or your current default branch).
2. Create and switch to a long-lived branch:
   ```bash
   git checkout -b stack-rewrite
   ```
3. Do all new-stack work on `stack-rewrite`.
4. When the new stack is ready to become the default:
   - Rename the old default: `git branch -m main legacy` (or `master` → `legacy` if that's your current default).
   - Rename the new branch: `git branch -m stack-rewrite main`.
   - Push the new `main` and update the remote default branch in your host (GitHub/GitLab/etc.) if needed.

You keep one repo and a clear "original stack" vs "new stack" history.

---

## Linking commits to Linear

Include the issue key (e.g. **TT-5**) in your commit message so Linear links the commit to the issue. Examples:

- `Get original stack running (TT-5)`
- `TT-5 Add DDEV config and getting-started checklist`
- `Fixes TT-5`
