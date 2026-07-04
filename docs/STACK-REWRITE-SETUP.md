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

Set `CRAFT_SECURITY_KEY` (e.g. `php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"`). Leave `CRAFT_DB_*` and `CRAFT_WEB_ROOT` unset — DDEV provides them in the web container so dotenv does not override container values.

### 2. Start DDEV

```bash
ddev start
```

You get Postgres (legacy data may still use it) and MySQL 8 (Craft sidecar). Craft uses MySQL: host `mysql8`, port `3306`, database `craft`, user `craft`, password `craft`.

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

## Troubleshooting

**`ddev import-db` imports into Postgres, not Craft**  
Production Craft backups are MySQL 8 dumps. Never use `ddev import-db` for Craft while Postgres is primary — it fails on backtick syntax (`DROP TABLE IF EXISTS \`addresses\`;`). Import into the **mysql8** sidecar instead:

```bash
ddev craft-db-import storage/backups/latest.sql.gz
# or manually:
ddev exec -s mysql8 sh -c 'gunzip -c /var/www/html/storage/backups/latest.sql.gz | mysql -u craft -pcraft craft'
ddev craft up
```

Use `pnpm mm -- pull` for automated pulls — it targets mysql8/craft automatically. To move to a single primary MySQL 8 database, see [MIGRATION-MYSQL-ONLY.md](MIGRATION-MYSQL-ONLY.md).

**Craft used Postgres and failed with “relation already exists” (e.g. `users`)**  
Craft was using DDEV’s primary DB (Postgres) instead of MySQL. Ensure `.ddev/craft-mysql.env.web` has `CRAFT_DB_SERVER=mysql8`, `CRAFT_DB_DATABASE=craft`, `CRAFT_DB_USER=craft`, `CRAFT_DB_PASSWORD=craft`. Then remove the Craft tables that were created in Postgres and run the installer again:

```bash
cat .ddev/commands/web/drop-craft-tables-from-postgres.sql | ddev exec -s db psql -U db -d db
ddev craft install
```

## Frontend (Storybook + Craft templates)

UI is served by **Craft Twig templates** (`templates/`). Use **`frontend/`** for Storybook (design iteration) and Vite builds that emit CSS/JS into `web/` (e.g. `npm run build:directory` from `frontend/`). The archived Vue SPA lives on branch `archive/develop-vue-spa`. The legacy React/Express app lives on `main` / `legacy`.
