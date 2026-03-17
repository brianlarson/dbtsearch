# DBT Search — Frontend (Storybook + Tailwind + Preline)

Markup and UI stories for the stack-rewrite frontend. Uses **Storybook** (HTML), **Tailwind CSS v4**, and **Preline UI** with a custom theme so the brand color (`#bbcefd`) is used as the primary.

## Run Storybook

```bash
cd frontend
npm install
npm run storybook
```

Open http://localhost:6006. Logo and hero image are in `frontend/public/images/` (copied from repo `public/images/` so Storybook can serve them at `/images/`).

## Stack

- **Tailwind CSS v4** — via `@tailwindcss/vite`; config is in `src/index.css` (no `tailwind.config.js`).
- **Preline UI** — components and variants; base theme + **DBT Search theme** in `themes/dbtsearch.css` (sets `--primary` and `--color-brand` to `#bbcefd`).
- For interactive Preline components (dropdowns, modals, etc.) in a real app, add `<script src="node_modules/preline/dist/preline.js"></script>` (or the bundled equivalent) so their JS runs.

## Stories

- **Pages/Splash Page** — Landing/splash page with form fields: name, email, provider name. Content (heading, tagline, form heading, submit label) is driven by Craft Single section “Splash Page”; see `docs/SPLASH-PAGE-CRAFT.md`.
- **Directory UI kit (atomic-style)** — Directory MVP stories:
  - `Atoms/Buttons & Badges`
  - `Atoms/Form Controls`
  - `Molecules/Directory Filters`
  - `Organisms/Provider Card`
  - `Organisms/List States`
  - `Pages/Directory Layout`
  Shared render helpers live in `stories/directoryKit.js`. See `docs/DIRECTORY-PRELINE-COMPONENTS.md` for the component roundup.

## Build static Storybook

```bash
npm run build-storybook
```

Output goes to `storybook-static/`.
