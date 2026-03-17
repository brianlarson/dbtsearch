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

The directory MVP route is at `/directory`.

## Structure

- **`src/components/SplashPage.vue`** — Splash layout and form (props: `heading`, `tagline`, `formHeading`, `submitLabel`, `providers`)
- **`src/views/SplashPageView.vue`** — Fetches `/data/dbt-providers.json`, dedupes by name, passes to `<SplashPage />`
- **`src/router/index.ts`** — Routes: `/` (splash), `/directory` (directory MVP scaffold)
- **`src/views/DirectoryPageView.vue`** — Directory page scaffold (legacy-inspired layout)
- **`src/components/directory/*`** — Filters, list, and provider card components
- **`src/composables/useProvidersQuery.ts`** — Craft GraphQL query + local JSON fallback
- **`public/images/`** — Logo and hero image
- **`public/data/dbt-providers.json`** — Provider list for the dropdown

## GraphQL env variables (for Craft)

Set these in `app/.env` when connecting to Craft:

```bash
VITE_CRAFT_GRAPHQL_ENDPOINT=https://<craft-site>/api
VITE_CRAFT_GQL_TOKEN=<public-schema-token-if-required>
```

If GraphQL is unavailable, the directory composable falls back to `public/data/dbt-providers.json` for local layout work.

## Relation to `frontend/`

**`frontend/`** is Storybook (HTML + Tailwind v4 + Preline) for markup-only stories. Use it to design layout and copy. This app implements the same UI as Vue components with Tailwind + Preline.
