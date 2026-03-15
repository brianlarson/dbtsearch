# Storybook, Preline, and MVP

## Next logical step: Splash in Storybook with Preline

You have two places the splash page can live:

1. **`frontend/`** — Storybook with HTML renderer, Tailwind v4, Preline, and theme `themes/dbtsearch.css` (brand `#bbcefd`). One story: **Pages / Splash Page**.
2. **`app/`** — Vue app with the same layout in `src/components/SplashPage.vue` (Tailwind v3 + Preline).

**MVP approach:** Prefer **one source of truth** so you don’t maintain two UIs.

- **Option A (recommended for MVP):** Treat the **Vue app as the source of truth**. Add Vue Storybook inside `app/` and document `SplashPage.vue` (and any subcomponents) there. Design and implementation stay in sync; no duplicate HTML.
- **Option B:** Keep **design in `frontend/`** (HTML stories). Use Storybook to get the layout and copy right with Preline + your theme, then mirror that in the Vue app when you’re happy. More duplication, but clear separation between design and implementation.

For “get it looking peachy in Storybook with Preline”:

- **If you stay in `frontend/`:** Use Preline’s **theme tokens** for accents (e.g. `bg-primary`, `text-primary-foreground`, `focus:ring-primary`) so the splash is clearly Preline-themed. Keep logo, color scheme (`dbtsearch.css`), and hero image; only form/button styling goes through Preline semantics.
- **If you add Vue Storybook in `app/`:** Reuse the same Tailwind + Preline + theme there so what you see in Storybook matches the app.

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
| One source of truth | Prefer Vue Storybook in `app/` documenting `SplashPage.vue`, or accept two sources (frontend = design, app = implementation). |
| Atomic design | Use atomic *naming* in Storybook (Pages / …, Organisms / …); extract components only when reuse or a second page justifies it. |
