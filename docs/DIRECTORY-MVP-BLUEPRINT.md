# Directory MVP Blueprint (Vue + Craft GraphQL)

This is the implementation blueprint for the **directory MVP** while the splash page remains live.

## Product boundary

- Keep splash live on `/` (Craft Twig).
- Build directory MVP on `/directory` (Vue app).
- Provider data comes from **Craft GraphQL**.
- Match legacy static layout and behavior before adding new UX ideas.

## Data model decision (MVP)

Use separate Craft sections:

- **Providers** (primary profile data):
  - name
  - availability
  - dbtaCertified
  - providerLogo
  - relation field to one-or-many **Locations**
- **Locations** (address/contact records):
  - locationName
  - address
  - city
  - state
  - zip
  - phone
  - email
  - website

Use Craft's built-in `dateUpdated` for "Last updated" display.

## Legacy-inspired wireframes

### 1) Directory page (desktop)

```
[Header / logo]
[Providers]
[DBT Providers in Minnesota]

[ Availability-only toggle ] [ Search by provider name ]
[ Result count ]

-----------------------------------------------------------
| ProviderCard                                             |
| [logo/fallback] [Availability] [DBT-A Certified]         |
|                Name                                       |
|                Address, City ST ZIP                       |
|                Phone                                      |
|                [Website] [Email]   Last updated: date     |
-----------------------------------------------------------
...repeat cards
```

### 2) Directory page (mobile)

```
[Header]
[Title + subheading]
[Availability toggle]
[Search]
[Result count]
[Stacked ProviderCard list]
```

### 3) Empty/error/loading states

```
Loading: skeleton or loading text for card region
Error: one-line failure + retry
Empty: "No providers match your filters" + reset filters button
```

## Vue component map

### Route-level

- `src/views/DirectoryPageView.vue`
  - Owns page state:
    - `searchTerm`
    - `onlyAvailable`
  - Calls `useProvidersQuery()`
  - Handles loading/error/empty states

### Presentational

- `src/components/directory/DirectoryFilters.vue`
  - Availability toggle
  - Search input
  - Results count

- `src/components/directory/ProviderList.vue`
  - Renders list of provider cards
  - Renders empty-state and reset action

- `src/components/directory/ProviderCard.vue`
  - Card layout that replicates legacy list item shape
  - Availability and certification badges
  - Address/contact/action links
  - Last updated

### Data/composable

- `src/composables/useProvidersQuery.ts`
  - Encapsulates Craft GraphQL call
  - Maps API shape into `Provider` model
  - Applies client-side fallback and filtering for MVP reliability

- `src/types/provider.ts`
  - Shared TypeScript interfaces for the directory

## GraphQL contract (MVP)

Data model decision:

- `providers` = one entry per provider/organization
- `locations` = one entry per physical location/contact record
- Provider entries relate to one-or-more location entries via a relation field (recommended handle: `providerLocations`)
- "Last updated" should use Craft's built-in entry date (`dateUpdated`) for provider entries

### Query

```graphql
query DirectoryProviders($search: String, $limit: Int) {
  entries(section: ["providers"], limit: $limit, search: $search) {
    ... on providers_default_Entry {
      id
      title
      name
      availability
      dbtaCertified
      dateUpdated
      providerLocations {
        ... on locations_default_Entry {
          id
          title
          locationName
          address
          city
          state
          zip
          phone
          email
          website
        }
      }
      providerLogo {
        url
      }
    }
  }
}
```

### Provider model used by Vue

```ts
type Provider = {
  id: string
  name: string
  availability: boolean
  dbtaCertified: boolean
  imageUrl: string
  updatedAt: string
  locations: {
    id: string
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    email: string
    website: string
  }[]
}
```

## ENV contract for frontend

Add to `app/.env` when wiring Craft:

```bash
VITE_CRAFT_GRAPHQL_ENDPOINT=https://<craft-site>/api
VITE_CRAFT_GQL_TOKEN=<public-schema-token-if-required>
```

For local MVP development before Craft provider fields are complete, the composable can fallback to `public/data/dbt-providers.json`.

## Definition of done (MVP layout + data pass)

- `/directory` route renders with legacy-aligned card structure.
- Availability toggle defaults to ON and updates list.
- Search by name updates list.
- Optional fields (website/email/logo) gracefully hide when missing.
- Provider entries resolve one-or-more related location entries from Craft GraphQL.
- Card address/contact values are derived from the provider's primary (first) location relation.
- Loading, empty, and error states are visible and testable.
- Splash route (`/`) remains unchanged.
