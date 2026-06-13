# CMS content model status (unstack branch)

This branch begins the native Craft content-model setup for removing Vue/GraphQL from the runtime path.

## What exists now in `cms/config/project/`

- **Splash content model** (already present):
  - Section: `splashPage` (Single, homepage)
  - Entry type: `Splash Page`
  - Fields: Plain Text, Basic Editor, Form, Images
- **New provider content model** (added on this branch):
  - Section: `providers` (Channel)
  - Entry type: `Provider` (`titleFormat: {name}`)
  - Fields:
    - `name`
    - `availability` (lightswitch)
    - `dbtaCertified` (lightswitch)
    - `address`
    - `city`
    - `state`
    - `zip`
    - `phone`
    - `email`
    - `website`
    - `providerLogo` (assets)

## Native directory baseline

- Added route: `/directory` via `cms/config/routes.php`
- Added template: `cms/templates/directory/index.twig`
  - Server-rendered provider list from `providers` section
  - Query-string filters:
    - `q` (search)
    - `availability=1` (available-only)

## Next steps

1. Sync project config into local Craft and verify field/query handles in CP.
2. Import or seed providers into the new `providers` section.
3. Replace placeholder styling with finalized native template system.
4. Add Sprig for partial refresh filtering (instead of Vue state).
5. Add Blitz cache strategy once query/URL behavior is finalized.
