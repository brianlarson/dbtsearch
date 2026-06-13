# CMS content model status (unstack branch)

This branch now aligns to the previously committed Craft directory model from `feat/next` instead of introducing a new flat provider schema.

## What exists now in `cms/config/project/`

- **Splash content model** (existing):
  - Section: `splashPage` (Single, homepage)
  - Entry type: `Splash Page`
  - Fields: Plain Text, Basic Editor, Form, Images
- **Directory content model** (reused from existing repo work):
  - Sections:
    - `providers` (Channel)
    - `locations` (Channel)
  - Entry types:
    - `providers`
    - `location`
  - Core fields:
    - provider metadata: `logo`, `email`, `urlField`, `dbtaCertified`
    - relations: `locations` (provider -> locations), `provider` (location -> provider)
    - location availability: `availability`
    - taxonomy: `specialties`, `credentials`, `dbtAdherentTeam`
    - import keys: `sourceProviderId`, `sourceLocationId`

## Native directory baseline

- Route: `/directory` via `cms/config/routes.php`
- Template: `cms/templates/directory/index.twig`
  - server-rendered provider list from `providers`
  - availability determined from related `locations`
  - query-string filters:
    - `q` (search)
    - `availability=1` (available-only)

## Notes

- Setup reference restored to this branch: `docs/CRAFT-DIRECTORY-SETUP.md`
- This avoids rebuilding content modeling work that already existed on other branches.

## Next steps

1. Sync project config in Craft and verify section/field handles in CP.
2. Import/seed provider and location data using existing source-id workflow.
3. Continue native template parity work (header/filter/card/footer), preserving current styling and markup conventions.
4. Add Sprig for partial refresh interactions.
5. Add Blitz caching after URL/filter behavior is finalized.
