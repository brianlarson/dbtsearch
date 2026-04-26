# Legacy Parity Rules (MVP)

These rules keep the provider-facing UI near-identical to the legacy React/Finder screens.

## Scope

- Applies to provider-facing UI in `app/` (Vue app).
- Legacy source of truth is in `src/components/*` plus `docs/reference-markup/admin-edit.html`.

## Hard rules

1. No redesign.
   - Keep labels, visual hierarchy, and element ordering aligned with legacy.
2. No net-new UI elements without explicit approval.
   - Avoid "help text", extra chips, new controls, or moved action groups.
3. Preserve card and list rhythm.
   - Match legacy spacing cadence, badge placement, title/address/phone order, and action column position.
4. Keep templates presentational.
   - Data fetching/transform logic belongs in view/composable/adapter layers, not markup components.
5. Static-first, then wire data.
   - Approve markup with fixtures before connecting live Craft data.

## Allowed exceptions

- Accessibility/responsiveness fixes are allowed when necessary.
- Any intentional deviation must be documented in the PR notes with a short rationale.
