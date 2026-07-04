# 🦸🏻‍♀️ Mighty Migration

Scripts for syncing database and assets between **production**, **local DDEV**, and **dev** environments.
Pull from production or dev into local DDEV, push from local to dev only.

## 📦 Installation

### Quick install (drop-in)

If you just need the scripts without adding MM as a project dependency:

```bash
npx @mightycitizen/mighty-migration@latest
```

This copies the migration scripts to `scripts/migrate/` and exits. No `package.json` changes, no dependency to maintain. Ideal for contractors or one-off projects.

> Requires the GitHub Packages registry setup (see below). Run again anytime to update to the latest version.

### One-time registry setup

Mighty Migration is published to **GitHub Packages**. Each developer needs to authenticate once:

1. [Create a GitHub Personal Access Token](https://github.com/settings/tokens) (classic) with the `read:packages` scope
2. Add it to your user-level npm config:

```bash
npm config set //npm.pkg.github.com/:_authToken ghp_YOUR_TOKEN_HERE
```

> This stores the token in `~/.npmrc`. You only need to do this once per machine.

### Install into a project

```bash
pnpm add -D @mightycitizen/mighty-migration && pnpm approve-builds @mightycitizen/mighty-migration && pnpm rebuild @mightycitizen/mighty-migration
```

> pnpm blocks postinstall scripts by default. `approve-builds` whitelists the package, and `rebuild` explicitly re-runs the postinstall hook to copy the scripts — more reliable than `pnpm install`, which skips the hook if the lockfile is already up to date.

Add this `.npmrc` to your project root so pnpm knows where to find the package:

```ini
@mightycitizen:registry=https://npm.pkg.github.com
```

**To update scripts in an existing project:**

```bash
pnpm update @mightycitizen/mighty-migration && pnpm rebuild @mightycitizen/mighty-migration
```

**If `scripts/migrate/` files are missing after install**, run this to force the hook:

```bash
pnpm rebuild @mightycitizen/mighty-migration
```

### CI setup (Buddy, GitHub Actions, etc.)

Add a `NPM_TOKEN` environment variable to your CI pipeline with a GitHub PAT that has `read:packages` scope. Then prepend this to your install step:

```bash
echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc
```

---

## 🪄 Setup

After installation, run the setup wizard — this adds the `mm` script to your `package.json` and configures SSH connections:

```bash
python3 scripts/migrate/mm-setup.py
```

The wizard will:
- Add the `mm` command to your `package.json` (one-time)
- Prompt for SSH connection details and remote paths for production and dev, with sensible defaults
- Write `production.cfg` and `dev.cfg` for you
- Remind you to add your public SSH key to the server application

> After setup, run `pnpm mm -- setup` to re-run the wizard.

**Or configure manually:**

```bash
cp scripts/migrate/production.cfg.example scripts/migrate/production.cfg
cp scripts/migrate/dev.cfg.example scripts/migrate/dev.cfg
# Edit each file and fill in your server details
```

> `*.cfg` files are gitignored — never commit them.

**SSH key requirement:** Before running any `mm-` command, add your public SSH key to the server application (e.g. the Cloudways SSH Keys panel). Without this, all remote commands will fail with a `Permission denied` error.

```bash
cat ~/.ssh/id_rsa.pub   # copy this and paste into the server's Authorized Keys
```

Make sure DDEV is running before pulling: `ddev start`

---

## 🎛️ Commands

All commands go through a single `mm` entry point. Run `pnpm mm` for a quick reference.

```
pnpm mm -- <command> [flags]
```

### Pull from production → local

| Command | What it does |
|---|---|
| `pnpm mm -- pull` | DB + `composer install` + `craft up` |
| `pnpm mm -- pull:assets` | Assets only (images by default) |
| `pnpm mm -- pull:all` | DB + assets |

### Pull from dev → local

| Command | What it does |
|---|---|
| `pnpm mm -- pull:dev` | DB from dev + `composer install` + `craft up` |
| `pnpm mm -- pull:dev:assets` | Assets only from dev (images by default) |
| `pnpm mm -- pull:dev:all` | DB + assets from dev |

> **Asset commands** run a dry-run first and show a size estimate before asking `Proceed with sync?` — nothing transfers until you confirm.

### Push local → dev server

| Command | What it does |
|---|---|
| `pnpm mm -- push:dev` | DB only by default (use `--with-craft` to run `composer install` + `php craft up`) |
| `pnpm mm -- push:dev:assets` | Assets only (images by default) |
| `pnpm mm -- push:dev:all` | DB + assets |

> **Asset commands** run a dry-run first and show a size estimate before asking `Proceed with push?` — nothing transfers until you confirm.

### Open URLs

| Command | What it does |
|---|---|
| `pnpm mm -- open:dev` | Open dev app URL in the browser |
| `pnpm mm -- open:dev:server` | Open dev Cloudways server dashboard |
| `pnpm mm -- open:prod` | Open production app URL |
| `pnpm mm -- open:prod:server` | Open production Cloudways server dashboard |

> Configure `APP_URL` and `SERVER_URL` in your `.cfg` files (see examples).

### SSH

| Command | What it does |
|---|---|
| `pnpm mm -- ssh:dev` | SSH into the dev server (interactive shell) |
| `pnpm mm -- ssh:prod` | SSH into the production server (interactive shell) |

> Drops you into the project root on the server, shows the current directory and `ENVIRONMENT` from `.env`.

### Setup & diagnostics

| Command | What it does |
|---|---|
| `pnpm mm -- setup` | Interactive setup wizard |
| `pnpm mm -- doctor` | Pre-flight diagnostics |
| `pnpm mm -- versions` | Compare PHP, DB, Craft, and plugin versions across environments |

### Rollback

| Command | What it does |
|---|---|
| `pnpm mm -- rollback` | Restore local DDEV database from a pre-pull or pre-push snapshot |
| `pnpm mm -- rollback:dev` | Restore dev server database from a pre-push snapshot (via SSH) |

> Snapshots are created automatically before each pull import and push operation. Up to 5 are kept per type.

### Help

| Command | What it does |
|---|---|
| `pnpm mm` or `pnpm mm -h` | Show full command reference |
| `pnpm mm -- help <command>` | Show detailed help for a specific command |

### Flags

Append flags after the command:

```bash
# Filter by file type
pnpm mm -- pull:assets --filter images   # images only (default)
pnpm mm -- pull:assets --filter pdfs     # PDFs only
pnpm mm -- pull:assets --filter all      # all files

# Sync only a specific subdirectory within web/uploads
pnpm mm -- pull:assets --subdir generalImages

# Same flags work for push and pull:dev
pnpm mm -- push:dev:assets --subdir generalImages --filter pdfs
```

| Flag | What it does |
|---|---|
| `--skip-craft` | Skip remote `composer install` + `craft up` after DB import |
| `--skip-fresh-backup` | Skip "Create fresh backup?" prompt (push only) — use when `latest.sql` is already fresh |
| `--dry-run` | Preview what the DB push/pull would do without making any changes |
| `--delete` | Delete destination files that no longer exist on the source (useful after volume moves) |
| `--yes` / `-y` | Auto-confirm all prompts (skip interactive confirmations) |
| `--quiet` / `-q` | Compatibility flag for pull/push (currently no-op) |



## 🔃 Typical workflow

```bash
pnpm mm -- pull          # refresh local from production
# test locally...
pnpm mm -- push:dev      # push to dev server for review
pnpm mm -- rollback      # undo a pull/push if something went wrong
pnpm mm -- ssh:dev       # SSH in to check the server
```



## 📝 Notes

- DB transfers are gzip compressed for speed
- Pre-pull and pre-push snapshots are saved automatically to `storage/backups/` before each import (up to 5 per type). Run `pnpm mm -- rollback` to restore from a snapshot
- Interrupted transfers resume automatically (`--partial`)
- SSH key is added to the agent automatically on first run if needed
- macOS users: run `ssh-add --apple-use-keychain ~/.ssh/your_key` + add `UseKeychain yes` to `~/.ssh/config` to avoid the passphrase prompt permanently

## 🧳 Existing projects

If you were previously using the git+ssh install method, migrate to the GitHub Packages version:

```bash
pnpm remove mighty-migration
pnpm add -D @mightycitizen/mighty-migration && pnpm approve-builds @mightycitizen/mighty-migration && pnpm rebuild @mightycitizen/mighty-migration
```

Make sure you have an `.npmrc` in your project root:

```ini
@mightycitizen:registry=https://npm.pkg.github.com
```

The postinstall hook overwrites the Python files with the latest versions. The setup wizard adds the `mm` script to your `package.json`. Your `.cfg` files are never touched — they live only on disk and are gitignored.

---

🦾 _Created and maintained by [Mighty Citizen](https://www.mightycitizen.com) with the help of a AI robot buddy_
