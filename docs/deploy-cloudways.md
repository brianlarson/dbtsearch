# Cloudways environment workflow (staging + production)

This runbook is the recommended way to connect environments for DBT Search on Cloudways while keeping production safe.

Craft lives at the **app/repo root** (docroot `web/`). Staging app runbook: [STAGING-dev.dbtsearch.org.md](STAGING-dev.dbtsearch.org.md). Flatten checklist (one-time migration from the old `cms/` layout): [CLOUDWAYS-FLATTEN-CHECKLIST.md](CLOUDWAYS-FLATTEN-CHECKLIST.md).

## Two deployment tools (do not conflate)

| Concern | Tool | What moves | Typical direction |
|---|---|---|---|
| **Code** (templates, PHP, config, committed CSS/JS in `web/css/`) | **Cloudways Git deploy** + GitHub Actions | Git branch → server filesystem | `develop` → staging; release branch → production |
| **Database + uploads** (Craft content, `web/uploads/`) | **Mighty Migration** (`pnpm mm`) | SSH/rsync + mysqldump | **Production → local**; **local → dev/staging only** |

**Git deploy does not sync the database or media.** After a code deploy, Craft runs migrations against whatever DB is already on that server. Refresh staging content from production with Cloudways backup/restore or `pnpm mm -- pull` then `pnpm mm -- push:dev` (see below).

**Never push staging/dev DB to production.** Mighty Migration enforces this (no `push:prod`); do not use Cloudways restore to copy staging → prod either.

### Why GitHub Actions does not run `pnpm mm`

Mighty Migration is **local/operator tooling only**:

- SSH keys and server paths live in gitignored `scripts/migrate/*.cfg` (never commit credentials).
- Pull/push prompts for confirmation and often needs DDEV running locally.
- DB/asset sync is intentional and separate from every code push.

CI and deploy workflows only build/verify frontend assets and trigger Cloudways Git webhooks.

## Recommendation

Use **staging-first** deployment:

1. Keep **production** stable.
2. Create/maintain a separate **staging app** in Cloudways.
3. Deploy and validate on staging first (GitHub Actions → Cloudways webhook).
4. Promote the same commit to production (manual workflow).

## Environment roles

| Environment | Purpose | Allowed DB writes | Notes |
|---|---|---:|---|
| Local / DDEV | Active development, schema and template iteration | Yes (local only) | Fast loops and Craft CP work; refresh from prod via `pnpm mm -- pull` |
| GitHub Actions | CI + deploy webhooks | No DB access | Builds frontend, validates composer, POSTs Cloudways deploy URL |
| Cloudways Staging | Integration/UAT | Yes (staging only) | Mirrors prod stack; code via Git, content via prod refresh |
| Cloudways Production | Live traffic | Yes (prod only) | Deploy-only, no ad-hoc schema edits |

## Connect environments safely

### Do connect
- Git repo → Cloudways app deploy (webhook from GitHub Actions).
- Staging and production each with their own `.env`.
- Controlled content sync: **production → staging/local** (sanitized when needed) via `pnpm mm` or Cloudways backup restore.

### Do not connect directly
- Local or CI directly writing to production DB.
- Staging DB cloned back into production.
- Secrets shared across all environments.
- Buddy SFTP or ad-hoc file uploads (replaced by Git deploy).

---

## First-time Cloudways panel setup

### 1) Provision apps

- Create **two Cloudways apps** (same or separate servers):
  - `dbtsearch_dev` (staging) — [STAGING-dev.dbtsearch.org.md](STAGING-dev.dbtsearch.org.md)
  - Production app (pre-flatten layout until prod cutover)
- PHP 8.2+ and MySQL 8.
- Set web root/docroot to **`web`** (staging must use flattened layout).

### 2) Configure Git deploy (each app)

In Cloudways → **Application** → **Deployment via Git**:

1. Connect this GitHub repository (deploy keys or OAuth as Cloudways prompts).
2. **Staging:** branch **`develop`**. **Production:** release branch (e.g. `main`) when ready.
3. Set **Deployment Path** / application root to the app root (`public_html`), not `cms/`.
4. Paste the **deploy hook script** below into the deploy/post-deploy script field.
5. Copy the **Webhook URL** — used for GitHub secrets (staging vs production URLs differ).

### 3) Deploy hook script (Cloudways panel)

Run from app root (`public_html`) after each Git pull. Matches the former Buddy SSH steps (composer, backup, craft up, backup, caches):

```bash
#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

composer install --no-dev --optimize-autoloader --no-interaction

php craft db/backup storage/backups/previous.sql --overwrite=1 --zip=1 --interactive=0
php craft up --interactive=0
php craft db/backup storage/backups/latest.sql --overwrite=1 --zip=1 --interactive=0
php craft clear-caches/all --interactive=0
```

Alternative if your team prefers explicit project-config/migrate steps:

```bash
composer install --no-dev --optimize-autoloader --no-interaction
php craft project-config/apply --force --interactive=0
php craft migrate/all --interactive=0
php craft clear-caches/all --interactive=0
```

Take a Cloudways **application snapshot** before the first run with migrations.

### 4) Per-environment `.env`

Create `.env` on each app from the matching template (`.env.example.staging` or `.env.example.production`) with env-specific values:

- `CRAFT_ENVIRONMENT=staging` or `CRAFT_ENVIRONMENT=production`
- `CRAFT_DB_DRIVER=mysql`
- `CRAFT_DB_SERVER=<cloudways-mysql-host>`
- `CRAFT_DB_PORT=3306`
- `CRAFT_DB_DATABASE=<db-name>`
- `CRAFT_DB_USER=<db-user>`
- `CRAFT_DB_PASSWORD=<db-password>`
- `PRIMARY_SITE_URL=<staging-or-prod-url>`
- `CRAFT_WEB_ROOT=<absolute-path-to-web>` (e.g. `.../public_html/web`)
- `CRAFT_APP_ID=<app-id>` (can differ by environment)
- `CRAFT_SECURITY_KEY=<unique-secret>` (per environment)
- `CRAFT_DEV_MODE=false`
- `CRAFT_ALLOW_ADMIN_CHANGES=false`
- `CRAFT_DISALLOW_ROBOTS=true` (staging) or `false` (production)

Also set `RESEND_API_KEY` and any other secrets per environment.

### 5) Mighty Migration (`pnpm mm`) — local setup

Mighty Migration scripts live in `scripts/migrate/` (gitignored; installed via `@mightycitizen/mighty-migration`). Config files **`dev.cfg`** and **`production.cfg`** are local only — copy from `*.cfg.example` and run:

```bash
pnpm mm -- setup    # first time
pnpm mm -- doctor   # verify SSH, paths, Craft versions
```

**Post-flatten path updates** (required for staging):

| Setting | Staging (`dev.cfg`) | Production (`production.cfg`) |
|---|---|---|
| `REMOTE_PATH` | `/home/master/applications/dbtsearch_dev/public_html` | `/home/master/applications/<prod_app>/public_html` (not `.../cms`) |
| `ASSET_DIRS` | `web/uploads` | `web/uploads` |
| `SITE_URL` | `https://dev.dbtsearch.org` | Production site URL |
| `PIPELINE_URL` | GitHub Actions staging deploy workflow URL | GitHub Actions production deploy workflow URL |

Add the dev app SSH public key in Cloudways → **dbtsearch_dev** → SSH/SFTP (keys are **per app**).

Common commands:

```bash
pnpm mm -- pull              # prod DB → local DDEV
pnpm mm -- pull:all          # prod DB + image assets → local
pnpm mm -- push:dev          # local DB → staging (dev app only)
pnpm mm -- push:dev:all      # local DB + assets → staging
pnpm mm -- ssh:dev           # SSH to staging app root
pnpm mm -- doctor            # pre-flight checks
```

See `scripts/migrate/README.md` (local) for full command reference.

---

## GitHub Actions (repo)

Workflows in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|---|---|---|
| **CI** (`ci.yml`) | PR and push to `develop` | `pnpm` build in `frontend/`, `verify:directory-css`, `composer validate` |
| **Deploy Staging** (`deploy-staging.yml`) | After CI succeeds on `develop`; manual `workflow_dispatch` | `POST` Cloudways staging webhook |
| **Deploy Production** (`deploy-production.yml`) | Manual `workflow_dispatch` only | `POST` Cloudways prod webhook; requires GitHub **production** environment |

Frontend CI runs: `build:directory`, `build:splash`, `verify:directory-css` (see `frontend/package.json`). Committed outputs live in `web/css/` — the server does not run Node builds.

### GitHub secrets and settings

| Secret | Used by | How to obtain |
|---|---|---|
| `CLOUDWAYS_STAGING_DEPLOY_URL` | Deploy Staging | Cloudways → **dbtsearch_dev** → Deployment via Git → **Webhook URL** |
| `CLOUDWAYS_PROD_DEPLOY_URL` | Deploy Production | Cloudways → production app → Deployment via Git → **Webhook URL** |

Add repository secrets under **Settings → Secrets and variables → Actions**. For production, prefer **Settings → Environments → production → Environment secrets** so deploys require approval.

Optional: create a GitHub **production** environment with required reviewers before `Deploy Production` can run.

Do **not** add SSH passwords, `.cfg` contents, or Cloudways API keys to the repo.

---

## Migration checklist (Buddy → Cloudways Git + GHA)

Complete in order; panel steps are manual.

- [ ] **Cloudways staging:** Git deploy connected, branch `develop`, webroot `web`, deploy hook script saved.
- [ ] **Cloudways staging:** `.env` at app root; DB populated (Cloudways prod→staging restore or `pnpm mm -- pull` + `pnpm mm -- push:dev` after SSH fixed).
- [ ] **Mighty Migration:** Update `dev.cfg` `REMOTE_PATH`, `SITE_URL`, `ASSET_DIRS`, `PIPELINE_URL`; run `pnpm mm -- doctor`.
- [ ] **GitHub:** Add `CLOUDWAYS_STAGING_DEPLOY_URL`; merge a PR to `develop` and confirm CI passes.
- [ ] **GitHub:** Confirm **Deploy Staging** runs after CI and staging site updates.
- [ ] **Smoke test** staging (see [STAGING-dev.dbtsearch.org.md](STAGING-dev.dbtsearch.org.md)).
- [ ] **Production (when ready):** Git deploy on prod app, deploy hook, `CLOUDWAYS_PROD_DEPLOY_URL`, production environment protection; update `production.cfg` paths for flatten.
- [ ] **Cancel Buddy:** Disable or delete the **DBT Search Development** pipeline after the first successful GHA staging deploy. Remove `.buddy/` from the repo (already removed).

---

## Content and media sync policy

### Database

- Source of truth for live content is **production**.
- Refresh staging from production on a schedule or before major QA (`pnpm mm -- pull` locally, or Cloudways backup restore on staging).
- Sanitize sensitive/user data before broader access.
- **Never** `push:dev` or restore staging snapshot **to** production.

### Assets

- Keep `web/uploads/` in sync with the matching DB snapshot.
- Prefer **production → staging/local** via `pnpm mm -- pull:all` / `push:dev:all` or Cloudways restore — never push staging uploads to production.

---

## Release flow

1. Develop locally (DDEV); refresh content with `pnpm mm -- pull` when needed.
2. Build frontend locally if templates changed: `cd frontend && pnpm run build:directory` (CI enforces committed CSS).
3. Merge feature branch to **`develop`** → CI → auto **Deploy Staging**.
4. Run smoke checks on staging (see staging runbook).
5. Optionally seed staging with fresh prod content before QA (`pnpm mm -- pull` + `pnpm mm -- push:dev` or Cloudways restore).
6. Promote same commit to **production** via **Deploy Production** workflow (manual).
7. Post-deploy smoke checks on production.

---

## Production safety rules

- No schema changes directly in production CP.
- All schema changes are made in dev, committed, then applied via deploy hook (`craft up`).
- Always take a backup snapshot before production deploy.
- Use maintenance/low-traffic windows for risky schema updates.

---

## Rollback playbook

If production deploy fails:

1. Re-deploy previous known-good commit (Cloudways Git deploy or GitHub **Deploy Production** on that commit after resetting branch).
2. Restore DB snapshot if migration/content state is inconsistent.
3. Clear caches (`php craft clear-caches/all`).
4. Verify front-end routes + CP functionality.

For local/staging DB mistakes after `pnpm mm`, use `pnpm mm -- rollback` or `pnpm mm -- rollback:dev`.

---

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

Finally run deploy command sequence above and sync uploads (or `pnpm mm -- push:dev:all` to staging only).
