# Splash page setup

The splash template is live at the site homepage. To finish setup:

## Formie form (required for the signup form)

1. In Craft CP go to **Formie → Forms** and create a new form.
2. Set the form **handle** to `splashSignup`.
3. Add these fields **in this order** (so layout matches):
   - **name** — Single Line Text, required
   - **organization** — Single Line Text, optional
   - **email** — Email, required
   - **provider_listing** — Checkbox (label: "I'm a certified provider interested in being listed")
4. In the form settings, you can leave **Redirect** unset; the template redirects to the same page with `?signedup=1` and shows the success message.
5. Configure **Email Notifications** (e.g. notify you on submit) and **Spam** (honeypot or reCAPTCHA) as needed.

Until this form exists, the template shows a short message asking you to create it.

## Optional: editable content from Craft

To let editors change heading, tagline, copy, and form labels without editing Twig:

1. Create a **Single** section (e.g. "Splash" or "Home") with handle `splash`.
2. Add these fields to the entry type (handles in parentheses):
   - `splashHeading` — Plain Text
   - `splashTagline` — Plain Text
   - `splashCopy` — Plain Text or Redactor (HTML allowed)
   - `splashFormHeading` — Plain Text
   - `splashSubmitLabel` — Plain Text
   - `splashSuccessMessage` — Plain Text
3. Create the single entry and fill in content. The template will use these values when present.

If no `splash` section or entry exists, the template uses built-in defaults.

## Rebuilding front-end assets

If you change styles or scripts in `frontend/` (e.g. `splash-entry.css`), rebuild:

```bash
cd frontend && npm run build:splash
```

Output goes to `cms/web/css/splash.css` and `splash.min.js`.
