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
| Availability   | `availability` | Lightswitch             | Per location; parent provider is “available” in search if **any** linked location is on |

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
| DBT-A Certified   | `dbtaCertified`     | Lightswitch          | Badge |
| Provider Logo     | `providerLogo`      | Assets               | Single asset preferred |
| Provider Locations| `providerLocations` | Entries (Relations)  | Source = `Locations` section, allow multiple |

### User group: Provider editors

- **Handle:** `providerEditors`
- **Purpose:** Assign provider reps here, then grant them the minimum CP permissions needed for the alpha/beta workflow. For MVP, keep strict per-entry scoping manual; future self-service can add user-managed locations plus an element permission plugin or small custom module.

> **Model:** One **provider** entry = one organization. **Availability** lives on each **location** so multi-site clinics can differ by office. The user group is just a role bucket; future location-specific editor scoping should live on users, not Providers.

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
          availability
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

- badges: **DBT-A certified** from provider; **availability** is true if **any** related location has `availability` on
- address/contact render from the **first related location**
- "Last updated" renders from provider `dateUpdated`

---

## 6) Quick content QA checklist

- [ ] Provider with 1 location renders full card details
- [ ] Provider with multiple locations still renders first location cleanly
- [ ] Provider with no website/email hides those buttons
- [ ] Availability filter respects per-location lightswitches (provider shows if any location is on)
- [ ] Search by provider name works
- [ ] Last updated shows date (not "Unknown")
