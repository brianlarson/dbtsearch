# Staging deploy: dev.dbtsearch.org

Operational runbook for the Cloudways **dbtsearch_dev** app at [https://dev.dbtsearch.org](https://dev.dbtsearch.org).

General Cloudways workflow: [deploy-cloudways.md](deploy-cloudways.md).  
Flatten migration checklist: [CLOUDWAYS-FLATTEN-CHECKLIST.md](CLOUDWAYS-FLATTEN-CHECKLIST.md).

## Deployment model

| Layer | Mechanism | Notes |
|---|---|---|
| **Code** | Push to **`develop`** → GitHub **CI** → **Deploy Staging** → Cloudways Git webhook | Replaces Buddy SFTP. Full repo deploy; frontend CSS must be committed under `web/css/`. |
| **Database + uploads** | **`pnpm mm`** (Mighty Migration) or Cloudways backup restore | Separate from code deploy. **Prod → local/staging only** — never staging → prod. |

GitHub Actions does **not** run `pnpm mm` (SSH creds in gitignored `.cfg`, interactive DB sync, DDEV). Operators run Mighty Migration locally when content needs refreshing.

## Current state (2026-06-16)

| Item | Status |
|------|--------|
| Staging branch | `develop` (flattened Craft at repo root, docroot `web`) |
| Vue SPA archive | `archive/develop-vue-spa` (pre-flatten `develop`; reference only) |
| Cloudways dev app | `dbtsearch_dev` exists on server `1606631` (same IP as prod) |
| dev.dbtsearch.org | Resolves; HTTP basic auth enabled (401 without credentials) |
| SSH via `mm` | **Blocked** — key authorized for prod app only; dev app path returns Permission denied |
| `dev.cfg` | Needs post-flatten `REMOTE_PATH` and dev Cloudways app URL (see below) |
| CI/CD | GitHub Actions (`.github/workflows/`) — Buddy pipeline retired |

Production is still on the pre-flatten layout (`public_html/cms`, docroot `cms/web`). Staging should validate flatten **before** prod rollout.

## Prerequisites (Cloudways panel)

Do these once before the first flatten deploy to staging.

### 1) SSH access to the dev app

In Cloudways → **dbtsearch_dev** app → **Application Settings → SSH/SFTP**:

- Add the same public key used for production (`~/.ssh/id_rsa.pub`).
- Keys are **per app**; prod access does not grant dev access.

Verify locally:

```bash
pnpm mm -- doctor
```

`Remote path: dev` should pass after the path fix below.

### 2) Git deploy branch

In Cloudways → **dbtsearch_dev** → **Deployment via Git**:

- Repository: this GitHub repo.
- Branch: **`develop`**
- Webroot: **`web`** (Application Settings → General)
- Deploy hook script: see [deploy-cloudways.md](deploy-cloudways.md#3-deploy-hook-script-cloudways-panel)
- Copy **Webhook URL** → GitHub secret `CLOUDWAYS_STAGING_DEPLOY_URL`

Pushes to `develop` trigger **CI**, then **Deploy Staging** (workflow_run). Manual redeploy: GitHub → Actions → **Deploy Staging** → Run workflow.

### 3) Document root

**Application Settings → General** → **Webroot**:

- Change from `cms/web` (or default) to **`web`**.

Save and allow Cloudways to regenerate vhost config.

### 4) Staging `.env` at app root

After flatten, `.env` lives at **`public_html/.env`** (not `public_html/cms/.env`).

Copy from [.env.example.staging](../.env.example.staging) and set at minimum:

```dotenv
CRAFT_ENVIRONMENT=staging
PRIMARY_SITE_URL="https://dev.dbtsearch.org"
CRAFT_WEB_ROOT="/home/master/applications/dbtsearch_dev/public_html/web"
CRAFT_DB_DRIVER=mysql
CRAFT_DB_SERVER=<from Cloudways Application Access>
CRAFT_DB_DATABASE=<dev db name>
CRAFT_DB_USER=<dev db user>
CRAFT_DB_PASSWORD=<dev db password>
CRAFT_SECURITY_KEY=<unique per environment>
CRAFT_APP_ID=<unique per environment>
CRAFT_DEV_MODE=false
CRAFT_ALLOW_ADMIN_CHANGES=false
CRAFT_DISALLOW_ROBOTS=true
```

Use **Application Access** in the Cloudways dev app panel for DB host/name/user/password. Do not copy production secrets.

### 5) `dev.cfg` (local, gitignored)

Update `scripts/migrate/dev.cfg` after flatten (copy from `dev.cfg.example` if needed):

```ini
REMOTE_PATH=/home/master/applications/dbtsearch_dev/public_html
ASSET_DIRS=web/uploads
SITE_URL=https://dev.dbtsearch.org
APP_URL=https://unified.cloudways.com/apps/<DEV_APP_ID>/setting
PIPELINE_URL=https://github.com/<org>/dbtsearch/actions/workflows/deploy-staging.yml
```

Replace `<DEV_APP_ID>` with the numeric app id from the Cloudways dev app URL (production is `6313253`; dev is a **different** app). `PIPELINE_URL` is documentation for `pnpm mm -- urls`; point it at the GitHub Actions staging deploy workflow (not Buddy).

If staging DB is empty, refresh from production (sanitized):

- **Cloudways:** restore production backup/snapshot to **dbtsearch_dev**, or
- **Local:** `pnpm mm -- pull` (prod → DDEV) then `pnpm mm -- push:dev` (local → staging) after SSH is fixed.

Never push staging DB to production.

## Deploy sequence

### A) Automatic (normal code deploy)

1. Merge to **`develop`** (frontend CSS committed if templates changed).
2. GitHub **CI** runs: `build:directory`, `build:splash`, `verify:directory-css`, `composer validate`.
3. **Deploy Staging** POSTs Cloudways webhook → Git pull + deploy hook on server.
4. Run smoke tests (below).

Optional: Cloudways application snapshot before risky migrations.

### B) Manual code redeploy

- GitHub → Actions → **Deploy Staging** → **Run workflow**, or
- Cloudways → **Deployment via Git** → **Deploy Now** (same hook script runs).

### C) Content / DB refresh (not every code deploy)

When staging needs to match production content:

```bash
ddev start
pnpm mm -- pull          # prod → local
pnpm mm -- push:dev      # local → staging (confirm prompts)
# or: pnpm mm -- push:dev:all for uploads too
```

Or restore prod DB snapshot in Cloudways panel to **dbtsearch_dev**.

After a DB import on staging, the deploy hook’s `php craft up` (on next code deploy) or manual SSH:

```bash
pnpm mm -- ssh:dev
composer install --no-dev --optimize-autoloader
php craft up --interactive=0
php craft clear-caches/all --interactive=0
```

### D) SSH sanity checks (app root)

```bash
pnpm mm -- ssh:dev

ls -la web craft config
php craft project-config/status
grep -E '^(CRAFT_ENVIRONMENT|PRIMARY_SITE_URL|CRAFT_WEB_ROOT)=' .env
```

### E) Smoke tests (with basic-auth credentials)

- [ ] `https://dev.dbtsearch.org/` — splash/home
- [ ] `https://dev.dbtsearch.org/directory` — directory + filters
- [ ] `https://dev.dbtsearch.org/admin` — Craft CP login
- [ ] Save a provider/location entry in CP
- [ ] CSS/images load (`/css/`, `/images/`, `/uploads/`)

## Rollback

**Code:** Re-deploy previous commit (GitHub **Deploy Staging** after resetting `develop`, or Cloudways **Deploy Now** on prior commit).

**Database:** Restore Cloudways DB snapshot if migrations ran; or `pnpm mm -- rollback:dev` if the last change was an mm push.

Re-run post-deploy Craft commands and smoke tests.

## After staging passes

Follow [CLOUDWAYS-FLATTEN-CHECKLIST.md](CLOUDWAYS-FLATTEN-CHECKLIST.md) section 4 for production: same commit hash, webroot `web`, update `production.cfg` paths to `public_html` + `web/uploads`, configure **Deploy Production** workflow and `CLOUDWAYS_PROD_DEPLOY_URL`, then post-deploy on prod.

## Retiring Buddy

Disable the Buddy **DBT Search Development** pipeline after the first successful GitHub Actions staging deploy. The repo no longer includes `.buddy/` pipeline YAML.
