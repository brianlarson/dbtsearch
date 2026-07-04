# Migrate from legacy DDEV dual-database setup

**Status:** DDEV config now uses **MySQL 8 only** (primary `db` service). This doc is for developers who already have a local DDEV volume from the old Postgres + `mysql8` sidecar setup.

## What changed

- **Before:** DDEV primary was Postgres (legacy React/Express app). Craft used a separate `mysql8` sidecar (`.ddev/docker-compose.mysql.yaml`).
- **Now:** DDEV primary is MySQL 8.0. Craft uses database `craft` on the `db` service. No sidecar, no Postgres.

## If you have an existing local DDEV volume

### Option A — Fresh start (simplest if you can re-import Craft data)

1. Export Craft data from the old mysql8 sidecar (while still on old config, or from a backup):

   ```bash
   ./scripts/export-craft-db.sh
   ```

2. Remove the old database volume and restart with the new config:

   ```bash
   ddev delete -O   # removes DB volume; confirm when prompted
   ddev start
   ```

3. Import Craft data:

   ```bash
   ddev craft-db-import storage/backups/craft-export.sql
   ddev craft up
   ```

### Option B — Convert existing Postgres volume in place

Use DDEV’s official database migration (see [database types](https://docs.ddev.com/en/stable/users/extend/database-types/)) only if you need to preserve non-Craft data in the old Postgres volume. Most Craft-only workflows should use Option A.

1. Export Craft from mysql8 first (see Option A, step 1).
2. Run `ddev utility migrate-database mysql:8.0` while still on Postgres config (see prior version of this doc in git history).
3. Create and import the `craft` database on primary MySQL.
4. `ddev restart` with the updated config.

## After migration

- `ddev import-db` / `ddev export-db` work with MySQL.
- Craft Control Panel backup uses the primary `db` service (no TLS issues with the old sidecar).
- Custom commands `ddev craft-db-import` and `ddev craft-db-export` target the `craft` database on primary MySQL.

## Craft logs (for reference)

- **Web:** `storage/logs/web-YYYY-MM-DD.log`
- **Console:** `storage/logs/console-YYYY-MM-DD.log`
- **PHP errors:** `storage/logs/phperrors.log`
