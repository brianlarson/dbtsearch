# Splash Page — Craft Single section

The splash/landing page is driven by a **Single** section in Craft named **Splash Page**. The frontend (Storybook and later Nuxt) reads its fields for heading, tagline, form heading, and submit button label.

## Create the section in Craft

1. In the Craft admin go to **Settings → Sections**.
2. Click **New section**.
3. Set:
   - **Name:** `Splash Page`
   - **Handle:** `splashPage` (auto-generated from name)
   - **Section type:** **Single**
4. Under **Site-specific settings** (e.g. DBT Search), set:
   - **URL format:** `` (leave empty so the single is the homepage, or use `splash` if you prefer a `/splash` URL)
   - **Template:** `splash/index` (or your chosen template path when you add Twig)
5. Save the section.

## Add fields to the entry type

1. Go to **Settings → Sections → Splash Page**.
2. Open the **Entry types** tab and edit the default entry type (or the only one).
3. Add these **Fields** to the layout (Plain Text or Short Text is fine):

| Field name   | Handle        | Notes                    |
|-------------|---------------|--------------------------|
| Heading     | `heading`     | Main H1                  |
| Tagline     | `tagline`     | Subtext under heading    |
| Form heading| `formHeading` | Title above the form     |
| Submit label| `submitLabel` | Button text              |

The **provider** field in the form is a dropdown, not a Craft field—it is populated from the legacy providers data in the frontend (Storybook uses `data/dbt-providers.json`; the live app would use an API or Craft entries).

4. Save the entry type.

## Edit content

- Go to **Entries → Splash Page** (or **Singles → Splash Page** depending on your Craft version).
- Edit the single entry and set heading, tagline, form heading, and submit label. The frontend form (name, email, provider dropdown) is fixed in markup; the **provider** field is a `<select>` whose options are populated from the legacy providers list (e.g. `data/dbt-providers.json` or an API that reads the legacy DB). This entry only controls the surrounding copy.

## Storybook

The splash page markup and Tailwind styles live in **frontend/stories/SplashPage.stories.js**. Stories use the same field names as args (`heading`, `tagline`, `formHeading`, `submitLabel`) so you can mirror Craft content in Storybook.
