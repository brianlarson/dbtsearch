# Stack-rewrite: first-run setup

Get Craft CMS and MySQL 8 running in DDEV on the `stack-rewrite` branch.

## Folder structure (this is correct)

- **Repo root** = where `.ddev/` lives. This is your DDEV project root.
- **Craft** lives in `cms/`. Its public docroot is `cms/web`.
- DDEV is configured with `docroot: cms/web` and `composer_root: cms`. Composer is provided by DDEV; there is no root-level `composer.json` — Craft brings its own inside `cms/` when you install it.

So: one repo, Craft in a subdirectory, DDEV serves `cms/web`. Good.

## Prerequisites

- You’re on the `stack-rewrite` branch.
- DDEV and Docker are installed.
- **Run all commands below from your repo root** (the same directory where you run `ddev start`). If you use a git worktree, use that worktree’s path for everything so `cms/` is created in the right place.

## Install in 4 steps

### 1. Start DDEV

```bash
ddev start
```

You get Postgres (legacy) and MySQL 8 (Craft). Craft will use MySQL: host `mysql8`, port `3306`, database `craft`, user `craft`, password `craft`.

### 2. Create the Craft project in `cms/`

From repo root, run Composer **inside** the container so `cms/` is created in the same path DDEV mounts:

```bash
ddev exec composer create-project craftcms/craft cms --no-scripts
```

This creates `cms/` (with its own `composer.json`, `web/`, etc.). Do not run this from the host in a different directory — then the container won’t see `cms/`.

### 3. Run the Craft installer

**Important:** Craft must use MySQL, not Postgres. The repo’s `cms/.env` is set with `DB_DRIVER=mysql`, `DB_SERVER=mysql8`, etc., so the installer uses the MySQL 8 service. DDEV’s default database is Postgres (used by the legacy app), so without these env vars Craft would use Postgres and conflict with existing tables.

```bash
ddev craft install
```

When prompted, use MySQL: server `mysql8`, port `3306`, database `craft`, user `craft`, password `craft`. Set site URL, admin user, and site name as you like. Or complete the web installer at the project URL with the same DB settings.

### 4. Open the site

- **Front:** `https://dbtsearch.ddev.site`  
- **Admin:** `https://dbtsearch.ddev.site/admin`

## After install

- `ddev composer` runs in `cms/` (install plugins, etc.).
- `ddev craft` runs Craft CLI from `cms/`.

## Troubleshooting

**`php craft` on your Mac fails to connect / DSN `host=;` / SQLSTATE [2002]**  
See **[TROUBLESHOOTING-CRAFT.md](TROUBLESHOOTING-CRAFT.md)** (host `.env`, immutable Dotenv, DDEV vs production).

**Craft used Postgres and failed with “relation already exists” (e.g. `users`)**  
Craft was using DDEV’s primary DB (Postgres) instead of MySQL. Ensure `cms/.env` has `DB_DRIVER=mysql`, `DB_SERVER=mysql8`, `DB_DATABASE=craft`, `DB_USER=craft`, `DB_PASSWORD=craft`. Then remove the Craft tables that were created in Postgres and run the installer again:

```bash
cat .ddev/commands/web/drop-craft-tables-from-postgres.sql | ddev exec -s db psql -U db -d db
ddev craft install
```

## Frontend app (Nuxt)

The Nuxt app lives in **`app/`**. Run it with `cd app && npm run dev` (see `app/README.md`). The splash page is at `/`. Use **`frontend/`** for Storybook (markup-only stories); the Nuxt app implements the same UI as Vue components.

## Switching back to the legacy app

```bash
git checkout main
ddev start
npm run server
npm run client
```

Legacy uses Postgres only; the Node app runs on your host.
