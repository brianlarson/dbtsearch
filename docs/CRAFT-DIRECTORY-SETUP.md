# Craft setup — Directory MVP (Providers + Locations)

Copy/paste-ready guide to configure Craft CMS for the directory MVP data model.

## Goal

Model directory data with separate sections:

- **Providers**: organization/provider profile and badges
- **Locations**: physical/contact records

Provider entries relate to one-or-more location entries.

> Use Craft's built-in `dateUpdated` for "Last updated" in the UI.

---

## 1) Create section: Locations

In Craft CP:

1. **Settings → Sections → New section**
2. Set:
   - **Name:** `Locations`
   - **Handle:** `locations`
   - **Type:** Channel
3. Save.

### Location entry fields

Add these fields to the Locations entry type layout:

| Field name     | Handle         | Type                    | Notes |
|----------------|----------------|-------------------------|------|
| Location Name  | `locationName` | Plain Text (single-line)| Optional display label |
| Address        | `address`      | Plain Text              | Street address |
| City           | `city`         | Plain Text              |  |
| State          | `state`        | Plain Text              | e.g. `MN` |
| Zip            | `zip`          | Plain Text              | Keep as text for formatting flexibility |
| Phone          | `phone`        | Plain Text              |  |
| Email          | `email`        | Plain Text              |  |
| Website        | `website`      | Plain Text              | URL string |

---

## 2) Create section: Providers

In Craft CP:

1. **Settings → Sections → New section**
2. Set:
   - **Name:** `Providers`
   - **Handle:** `providers`
   - **Type:** Channel
3. Save.

### Provider entry fields

Add these fields to the Providers entry type layout:

| Field name        | Handle              | Type                 | Notes |
|-------------------|---------------------|----------------------|------|
| Name              | `name`              | Plain Text           | Provider/org display name |
| Availability      | `availability`      | Lightswitch          | Used by default filter |
| DBT-A Certified   | `dbtaCertified`     | Lightswitch          | Badge |
| Provider Logo     | `providerLogo`      | Assets               | Single asset preferred |
| Provider Locations| `providerLocations` | Entries (Relations)  | Source = `Locations` section, allow multiple |

> Keep title enabled or auto-generated; UI reads `name` first and can fall back to title.

---

## 3) GraphQL schema permissions

In Craft CP:

1. **Settings → GraphQL → Public Schema** (or your chosen schema)
2. Ensure this schema can query:
   - section `providers`
   - section `locations`
   - related fields `providerLocations`, `providerLogo`
3. Save schema permissions.

If using token auth, set in `app/.env`:

```bash
VITE_CRAFT_GRAPHQL_ENDPOINT=https://<craft-site>/api
VITE_CRAFT_GQL_TOKEN=<schema-token>
```

---

## 4) GraphQL smoke query

Run in GraphiQL/Altair/Postman against Craft `/api`:

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

Variables:

```json
{
  "search": null,
  "limit": 50
}
```

---

## 5) App expectations (current)

The Vue app currently expects:

- provider list query from `providers`
- relation field `providerLocations` (or fallback `locations`)
- location contact fields on the related entries
- `dateUpdated` from provider entry

In the UI:

- badges come from provider booleans
- address/contact render from the **first related location**
- "Last updated" renders from provider `dateUpdated`

---

## 6) Quick content QA checklist

- [ ] Provider with 1 location renders full card details
- [ ] Provider with multiple locations still renders first location cleanly
- [ ] Provider with no website/email hides those buttons
- [ ] Availability toggle works
- [ ] Search by provider name works
- [ ] Last updated shows date (not "Unknown")
