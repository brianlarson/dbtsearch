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
4. **Form Template:** In **Formie → Settings → Form Templates**, create a new template (e.g. "Splash"). Enable **Use Custom Template** and set **HTML Template** to `_forms/splash`. Disable Formie’s base and theme CSS (the splash page uses its own styles). Assign this form template to the `splashSignup` form in **Formie → Forms → splashSignup** (form settings).
5. In the form settings, leave **Redirect** unset so the template’s `redirectInput` is used: after submit users are sent back to the same page with `?signedup=1`, the success message is shown, and the form is hidden.
6. Configure **Email Notifications** (e.g. notify you on submit) and **Spam** (honeypot or reCAPTCHA) as needed.

**Local email (Mailpit):** When Craft is in dev mode, the app mailer is overridden to use SMTP to Mailpit so Formie notifications and system email are captured locally. With DDEV, Mailpit is built-in: run `ddev mailpit` (or `ddev launch -m`) to open the Mailpit UI. The project’s `.ddev/craft-mysql.env.web` already sets `MAILPIT_SMTP_HOSTNAME=127.0.0.1` and `MAILPIT_SMTP_PORT=1025`. Without DDEV, run Mailpit locally and set those env vars in `cms/.env` (or rely on the defaults 127.0.0.1:1025 in `config/app.php`).

For **provider_listing**, use either an **Agree** field (put the label text in Description and leave Label empty to match Storybook) or **Checkboxes** with one option.

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
