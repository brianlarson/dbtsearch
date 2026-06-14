# Cloudways checklist: migrate from `cms/web` to `web` docroot

Use this when promoting the repo change that flattened Craft from `cms/` to repo root.

## Goal

- Keep production stable.
- Validate the flatten in Cloudways **staging** first.
- Promote to production only after staging passes.

## Preconditions

- Branch/commit includes root-level Craft files (`craft`, `composer.json`, `config/`, `templates/`, `web/`).
- Cloudways app is using Git deploy.
- You have DB backup/snapshot access.

---

## 1) Staging first (required)

1. Take a DB backup/snapshot of staging.
2. In Cloudways **Staging app settings**, change document root to:
   - `web`
3. Ensure staging `.env` is at app root and still valid for this app.
4. Deploy the flatten commit to staging.

---

## 2) Run post-deploy sequence on staging

From app root:

```bash
./scripts/cloudways-post-deploy.sh
```

If your team standard is `craft up`:

```bash
./scripts/cloudways-post-deploy.sh --with-up
```

Manual fallback:

```bash
composer install --no-dev --optimize-autoloader
php craft project-config/apply --force --interactive=0
php craft migrate/all --interactive=0
php craft clear-caches/all --interactive=0
```

---

## 3) Staging verification checklist

- [ ] Front page (`/`) loads.
- [ ] Directory page (`/directory`) loads and filters work.
- [ ] Craft CP (`/admin`) loads and login works.
- [ ] Saving a provider/location entry works.
- [ ] Splash CSS and images load from `/web/css` and `/web/images`.
- [ ] No 404s for static assets after cache clear.

Quick SSH checks:

```bash
ls -la web
ls -la config
php craft project-config/status
```

---

## 4) Production rollout

After staging passes:

1. Take production backup/snapshot.
2. Set production document root to `web`.
3. Deploy the exact same commit hash used in staging.
4. Run the same post-deploy helper.
5. Run the same smoke tests on production.

---

## 5) Rollback plan

If production fails:

1. Re-deploy previous known-good commit.
2. Restore DB snapshot if migration state/content is inconsistent.
3. Clear caches.
4. Confirm `/`, `/directory`, `/admin`, and asset URLs.

---

## Notes

- This checklist is specific to the repo flatten from `cms/` to root.
- General staging/prod deployment workflow is documented in:
  - [deploy-cloudways.md](deploy-cloudways.md)
