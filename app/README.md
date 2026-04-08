# DBT Search — Vue app

Vue 3 + Vite + Vue Router + Tailwind CSS. Preline is loaded for future interactive components. The **splash** flow uses `public/data/dbt-providers.json`; the **directory** flow uses Craft GraphQL with a JSON fallback via `useProvidersQuery`.

### Design parity (Tailwind-first)

We do **not** aim for pixel-perfect match to the captured **Bootstrap/Finder** HTML in `docs/reference-markup/`. That capture is a useful **structure and copy** reference. The shipped UI targets **close visual parity** using Tailwind in the Vue app (`app/src/components/directory/*`).

**Workflow:** refine layout and components in Storybook’s **Tailwind** stories (especially **`Layouts/Vue/LegacyContent`** and directory-related stories), then mirror tokens, spacing, and structure in Vue. Treat Finder/Bootstrap Storybook stories (`Pages/Reference Screens`, etc.) as a secondary check against the legacy capture, not a second implementation to match exactly.

## Run

```bash
cd app
pnpm install
pnpm run dev
```

Dev server defaults to the port Vite prints (often `http://localhost:5173`).

## Routes

| Path | View | Notes |
|------|------|--------|
| `/` | `SplashPageView` | Marketing / intake form |
| `/directory` | `DirectoryPageView` | Provider list + filters (`/providers` redirects here) |
| `/about` | `AboutPageView` | Legacy chrome + reference copy |
| `/faqs` | `FaqsPageView` | Placeholder (“Coming soon…”) |
| `/contact` | `ContactPageView` | Placeholder |
| `/login` | `LoginPageView` | Form shell (auth not wired) |
| `/register` | `RegisterPageView` | Form shell |
| `/logout` | `LogoutPageView` | Thank-you + link to login |
| `/admin` | `AdminPageView` | Stub |

`router.afterEach` sets `document.title` to `{route.meta.title} · DBTsearch`.

## Layout building blocks

Shared **inner pages** (about, contact, FAQs, login, etc.) use:

- **`LegacyContentLayout.vue`** — `LegacyHeader` → `LegacyPageHeader` → main (`max-w-3xl` column) → `LegacyFooter`
- **`LegacyPageHeader.vue`** — Hero image strip + title row; **`omitSubheading`** for single-column titles (e.g. Contact, Logout)
- **`DirectoryPageView.vue`** — Same header/footer/page-header pattern with `DirectoryFilters` + `ProviderList`

## Structure (selected)

| Path | Role |
|------|------|
| `src/views/*.vue` | Route-level pages |
| `src/components/directory/LegacyContentLayout.vue` | Shell for content pages |
| `src/components/directory/LegacyHeader.vue` | Nav + logo |
| `src/components/directory/LegacyPageHeader.vue` | Hero + H1 / optional H2 |
| `src/components/directory/LegacyFooter.vue` | Attribution + copyright |
| `src/components/directory/ProviderCard.vue` | Provider row card |
| `src/components/directory/ProviderList.vue` | List + empty state |
| `src/composables/useProvidersQuery.ts` | Providers fetch + fallback |

## GraphQL (Craft)

Create `app/.env` when connecting to Craft:

```bash
VITE_CRAFT_GRAPHQL_ENDPOINT=https://<craft-site>/api
VITE_CRAFT_GQL_TOKEN=<token-if-required>
```

If GraphQL fails, the composable falls back to `public/data/dbt-providers.json`.

## Relation to `frontend/` (Storybook)

| Surface | Purpose |
|---------|---------|
| **`frontend/`** | Storybook: **primary** — Tailwind layout + directory UI (`Layouts/Vue/LegacyContent`, `Pages/DirectoryPageView`, organisms). **Secondary** — Bootstrap/Finder reference screens vs `docs/reference-markup/` (structure/copy check). |
| **`app/`** | Production Vue app — implement what you lock in the Tailwind Storybook stories. |

**Order of operations:** Storybook (Tailwind) → Vue under `app/src/components/directory/`.
