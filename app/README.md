# DBT Search — Vue app (stack-rewrite)

Vue 3 + Vite + Vue Router front end. Tailwind CSS and Preline UI for the splash page. Content will come from Craft CMS (GraphQL) later; for now the provider dropdown uses `public/data/dbt-providers.json`.

## Stack

- **Vue 3** — components and reactivity
- **Vite** — build and dev server
- **Vue Router** — routing (single route: `/` → splash)
- **Tailwind CSS** — styling; brand color `#bbcefd` in `tailwind.config.js`
- **Preline UI** — component library (loaded in `src/main.ts`)

## Run

```bash
cd app
npm install
npm run dev
```

Open http://localhost:3000. The splash page (name, email, provider dropdown) is at `/`.

## Structure

- **`src/components/SplashPage.vue`** — Splash layout and form (props: `heading`, `tagline`, `formHeading`, `submitLabel`, `providers`)
- **`src/views/SplashPageView.vue`** — Fetches `/data/dbt-providers.json`, dedupes by name, passes to `<SplashPage />`
- **`src/router/index.ts`** — One route: `/` → `SplashPageView`
- **`public/images/`** — Logo and hero image
- **`public/data/dbt-providers.json`** — Provider list for the dropdown

## Relation to `frontend/`

**`frontend/`** is Storybook (HTML + Tailwind v4 + Preline) for markup-only stories. Use it to design layout and copy. This app implements the same UI as Vue components with Tailwind + Preline.
