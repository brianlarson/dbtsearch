# Changelog

All notable changes to this project are documented in this file. Entries reflect the DBT Search app, Craft CMS module work, and legacy/story tooling in this monorepo.

## Unreleased

### Added

- Optional per-provider `logoBg` in the directory GraphQL mapping (forces light vs dark logo tile; Craft field handle `logoBg`).
- Dev-only route `/dev/logo-lab` for experimenting with logo treatments (production builds omit the route).
- `app/.env.example` placeholder for `VITE_PROVIDER_PORTAL_PASSWORD`.

### Changed

- Provider portal: refined sticky toolbar (border/shadow when content scrolls under it), delayed “pending changes” / Save–Reset visibility to reduce flicker, Logout moved next to session status, Manage link in header for portal mode, location blocks with collapsible edit, copy updates (“Available only”, “Accepting new clients”, local-save wording).
- Directory: default logo tile inferred as dark until the image loads; badge labels “Available” / “Adolescents”; footer attribution aligns with Craft (“DBT Search”, shortened Tiny Tree link on small screens).
- Cookie consent bar: dedicated accept styling aligned with portal save button; background tuned to the directory palette.
- Sticky directory toolbar: fixed `--directory-sticky-navbar-offset` between 576px and `lg` so the filter bar no longer sits below the real navbar.
- Craft CP: provider group users cannot submit `logo` or `logoBg` on provider entries via `save-entry` (admins still can).

### Chore

- Footer copyright line and availability label parity in Twig footers, legacy React components, Storybook kit, captured reference markup, and Playwright capture script comments.
