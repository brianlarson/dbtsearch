# Provider alpha — user testing (deferred)

Early directory alpha for **provider-side** updates will start with a tiny cohort before any wider invite:

- **Brian** (you)
- **Mary** — owner of [Tiny Tree Counseling](https://tinytreecounseling.com) (initial real-world tester)

## Intent

- Validate that a provider rep can **update availability** (and see it reflected on the public directory) with minimal friction.
- Prefer **Craft Control Panel** for the first round (scoped permissions, no custom provider UI yet). See discussion in the MVP planning thread.

## When you pick this up

1. Ensure Craft **Providers** + **Locations** sections exist and GraphQL can read them (`docs/CRAFT-DIRECTORY-SETUP.md`).
2. Create CP accounts for Brian and Mary in the **Provider editors** group. For alpha, keep access scoped manually/process-wise; availability is **per location**. Future stricter self-service can add user-managed locations plus an element-access plugin or small custom module.
3. Short written steps: log in → open entry → toggle → save → confirm on `/providers`.

*Content model for Providers/Locations is introduced via project config in `cms/config/project/` (apply with `php craft project-config/apply` in the target environment).*
