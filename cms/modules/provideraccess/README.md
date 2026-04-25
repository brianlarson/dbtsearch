# Provider Access Module

Minimal Control Panel scoping for provider users in this project.

## What it does

- Targets users in group `providers`.
- Limits CP entry index results for sections:
  - `providers`: only provider entries related on the user `providers` field.
  - `locations`: only locations whose `provider` relation points at one of the user's providers.
- Blocks direct `edit-entry` / `save-entry` access to existing entries outside that scope.

This keeps provider reps focused on their own records without introducing a full ACL plugin yet.

## Project assumptions

The module currently assumes:

- User group handle: `providers`
- User relation field handle: `providers`
- Location -> Provider relation field handle: `provider`
- Target sections: `providers`, `locations`

If those handles change, update constants in `Module.php`.

## Wiring

Bootstrapped in `cms/config/app.php` as:

- module id: `provideraccess`
- bootstrap entry: `provideraccess`

## Notes and current limits

- New entry creation is intentionally not restricted in v1 (only existing-entry access is enforced).
- Scope is applied only in CP requests; front-end/site queries are unaffected.
- Non-admin users outside the `providers` group are unaffected.

## Quick verification

1. Log in as a provider-group user with one or more related provider entries.
2. Open `Entries -> Providers` and confirm only related providers are shown.
3. Open `Entries -> Locations` and confirm only locations for those providers are shown.
4. Try a direct URL to an out-of-scope entry edit screen and confirm a 403 response.

## Evolution path (module -> reusable plugin)

When this graduates to a reusable plugin, first extract:

- Handles/group/section mapping into plugin settings.
- Optional create-entry policy per section.
- Optional override permission (for managers/support staff).
- CP utility page for "effective scope" debugging per user.
