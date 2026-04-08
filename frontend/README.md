# DBT Search — Frontend (Storybook + Tailwind + Preline)

Markup and UI stories for the stack-rewrite frontend. Uses **Storybook** (HTML), **Tailwind CSS v4**, and **Preline UI** with a custom theme so the brand color (`#bbcefd`) is used as the primary.

### Parity model (Tailwind → Vue)

**Goal:** strong visual and structural alignment with the product—not pixel-perfect match to the old **Bootstrap/Finder** captures in `docs/reference-markup/`. Those files inform hierarchy, copy, and patterns; the **Vue app** implements the UI with **Tailwind** (`app/`).

1. **Primary:** Tailwind stories — especially **`Layouts/Vue/LegacyContent`** (shell matching `LegacyContentLayout.vue`) and **directory** stories driven by `stories/directoryKit.js` / related kits.
2. **Secondary:** **`Pages/Reference Screens`** and **`Atoms/Reference/Finder`** — HTML aligned to captured markup for regression context; no obligation to duplicate Bootstrap in Vue.

**Workflow:** adjust spacing/tokens/components in Tailwind stories first, then apply the same decisions in `app/src/components/directory/*`.

## Run Storybook

```bash
cd frontend
pnpm install
pnpm run storybook
```

Open http://localhost:6006. Logo and hero image are in `frontend/public/images/` (copied from repo `public/images/` so Storybook can serve them at `/images/`).

## Stack

- **Tailwind CSS v4** — via `@tailwindcss/vite`; config is in `src/index.css` (no `tailwind.config.js`).
- **Preline UI** — components and variants; base theme + **DBT Search theme** in `themes/dbtsearch.css` (sets `--primary` and `--color-brand` to `#bbcefd`).
- For interactive Preline components (dropdowns, modals, etc.) in a real app, add `<script src="node_modules/preline/dist/preline.js"></script>` (or the bundled equivalent) so their JS runs.

## Stories

- **Pages/Splash Page** — Landing/splash page with form fields: name, email, provider name. Content (heading, tagline, form heading, submit label) is driven by Craft Single section “Splash Page”; see `docs/SPLASH-PAGE-CRAFT.md`.
- **Layouts/Vue/LegacyContent** — Full Tailwind shell matching `app/.../LegacyContentLayout.vue` (`legacyVueLayoutKit.js`). **Start here** for inner-page chrome before changing Vue.
- **Pages/DirectoryPageView** — Directory page with Finder/Bootstrap kit (`directoryKit.js`); pair with Vue `DirectoryPageView` for behavior, Tailwind `Layouts/Vue` for shell alignment where needed.
- **Pages/Reference Screens** — Captured-route HTML (Bootstrap/Finder); reference-only for structure/copy.
- **Atoms/Reference/Finder** — Bootstrap/Finder atoms vs `docs/reference-markup/`.
- **Foundations** — Tokens / type scale for dark theme.
- **Directory UI kit** — Atoms through organisms (`Atoms/Directory/*`, `Molecules/Directory/*`, `Organisms/Directory/*`, list states). Shared helpers: `stories/directoryKit.js`, `legacyVueLayoutKit.js`.
  - Legacy checklist (optional): `docs/LEGACY-DIRECTORY-PARITY-CHECKLIST.md`
  - Component notes: `docs/DIRECTORY-PRELINE-COMPONENTS.md`

## Build static Storybook

```bash
pnpm run build-storybook
```

Output goes to `storybook-static/`.
