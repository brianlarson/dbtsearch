# Directory MVP — Preline Component Roundup

Component checklist for the Vue + Craft GraphQL directory MVP, based on legacy layout.

## Atoms

- **Buttons**
  - Primary CTA
  - Secondary/neutral
  - Outline
  - Subtle action button (Website/Email on provider cards)
- **Badges**
  - Availability
  - No Availability
  - DBT-A Certified
- **Form controls**
  - Search input
  - Text/email input
  - Select
  - Checkbox/toggle (availability)

## Molecules

- **Directory filter bar**
  - Availability toggle
  - Search field
  - Result count
- **Provider contact actions**
  - Phone link
  - Optional Website/Email actions

## Organisms

- **Provider card**
  - Logo/fallback mark
  - Availability/certification badges
  - Name/address/phone
  - Website/email actions
  - Last updated
- **List states**
  - Loading
  - Error + retry
  - Empty + reset filters

## Page

- **Directory layout frame**
  - Legacy-style header (logo + nav/actions)
  - Legacy-style decorative page header/hero image treatment
  - Filters
  - Provider card list
  - Footer (Tiny Tree attribution + copyright)

## Storybook mapping

- `Atoms/Directory/ButtonBadge`
- `Atoms/Directory/FormControls`
- `Molecules/Directory/DirectoryFilters`
- `Organisms/Directory/ProviderCard`
- `Organisms/Directory/ProviderList`
- `Organisms/Directory/ListStates`
- `Pages/DirectoryPageView`

All stories are currently in `frontend/stories/` and use shared render helpers in `frontend/stories/directoryKit.js`.
The helper file is intentionally aligned to class names and structure in:

- `app/src/components/directory/DirectoryFilters.vue`
- `app/src/components/directory/ProviderCard.vue`
- `app/src/components/directory/ProviderList.vue`
- `app/src/views/DirectoryPageView.vue`
