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
| Source Location ID | `sourceLocationId` | Plain Text (single-line) | Stable external key for imports/upserts; use this as Feed Me match field |
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

---

## 7) Feed Me mapping for location titles

When your source provides full address plus split city/state/zip fields:

- Map source `Street Address` (or derived street line) -> Craft entry `title` (Location title should be street-only)
- Map source `City` -> `city`
- Map source `State` -> `state`
- Map source `Zip` / `ZIP` -> `zip`
- Map JSON `sourceLocationId` -> Craft field **Source Location ID** (`sourceLocationId`)

### `sourceLocationId` (immutable match key)

The handle is **`sourceLocationId`** (not `sourceLoctionId`).

For `mn-dbt-providers.json`, `npm run imports:mn-providers` injects `sourceLocationId` on every row: **64-character hex SHA-256** of UTF-8 data built from, in order: `Provider Name`, `Full Address (DHS)`, `City`, `State`, `ZIP` (each trimmed, joined by a unit separator). Changing any of those in the source changes the id (same as changing the real-world row identity).

**Feed Me (Locations feed):**

1. Apply project config so the Location entry type has the **Source Location ID** field.
2. **Field mapping:** map the JSON attribute `sourceLocationId` to the Craft field `sourceLocationId`.
3. **Matching / duplicates:** set the feed to **update** existing entries, and set **match existing elements on** / **unique identifier** to **`sourceLocationId`** (the plain text field), not Title.

If you already have Location entries **without** `sourceLocationId` populated, the first import matched only on `sourceLocationId` will not find them and may create duplicates. Fix by one-time backfilling `sourceLocationId` on existing rows (same hash as in JSON) or running a one-off match strategy; after every location has the field set, matching on `sourceLocationId` is safe.

Use Feed Me matching on `sourceLocationId`, not title, so title and address formatting can change without breaking upserts.

To clean old entries that still include city/state/zip in the title:

```bash
cd cms
php craft sync/sync/normalize-location-titles
php craft sync/sync/normalize-location-titles --dry-run=0
```

Then rerun Feed Me with the new mapping, and refresh provider-location rollups if needed:

```bash
php craft sync/sync/provider-locations
```

---

## 8) Import files (`cms/web/imports`)

Provider rows for Feed Me (and manual edits) live as JSON under `cms/web/imports/`. Regenerate from the CSV when the sheet changes:

```bash
npm run imports:mn-providers
```

That writes `cms/web/imports/mn-dbt-providers.json` (array of objects: CSV columns plus leading `sourceLocationId`). Source CSV path: `cms/web/imports/mn_dbt_providers_final.csv`. Point Feed Me at the JSON URL path `/imports/mn-dbt-providers.json` on your Craft site, or upload the file in the CP.
