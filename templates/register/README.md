# Provider signup form setup

The provider onboarding page is live at **`/register`**. This URL is **not linked in site navigation** — share it privately with provider reps (email, onboarding doc, etc.).

## Formie form (required)

1. In Craft CP go to **Formie → Forms** and create a new form.
2. Set the form **handle** to `providerSignup`.
3. Add these fields **in this order**:
   - **fullName** — Single Line Text, required
   - **email** — Email, required
   - **providerListing** — Entries, required, single selection, display as **Dropdown**, source **Providers** section only
   - **password** — Password, required
   - **confirmPassword** — Password, required, enable **Match Field** → `password`
4. **Form Template:** Assign the **Register** template (`_forms/register`) to this form. Disable Formie base/theme CSS on the template (the page uses site styles from `directory.css`).
5. **Submit Action:** Redirect to URL (the portal module overrides this to `/manage/login?registered=1` with email/listing params after successful signup).
6. Configure **Spam** (honeypot and/or reCAPTCHA) as needed.
7. Optional **Email Notifications** to notify staff when a provider claims a listing.

Until this form exists, the template shows setup instructions.

## What happens on submit

1. Formie validates the submission (including unclaimed-listing checks).
2. The portal module creates a Craft user, assigns the **Provider** group, and links the user to the selected listing.
3. The user is redirected to **Manage Login** with a success message.

## Private signup URL for outreach

Use your site base URL plus `/register`, for example:

`https://dbtsearch.ddev.site/register`

Do not add this link to the public site header or login page.

## Local email (Mailpit)

When Craft is in dev mode, Formie notifications are captured in Mailpit. With DDEV: `ddev mailpit` or `ddev launch -m`.
