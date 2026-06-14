# Stack-rewrite: first-run setup

Get Craft CMS and MySQL 8 running in DDEV on the `stack-rewrite` branch.

## Folder structure (current)

- **Repo root** = where `.ddev/` lives and where Craft now lives.
- Craft’s public docroot is **`web/`**.
- DDEV is configured with `docroot: web` and `composer_root: .`.

## Prerequisites

- You’re on the `stack-rewrite` branch.
- DDEV and Docker are installed.
- **Run all commands below from your repo root** (the same directory where you run `ddev start`).

## Start in 3 steps

### 1. Start DDEV

```bash
ddev start
```

You get Postgres (legacy) and MySQL 8 (Craft sidecar). Craft uses MySQL: host `mysql8`, port `3306`, database `craft`, user `craft`, password `craft`.

### 2. Install dependencies

```bash
ddev composer install
```

### 3. Apply project config / install Craft

If first install:

```bash
ddev craft install
```

Then:

```bash
ddev craft project-config/apply --force
ddev craft migrate/all
```

### 4. Open the site

- **Front:** `https://dbtsearch.ddev.site`  
- **Admin:** `https://dbtsearch.ddev.site/admin`

## After install

- `ddev composer` runs at repo root.
- `ddev craft` runs Craft CLI from repo root.

## Troubleshooting

**Craft used Postgres and failed with “relation already exists” (e.g. `users`)**  
Craft was using DDEV’s primary DB (Postgres) instead of MySQL. Ensure `.ddev/craft-mysql.env.web` has `CRAFT_DB_SERVER=mysql8`, `CRAFT_DB_DATABASE=craft`, `CRAFT_DB_USER=craft`, `CRAFT_DB_PASSWORD=craft`. Then remove the Craft tables that were created in Postgres and run the installer again:

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
