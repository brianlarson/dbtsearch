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
  - Header
  - Page intro
  - Filters
  - Provider card list

## Storybook mapping

- `Atoms/Buttons & Badges`
- `Atoms/Form Controls`
- `Molecules/Directory Filters`
- `Organisms/Provider Card`
- `Organisms/List States`
- `Pages/Directory Layout`

All stories are currently in `frontend/stories/` and use shared render helpers in `frontend/stories/directoryKit.js`.
