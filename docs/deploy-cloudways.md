# Cloudways environment workflow (staging + production)

This runbook is the recommended way to connect environments for DBT Search on Cloudways while keeping production safe.

## Recommendation

Use **staging-first** deployment:

1. Keep **production** stable.
2. Create/maintain a separate **staging app** in Cloudways.
3. Deploy and validate on staging first.
4. Promote the same commit to production.

## Environment roles

| Environment | Purpose | Allowed DB writes | Notes |
|---|---|---:|---|
| Local / DDEV | Active development, schema and template iteration | Yes (local only) | Fast loops and Craft CP work |
| Cloud agent | Code/docs automation | No prod DB access | Treat as stateless runner |
| Cloudways Staging | Integration/UAT | Yes (staging only) | Mirrors prod stack/settings |
| Cloudways Production | Live traffic | Yes (prod only) | Deploy-only, no ad-hoc schema edits |

## Connect environments safely

### Do connect
- Git repo -> Cloudways app deploy.
- Staging and production each with their own `.env`.
- Controlled content sync: production -> staging (sanitized when needed).

### Do not connect directly
- Local or cloud agent directly writing to production DB.
- Staging DB cloned back into production.
- Secrets shared across all environments.

## First-time setup on Cloudways

## 1) Provision apps

- Create **two Cloudways apps** on same or separate servers:
  - `dbtsearch-staging`
  - `dbtsearch-production`
- PHP 8.2+ and MySQL 8.
- Set web root/docroot to `web`.

## 2) Configure Git deploy

- Connect repository in both apps.
- Recommended branch policy:
  - Staging app tracks working branch (or `develop`).
  - Production app tracks release branch (or `main`).
- Use deployment webhooks/manual deploy from Cloudways panel.

## 3) Per-environment `.env`

Create `.env` on each app with env-specific values:

- `ENVIRONMENT=staging` or `ENVIRONMENT=production`
- `CRAFT_DB_DRIVER=mysql`
- `CRAFT_DB_SERVER=<cloudways-mysql-host>`
- `CRAFT_DB_PORT=3306`
- `CRAFT_DB_DATABASE=<db-name>`
- `CRAFT_DB_USER=<db-user>`
- `CRAFT_DB_PASSWORD=<db-password>`
- `PRIMARY_SITE_URL=<staging-or-prod-url>`
- `CRAFT_APP_ID=<app-id>` (can differ by environment)
- `CRAFT_SECURITY_KEY=<unique-secret>` (per environment)

Also set mail, queue, and API secrets per environment.

## 4) Deploy command sequence (every deploy)

Preferred: run the repo helper from app root:

```bash
./scripts/cloudways-post-deploy.sh
```

If your team standard is `craft up`, use:

```bash
./scripts/cloudways-post-deploy.sh --with-up
```

Manual equivalent (from app root) if needed:

```bash
composer install --no-dev --optimize-autoloader
php craft project-config/apply --force --interactive=0
php craft migrate/all --interactive=0
php craft clear-caches/all --interactive=0
```

## Content and media sync policy

### Database

- Source of truth for live content is production.
- Refresh staging from production snapshots on a schedule (or before major QA).
- Sanitize sensitive/user data before broader access.

### Assets

- Keep `web/uploads/` in sync with the matching DB snapshot.
- Prefer pull from production -> staging, never push staging -> production.

## Production safety rules

- No schema changes directly in production CP.
- All schema changes are made in dev, committed, then applied via deploy.
- Always take a backup snapshot before production deploy.
- Use maintenance window/low-traffic windows for risky schema updates.

## Release flow

1. Merge feature branch.
2. Deploy to **staging**.
3. Run smoke checks:
   - homepage and `/directory`
   - provider filters/search
   - forms and email
   - CP access and entry save
4. Promote same commit to **production**.
5. Run post-deploy smoke checks.

## Rollback playbook

If production deploy fails:

1. Re-deploy previous known-good commit.
2. Restore DB snapshot if migration/content state is inconsistent.
3. Clear caches.
4. Verify front-end routes + CP functionality.

## Optional bootstrap/import from local

If seeding Cloudways from local for the first time:

From repo root (with DDEV running):

```bash
./scripts/export-craft-db.sh
```

This writes `storage/backups/craft-export.sql`.

Then import on Cloudways:

```bash
mysql -h <host> -u <user> -p <database> < craft-export.sql
```

Finally run deploy command sequence above and sync uploads.
