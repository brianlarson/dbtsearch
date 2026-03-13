# Stack-rewrite: first-run setup

Get Craft CMS and MySQL 8 running in DDEV on the `stack-rewrite` branch. Reference: GitHub issue “Stack rewrite — Craft CMS + DDEV”.

## Prerequisites

- You’re on the `stack-rewrite` branch.
- DDEV and Docker are installed and running.

## 1. Point DDEV at Craft’s web root

Craft will live in `cms/` with its public files in `cms/web`. Set DDEV’s docroot so it serves that folder:

```bash
ddev config --docroot=cms/web
```

(Or edit `.ddev/config.yaml` and set `docroot: cms/web`.)

## 2. Start DDEV (Postgres + MySQL 8)

This project adds a second database container (MySQL 8) for Craft. Start DDEV as usual:

```bash
ddev start
```

You’ll have:

- **Postgres** (legacy): `127.0.0.1:55432`, user `db`, database `db` — for the Node app when you’re on `main`.
- **MySQL 8** (Craft): `127.0.0.1:3306`, database `craft`, user `craft`, password `craft` — for Craft.

## 3. Install Craft CMS into `cms/`

From the **repo root**. If `cms/` exists but is empty (or only has `.gitkeep`), remove it so Composer can create a fresh project:

```bash
rm -rf cms
ddev composer create-project craftcms/craft cms --no-scripts
```

This creates the `cms/` directory with Craft, Composer deps, and the `web/` docroot.

## 4. Run Craft’s installer

Use Craft’s CLI installer and point it at the MySQL 8 service (host `mysql8` inside DDEV):

```bash
ddev craft install
```

When prompted:

- **Database driver:** MySQL
- **Database server:** `mysql8`
- **Database port:** `3306`
- **Database name:** `craft`
- **Database user:** `craft`
- **Database password:** `craft`
- Set **site URL** (e.g. `https://dbtsearch.ddev.site`), **admin** user, and site name as you like.

Or open the project URL in the browser and complete the web installer with the same DB settings.

## 5. Open the site

- **Front:** `https://dbtsearch.ddev.site` (or the URL DDEV shows).
- **Admin:** `https://dbtsearch.ddev.site/admin`

## Next

- Add a Nuxt (Vue + Vite + Tailwind) app (e.g. in `frontend/` or `app/`) and match one page from `docs/reference-markup/`.
- Track progress in GitHub Issues and mention the issue number in commits (e.g. `#12`).

## Switching back to the legacy app

```bash
git checkout main
ddev start
npm run server
npm run client
```

Legacy uses Postgres only; the Node app runs on your host.
