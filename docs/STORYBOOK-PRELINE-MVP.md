# Storybook, Preline, and MVP

## Splash and directory UI

**`frontend/`** — Storybook with HTML renderer, Tailwind v4, Preline, and theme `themes/dbtsearch.css` (brand `#bbcefd`). Stories cover splash, directory kit, and legacy layout shells.

**Craft templates** — Production UI is rendered by Twig in `templates/` (splash, directory, manage portal). Vite builds in `frontend/` emit CSS/JS assets into `web/`.

**Archived Vue SPA** — The former Vue 3 app is preserved on branch `archive/develop-vue-spa`.

**MVP approach:** Storybook in `frontend/` is the design surface; lock layout and tokens there, then apply in Craft templates and run `pnpm run build:directory` (or splash) to refresh compiled assets.

## Preline themes

- **`frontend/src/index.css`** imports Preline base theme and **`themes/dbtsearch.css`**, which overrides `--primary` (and related vars) to your brand color.
- Any Tailwind utility that uses the theme (e.g. `bg-primary`, `ring-primary`) will use that value. So “redesign with Preline” here means: use **semantic tokens** (`primary`, `primary-foreground`, etc.) instead of one-off classes like `bg-brand`, so future theme or dark-mode changes flow through.

## Atomic design (light touch for MVP)

- **Don’t** introduce a big folder hierarchy or many tiny components until you have a second page or clear reuse.
- **Do** think in layers when you write stories:
  - **Pages:** Splash Page (full layout).
  - **Organisms:** Header, Hero + form block, Footer — only extract when you reuse them or add another page.
  - **Molecules:** Form field (label + input), Provider dropdown — extract when you use them in more than one place.
  - **Atoms:** Logo, Button, Input — extract when you need variants or reuse across pages.
- You can add a **Form only** (or **Splash form**) story in Storybook that renders just the form block. That gives you an “organism”-level view without splitting code yet. When you later add a second page or a shared form, then split into components and add more atomic stories.

## Summary

| Goal | MVP move |
|------|----------|
| Splash redesigned with Preline in Storybook | Use Preline theme tokens in the existing splash story; keep logo, colors, image. |
| One source of truth | Storybook (`frontend/`) → Craft Twig templates + Vite builds into `web/`. |
| Atomic design | Use atomic *naming* in Storybook (Pages / …, Organisms / …); extract components only when reuse or a second page justifies it. |
