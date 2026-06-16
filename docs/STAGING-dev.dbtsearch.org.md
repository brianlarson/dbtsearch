# Staging deploy: dev.dbtsearch.org

Operational runbook for the Cloudways **dbtsearch_dev** app at [https://dev.dbtsearch.org](https://dev.dbtsearch.org).

General Cloudways workflow: [deploy-cloudways.md](deploy-cloudways.md).  
Flatten migration checklist: [CLOUDWAYS-FLATTEN-CHECKLIST.md](CLOUDWAYS-FLATTEN-CHECKLIST.md).

## Current state (2026-06-16)

| Item | Status |
|------|--------|
| Staging branch | `develop` (flattened Craft at repo root, docroot `web`) |
| Vue SPA archive | `archive/develop-vue-spa` (pre-flatten `develop`; reference only) |
| Cloudways dev app | `dbtsearch_dev` exists on server `1606631` (same IP as prod) |
| dev.dbtsearch.org | Resolves; HTTP basic auth enabled (401 without credentials) |
| SSH via `mm` | **Blocked** — key authorized for prod app only; dev app path returns Permission denied |
| `dev.cfg` | Needs post-flatten `REMOTE_PATH` and dev Cloudways app URL (see below) |

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
- Deploy the latest commit on that branch.

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

If staging DB is empty, refresh from production (sanitized) via Cloudways backup/restore or `pnpm mm -- pull` locally then `pnpm mm -- push:dev` after SSH is fixed.

### 5) `dev.cfg` (local, gitignored)

Update `scripts/migrate/dev.cfg`:

```ini
REMOTE_PATH=/home/master/applications/dbtsearch_dev/public_html
ASSET_DIRS=web/uploads
SITE_URL=https://dev.dbtsearch.org
APP_URL=https://unified.cloudways.com/apps/<DEV_APP_ID>/setting
PIPELINE_URL=https://unified.cloudways.com/apps/<DEV_APP_ID>/deployment
```

Replace `<DEV_APP_ID>` with the numeric app id from the Cloudways dev app URL (production is `6313253`; dev is a **different** app).

## Deploy sequence

### A) Cloudways panel

1. DB backup/snapshot of **dbtsearch_dev**.
2. Confirm webroot = `web`.
3. Confirm `.env` at app root with staging values above.
4. Git deploy → branch **`develop`** → **Deploy Now**.

### B) SSH on staging (app root)

```bash
pnpm mm -- ssh:dev
# or: ssh ... then cd /home/master/applications/dbtsearch_dev/public_html

./scripts/cloudways-post-deploy.sh
# or, if you prefer craft up:
# ./scripts/cloudways-post-deploy.sh --with-up
```

Quick sanity checks:

```bash
ls -la web craft config
php craft project-config/status
grep -E '^(CRAFT_ENVIRONMENT|PRIMARY_SITE_URL|CRAFT_WEB_ROOT)=' .env
```

### C) Smoke tests (with basic-auth credentials)

- [ ] `https://dev.dbtsearch.org/` — splash/home
- [ ] `https://dev.dbtsearch.org/directory` — directory + filters
- [ ] `https://dev.dbtsearch.org/admin` — Craft CP login
- [ ] Save a provider/location entry in CP
- [ ] CSS/images load (`/css/`, `/images/`, `/uploads/`)

## Rollback

1. Re-deploy previous commit in Cloudways Git deploy.
2. Restore DB snapshot if migrations ran.
3. Temporarily set webroot back to `cms/web` only if rolling back **before** flatten code is removed from branch.
4. `./scripts/cloudways-post-deploy.sh` and re-run smoke tests.

## After staging passes

Follow [CLOUDWAYS-FLATTEN-CHECKLIST.md](CLOUDWAYS-FLATTEN-CHECKLIST.md) section 4 for production: same commit hash, webroot `web`, update `production.cfg` paths to `public_html` + `web/uploads`, then post-deploy on prod.
