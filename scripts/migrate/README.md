# 🦸🏻‍♀️ Mighty Migration

DB & asset sync for **Craft CMS** across **production**, **local DDEV**, and **dev**.
Pull from production or dev into local DDEV; push from local to dev only — production is never a write target.

`mm` is a set of dependency-free Python 3 CLI scripts that install into any Craft project at `scripts/migrate/`. Contractors and full-time devs alike use `mm`; only full-time devs use the internal fleet tool `mc` (Mighty Command).

## 📚 Documentation

Full docs run locally with live search:

```bash
pnpm docs   # http://localhost:3366
```

The docs live in [`_README/`](_README/):

- [Getting Started](_README/getting-started.md) — install, registry auth, SSH, setup wizard
- [Commands](_README/commands.md) — full command + flag reference
- [Workflows](_README/workflows.md) — common recipes
- [Contractor Onboarding](_README/contractors.md) — feasibility + provisioning checklist
- [Troubleshooting](_README/troubleshooting.md) — Cloudways, SSH, Craft version drift
- [Why Mighty Migration](_README/why.md) — rationale / TL;DR
- [Roadmap](_README/roadmap.md)

## ⚡ Quick start

```bash
# 1. One-time registry auth (per machine) — needs a GitHub PAT with read:packages
npm config set //npm.pkg.github.com/:_authToken ghp_YOUR_TOKEN

# 2. Install into a project (add .npmrc with @mightycitizen registry first)
pnpm add -D @mightycitizen/mighty-migration && pnpm approve-builds @mightycitizen/mighty-migration && pnpm rebuild @mightycitizen/mighty-migration

# 3. Configure SSH + connection details
python3 scripts/migrate/mm-setup.py

# 4. Refresh local from production
ddev start && pnpm mm -- pull
```

Drop-in without adding a dependency: `npx @mightycitizen/mighty-migration@latest`

See [Getting Started](_README/getting-started.md) for the full walkthrough, registry setup, and CI configuration.

## 🎛️ Core commands

```bash
pnpm mm                   # command reference
pnpm mm -- pull           # refresh local DB from production
pnpm mm -- pull:all       # DB + assets from production
pnpm mm -- push:dev       # push local DB to the dev server
pnpm mm -- rollback       # undo a pull/push from an auto-snapshot
pnpm mm -- doctor         # pre-flight diagnostics
```

Full reference and every flag: [Commands](_README/commands.md).

## 🛡️ Safety model

- **No production pushes** — all pushes go to dev only.
- **Snapshot before every import** — pre-pull/pre-push snapshots in `storage/backups/` (up to 5 per type); recover with `pnpm mm -- rollback`.
- **Dry-run + confirm** — DB and asset syncs show a size estimate and require confirmation before transferring.

More on the rationale: [Why Mighty Migration](_README/why.md).

## 🧳 Existing projects (migrating off git+ssh)

```bash
pnpm remove mighty-migration
pnpm add -D @mightycitizen/mighty-migration && pnpm approve-builds @mightycitizen/mighty-migration && pnpm rebuild @mightycitizen/mighty-migration
```

Ensure an `.npmrc` in the project root:

```ini
@mightycitizen:registry=https://npm.pkg.github.com
```

The postinstall hook overwrites the Python files with the latest versions; the setup wizard adds the `mm` script to `package.json`. Your `.cfg` files are never touched — they live only on disk and are gitignored.

---

🦾 _Created and maintained by [Mighty Citizen](https://www.mightycitizen.com) with the help of an AI robot buddy_
