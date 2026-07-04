# Migrate Craft to DDEV primary MySQL (drop Postgres + mysql8)

This gets you to a single MySQL database so **Craft DB backup** (Control Panel and CLI) and **ddev export-db** work without SSL or extra containers.

## Current state

- DDEV primary database is **Postgres** (legacy / Node app).
- **Craft CMS 5.10+** uses the **mysql8** sidecar (MySQL 8.0) — database `craft`, user `craft`.
- `ddev import-db` targets Postgres only. Craft backups must import via `ddev craft-db-import` or `pnpm mm -- pull` (both target mysql8/craft).
- You cannot change `config.yaml` from Postgres to MySQL and restart: DDEV will refuse because the existing db volume is Postgres. Use the steps below.

## Steps (run from project root)

### 1. Export the Craft database from mysql8 (do this first)

```bash
./scripts/export-craft-db.sh
```

This creates `storage/backups/craft-export.sql`. Keep this file.

### 2. Migrate DDEV’s primary database from Postgres to MySQL

Use DDEV’s official migration (see [database types](https://docs.ddev.com/en/stable/users/extend/database-types/)):

```bash
ddev config --database=postgres:14
ddev start
ddev utility migrate-database mysql:8.0
```

That converts the **primary** database (the “db” service) from Postgres to MySQL. Your Craft data is in mysql8 and is unaffected.

### 3. Create the `craft` database on the new primary MySQL and import

After the migration, the primary db is MySQL. Run:

```bash
ddev mysql -e "CREATE DATABASE IF NOT EXISTS craft; GRANT ALL ON craft.* TO 'db'@'%';"
ddev mysql craft < storage/backups/craft-export.sql
```

### 4. Point Craft at the primary db

Edit **`.ddev/.env.web`** and **`.ddev/craft-mysql.env.web`** and set:

- `CRAFT_DB_SERVER=db`
- `CRAFT_DB_USER=db`
- `CRAFT_DB_PASSWORD=db`

(Leave `CRAFT_DB_DATABASE=craft`, `CRAFT_DB_PORT=3306` as they are.)

### 5. Remove the mysql8 service and update config

- Delete **`.ddev/docker-compose.mysql.yaml`**.
- In **`.ddev/config.yaml`**, set `database.type` to `mysql` and `version` to `8.0` (so it matches the migrated db), and update `web_environment` so `CRAFT_DB_SERVER=db`, `CRAFT_DB_USER=db`, `CRAFT_DB_PASSWORD=db`.

Then:

```bash
ddev restart
```

Craft will use the primary **db** (MySQL). Control Panel backup and `ddev export-db` will work.

### 6. Update the export script (optional)

In **`scripts/export-craft-db.sh`**, the script already uses mysql8 when present and falls back to db; after you remove mysql8, it will use the primary db automatically.

---

## Legacy Postgres

The React/Express app (and its `DATABASE_URL`) lived on `main` / `legacy`. This branch uses Craft + MySQL only for the app. DDEV may still run a Postgres primary for historical data until you complete this migration.

## Craft logs (for reference)

- **Web:** `storage/logs/web-YYYY-MM-DD.log`
- **Console:** `storage/logs/console-YYYY-MM-DD.log`
- **PHP errors:** `storage/logs/phperrors.log`

The “Could not create backup” / TLS error in the Control Panel came from Craft calling `mysqldump` from the web container to mysql8; using the primary **db** avoids that.
