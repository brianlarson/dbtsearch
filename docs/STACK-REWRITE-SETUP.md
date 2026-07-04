# Craft CMS: first-run setup

Get Craft CMS and MySQL 8 running in DDEV.

## Folder structure

- **Repo root** = where `.ddev/` lives and where Craft lives.
- Craft’s public docroot is **`web/`**.
- DDEV is configured with `docroot: web` and `composer_root: .`.

## Prerequisites

- DDEV and Docker are installed.
- **Run all commands below from your repo root** (the same directory where you run `ddev start`).

## Start in a few steps

### 1. Local `.env`

```bash
cp .env.example.dev .env
```

Set `CRAFT_SECURITY_KEY` (e.g. `php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"`). `.env.example.dev` includes DDEV-ready `CRAFT_DB_*` values (`CRAFT_DB_SERVER=db`, user/password `db`, database `craft`) and `CRAFT_WEB_ROOT=/var/www/html/web`.

### 2. Start DDEV

```bash
ddev start
```

DDEV runs MySQL 8 as the primary database. Craft connects to host `db`, port `3306`, database `craft`, user `db`, password `db`.

### 3. Install dependencies

```bash
ddev composer install
```

### 4. Apply project config / install Craft

If first install:

```bash
ddev craft install
```

Then:

```bash
ddev craft project-config/apply --force
ddev craft migrate/all
```

### 5. Open the site

- **Front:** `https://dbtsearch.ddev.site`  
- **Admin:** `https://dbtsearch.ddev.site/admin`

## After install

- `ddev composer` runs at repo root.
- `ddev craft` runs Craft CLI from repo root.
- `ddev import-db` and `ddev export-db` target the primary MySQL database.
- `ddev craft-db-import` / `ddev craft-db-export` import/export the `craft` database specifically.

## Troubleshooting

**Import a production Craft backup**

```bash
ddev craft-db-import storage/backups/latest.sql.gz
ddev craft up
```

Or use `pnpm mm -- pull` for automated pulls.

**Migrating from the old dual-database setup (Postgres + mysql8 sidecar)**

If your local DDEV volume still has Postgres from the previous config, see [MIGRATION-MYSQL-ONLY.md](MIGRATION-MYSQL-ONLY.md) for one-time migration steps. New clones can skip that doc — the config already uses MySQL-only.

## Frontend (Storybook + Craft templates)

UI is served by **Craft Twig templates** (`templates/`). Use **`frontend/`** for Storybook (design iteration) and Vite builds that emit CSS/JS into `web/` (e.g. `npm run build:directory` from `frontend/`). The archived Vue SPA lives on branch `archive/develop-vue-spa`. The legacy React/Express app lives on `main` / `legacy`.
