# Craft CMS troubleshooting

## `php craft` on your Mac: “Craft can’t connect to the database” / `SQLSTATE[HY000] [2002]` / DSN shows `host=;`

**What it means:** Craft’s MySQL DSN has an **empty host** (`CRAFT_DB_SERVER` is not set when PHP runs). That usually happens when you run `php craft` **on the host** from `cms/` while `CRAFT_DB_*` is missing from the environment and from `.env`.

**Local fix (this repo):**

1. **`cms/.env`** should define DB settings for **host-side** CLI. While DDEV is running, MySQL 8 is published on the host at **`127.0.0.1:3306`** (see `.ddev/docker-compose.mysql.yaml`). Use the same database name, user, and password as in `.ddev/craft-mysql.env.web` (typically `craft` / `craft` / `craft`).
2. **`cms/bootstrap.php`** loads Dotenv with **`createUnsafeImmutable`**: variables **already set in the environment** (for example **`CRAFT_DB_SERVER=mysql8`** inside the DDEV web container) are **not** overwritten by `.env`. So you can keep `CRAFT_DB_SERVER=127.0.0.1` in `.env` for your Mac, and the control panel inside Docker still uses `mysql8`.

**Alternatives:**

- Run Craft CLI **inside** the web container: `ddev craft …` (wrapper in `.ddev/commands/web/craft`), or `ddev exec bash -c "cd cms && php craft …"`.
- Ensure **`ddev start`** is running before using `127.0.0.1:3306` on the host.

---

## DDEV web breaks after changing `.env` / DB

If the CP or front site suddenly cannot connect from **inside** DDEV, check that **`CRAFT_DB_SERVER=mysql8`** (and related vars) are still coming from the container environment. With **immutable** Dotenv, those should win over `127.0.0.1` in `.env`. If something preloads the wrong host into the environment before Craft boots, fix that layer (Docker, PHP-FPM pool env, etc.).

---

## Production (e.g. dbtsearch.org)

**Immutable Dotenv is safe for production:** if the host sets `CRAFT_DB_*` in the real environment, those values are used. If not, Craft reads them from **`.env`** on the server as usual.

**Do not deploy your laptop’s `cms/.env`** to production. Production should have its own credentials and DB host (see `cms/.env.example.production` and [HOSTING.md](HOSTING.md)).

**Deploy order (custom `modules/` code):** After `git pull`, run **`composer install`** (or at least **`composer dump-autoload`**) **inside `cms/` before any `php craft …` command.** The `sync` module is registered in `config/app.php` and PSR-4 autoloaded via `composer.json`; until Composer regenerates `vendor/composer/autoload_*.php`, PHP cannot load `modules\sync\Module`, and Craft fails with *Failed to instantiate component or class "modules\sync\Module"*. Also confirm the deploy artifact actually contains `cms/modules/sync/`.

---

## `Failed to instantiate component or class "modules\sync\Module"`

**Meaning:** PHP’s autoloader does not know that class when Craft merges `config/app.php` (the `sync` module is in `bootstrap`).

**Checklist:**

1. **Run Composer in `cms/` first** after every deploy that changes `composer.json` autoload or adds files under `cms/modules/`:
   `cd cms && composer install --no-dev --optimize-autoloader`
2. **Do not run `php craft` before that** on a fresh machine or right after pull (e.g. avoid `php craft db/restore … && composer install …` — swap the order, or run Composer before the whole chain).
3. **Verify `cms/modules/sync/Module.php` exists** on the server (rsync/git archive did not exclude `modules/`).
4. Use **`composer install`**, not `php composer install`, unless your host really exposes Composer that way.

---

## Optional: sync console commands

Bulk maintenance commands live in the `sync` module (`cms/modules/sync/`). Examples:

```bash
cd cms
php craft sync/sync/provider-locations
php craft sync/sync/repair-provider-emails
```

Run them from the host (with `.env` as above) or via `ddev craft …`.
