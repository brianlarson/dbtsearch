# Formie custom form template: Splash

This directory contains Formie template overrides so the splash signup form matches the Storybook design ([frontend/stories/splashPage.js](../../../frontend/stories/splashPage.js)).

## Setup in Craft CP

1. **Formie → Settings → Form Templates** → create new template (e.g. "Splash").
2. Enable **Use Custom Template**, set **HTML Template** to `_forms/splash`.
3. Disable Formie’s **base** and **theme** CSS (splash uses `splash.css` / dbtsearch theme).
4. Optionally use **Copy Templates** once to seed this folder with Formie defaults; the files here override only what’s needed.
5. **Formie → Forms → splashSignup** → Form Template: select "Splash".

## Overrides

- **field.html** — Minimal wrapper (label + input block + errors), no Formie `fieldtag` classes.
- **_includes/label.html** — Storybook label classes and “(optional)” for non-required fields.
- **fields/single-line-text.html**, **fields/email.html** — Single input with Storybook input classes.
- **fields/agree.html**, **fields/checkboxes.html** — Single-checkbox layout with Storybook checkbox/label classes.
